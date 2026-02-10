import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createEmailVerifyToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mailer";

const registerSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "EMAIL_EXISTS" },
      { status: 400 }
    );
  }

  const hashed = await hash(password, 10);
  const token = createEmailVerifyToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

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
    await sendVerificationEmail(email, token);
  } catch {
    await prisma.user
      .delete({ where: { id: user.id } })
      .catch(() => undefined);
    return NextResponse.json(
      { error: "EMAIL_SEND_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
