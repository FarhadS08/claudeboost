import { NextResponse } from "next/server";
import { readSettings, writeSettings } from "@/lib/files";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = readSettings();
  return NextResponse.json(settings, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  writeSettings(body);
  return NextResponse.json({ ok: true });
}
