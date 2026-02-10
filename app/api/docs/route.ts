import { NextRequest, NextResponse } from "next/server";
import { createAndSetSessionId, getSessionId } from "@/lib/session";
import { sql } from "@vercel/postgres";
import {
  deleteDocumentByUser,
  getDocumentsByUser,
  insertChunksBulk,
  insertDocument,
} from "@/lib/db";
import { chunkText } from "@/lib/chunkText";
import { embedTexts } from "@/lib/embedding";
import { markdownToText } from "@/lib/markdown";

export async function GET() {
  const userId = await getSessionId();
  if (!userId) {
    return NextResponse.json({ docs: [] });
  }

  const docs = await getDocumentsByUser(userId);
  return NextResponse.json({ docs });
}

export async function POST(req: NextRequest) {
  let userId = await getSessionId();
  if (!userId) userId = await createAndSetSessionId();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  let text = "";

  const name = file.name.toLowerCase();

  if (name.endsWith(".txt")) {
    text = await file.text();
  } else if (name.endsWith(".md")) {
    const md = await file.text();
    text = await markdownToText(md);
  } else if (name.endsWith(".pdf")) {
    throw new Error("Not supporting pdf yet");
  } else {
    throw new Error("Unsupported file type");
  }

  const clean = text.replace(/\s+/g, " ").trim().slice(0, 160) + "...";
  const preview = clean.length > 160 ? clean.slice(0, 160) + "..." : clean;

  const savedDoc = await insertDocument(userId, name, preview);

  const chunkStrings = chunkText(text, {
    maxChars: 100,
    minChars: 50,
    overlapChars: 20,
  });

  const embeddings = await embedTexts(chunkStrings);

  await insertChunksBulk({
    documentId: savedDoc.id,
    chunks: chunkStrings.map((content, i) => ({
      chunkIndex: i,
      content,
      embedding: embeddings[i],
    })),
  });

  //   for (const chunk of chunkStrings) {
  //     chunk.embedding = await embedText(chunk.text);

  return NextResponse.json({ ok: true, savedDoc });
}

export async function DELETE() {
  const userId = await getSessionId();
  if (!userId) {
    return NextResponse.json({ docs: [] });
  }

  const { ok } = await deleteDocumentByUser(userId);

  if (!ok) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
