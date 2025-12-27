import { NextRequest, NextResponse } from "next/server";
import { saveChunks, saveDoc, StoredChunk } from "@/lib/docStore";
import crypto from "crypto";
import { chunkText } from "@/lib/chunkText";
import { embedText } from "@/lib/embedding";

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
        return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const stored: any[] = [];

    for (const file of files) {
        const name = file.name.toLowerCase();
        const isText = name.endsWith(".txt") || name.endsWith(".md");
        if (!isText) continue;

        const text = await file.text();
        const docId = crypto.randomUUID();

        saveDoc({
            id: docId,
            filename: file.name,
            text,
            uploadedAt: new Date().toISOString(),
        });

        const chunkStrings = chunkText(text, { maxChars: 100, minChars: 50, overlapChars: 10 });

        const docChunks: StoredChunk[] = chunkStrings.map((chunk, i) => ({
            id: crypto.randomUUID(),
            docId,
            index: i,
            text: chunk
        }));

        saveChunks(docChunks);
        
        for (const chunk of docChunks) {
            chunk.embedding = await embedText(chunk.text);
        }

        stored.push({
            docId,
            filename: file.name,
            chars: text.length,
            chunks: docChunks.length,
        });


    }



    if (!stored.length) {
        return NextResponse.json(
            { error: "No .txt or .md files found in upload" },
            { status: 400 }
        );
    }

    return NextResponse.json({ ok: true, stored });
}
