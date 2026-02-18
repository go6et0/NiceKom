import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/mailer";

const requestSchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ success: true });
  }

  const token = createPasswordResetToken();
  const expires = new Date(Date.now() + 1000 * 60 * 30);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetTokenExpires: expires,
    },
  });

  try {
    await sendPasswordResetEmail(user.email, token);
  } catch (error) {
    console.error("RequestPasswordResetEmailError", error);
    return NextResponse.json({ error: "EMAIL_SEND_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
