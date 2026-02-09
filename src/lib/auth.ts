import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export function createEmailVerifyToken() {
  return randomBytes(32).toString("hex");
}

export async function verifyEmailWithToken(token: string) {
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token },
  });

  if (!user) return false;

  if (user.emailVerified) return true;
  if (user.emailVerifyTokenExpires && user.emailVerifyTokenExpires < new Date()) {
    return false;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerifyTokenExpires: null,
    },
  });

  return true;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");
  return session;
}
