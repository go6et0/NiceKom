import { NextResponse } from "next/server";
import { verifyEmailWithToken } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Missing token." },
      { status: 400 }
    );
  }

  const verified = await verifyEmailWithToken(token);
  return NextResponse.json({ success: verified });
}
