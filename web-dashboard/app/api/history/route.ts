import { NextResponse } from "next/server";
import { readHistory, writeHistory } from "@/lib/files";

export async function GET() {
  const history = readHistory();
  history.reverse();
  return NextResponse.json(history);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, rating, feedback, chosen } = body;

  const history = readHistory() as Record<string, unknown>[];
  const entry = history.find((e) => e.id === id);

  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  if (rating !== undefined) entry.rating = rating;
  if (feedback !== undefined) entry.feedback = feedback;
  if (chosen !== undefined) entry.chosen = chosen;

  writeHistory(history);
  return NextResponse.json(entry);
}
