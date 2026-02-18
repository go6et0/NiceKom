import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  console.error("ClientErrorReport", payload);
  return NextResponse.json({ success: true });
}
