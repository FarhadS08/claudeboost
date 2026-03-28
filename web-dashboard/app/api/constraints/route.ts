import { NextResponse } from "next/server";
import { readConfig, writeConfig } from "@/lib/files";

export async function GET() {
  const config = readConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const body = await request.json();
  writeConfig(body);
  return NextResponse.json({ ok: true });
}
