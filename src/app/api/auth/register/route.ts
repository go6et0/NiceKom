import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createEmailVerifyToken, passwordPolicy } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mailer";

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((value) => (value && value.length >= 2 ? value : undefined)),
    email: z.string().trim().email(),
    password: z
      .string()
      .min(8, "PASSWORD_POLICY")
      .max(100, "PASSWORD_POLICY")
      .regex(passwordPolicy, "PASSWORD_POLICY"),
    confirmPassword: z.string().min(8, "PASSWORD_POLICY").max(100, "PASSWORD_POLICY"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "PASSWORD_MISMATCH",
    path: ["confirmPassword"],
  });

async function sendVerificationEmailWithTimeout(
  email: string,
  token: string,
  timeoutMs = 10000
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      sendVerificationEmail(email, token),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("EMAIL_SEND_TIMEOUT"));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function getEmailSendErrorCode(error: unknown) {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (message.includes("email server env vars are not configured")) {
    return "EMAIL_SERVER_NOT_CONFIGURED";
  }

  if (message.includes("domain") && message.includes("verif")) {
    return "EMAIL_DOMAIN_NOT_VERIFIED";
  }

  if (message.includes("timeout") || message.includes("timed out")) {
    return "EMAIL_SEND_TIMEOUT";
  }

  return "EMAIL_SEND_FAILED";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message;
      const error =
        message === "PASSWORD_POLICY" || message === "PASSWORD_MISMATCH"
          ? message
          : "INVALID_INPUT";
      return NextResponse.json({ error }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    const hashed = await hash(password, 10);
    const token = createEmailVerifyToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    if (existing) {
      if (existing.emailVerified) {
        return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          password: hashed,
          emailVerifyToken: token,
          emailVerifyTokenExpires: expires,
        },
      });

      try {
        await sendVerificationEmailWithTimeout(email, token);
      } catch (error) {
        console.error("RegisterResendVerificationEmailError", error);
        const errorCode = getEmailSendErrorCode(error);
        return NextResponse.json({ error: errorCode }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        emailVerifyToken: token,
        emailVerifyTokenExpires: expires,
      },
    });

    try {
      await sendVerificationEmailWithTimeout(email, token);
    } catch (error) {
      console.error("RegisterVerificationEmailError", error);
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);

      const errorCode = getEmailSendErrorCode(error);
      return NextResponse.json({ error: errorCode }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RegisterRouteUnhandledError", error);
    return NextResponse.json({ error: "REGISTER_FAILED" }, { status: 500 });
  }
}
