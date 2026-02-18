import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { passwordPolicy } from "@/lib/auth";

const resetSchema = z
  .object({
    token: z.string().trim().min(1),
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message;
    const error =
      message === "PASSWORD_POLICY" || message === "PASSWORD_MISMATCH"
        ? message
        : "INVALID_INPUT";
    return NextResponse.json({ error }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: parsed.data.token,
      passwordResetTokenExpires: { gt: new Date() },
    },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 400 });
  }

  const hashed = await hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
    },
  });

  return NextResponse.json({ success: true });
}
