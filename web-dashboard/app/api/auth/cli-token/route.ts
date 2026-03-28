import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  const body = await request.json();
  const { access_token, refresh_token, user_id } = body;

  if (!access_token || !user_id) {
    return NextResponse.json({ error: "Missing token or user_id" }, { status: 400 });
  }

  // Write token to ~/.claudeboost/auth.json
  const claudeboostDir = path.join(process.env.HOME!, ".claudeboost");
  const authFile = path.join(claudeboostDir, "auth.json");

  if (!fs.existsSync(claudeboostDir)) {
    fs.mkdirSync(claudeboostDir, { recursive: true });
  }

  const authData = {
    access_token,
    refresh_token,
    user_id,
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    created_at: new Date().toISOString(),
  };

  fs.writeFileSync(authFile, JSON.stringify(authData, null, 2));

  return NextResponse.json({ ok: true });
}
