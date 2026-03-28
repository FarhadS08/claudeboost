import { NextResponse } from "next/server";
import { readSettings, writeSettings } from "@/lib/files";

export async function GET() {
  const settings = readSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const body = await request.json();
  writeSettings(body);
  return NextResponse.json({ ok: true });
}
