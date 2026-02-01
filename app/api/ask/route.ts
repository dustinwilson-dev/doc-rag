import { retrieveTopChunks } from "@/lib/db";
import { embedText } from "@/lib/embedding";
import { streamAnswer } from "@/lib/openai";
import { getSessionId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { inquiry, docId } = await req.json();
    let userId = await getSessionId();
    if (!userId) {
      return NextResponse.json({ error: "No user id" });
    }

    if (!inquiry || !inquiry.trim()) {
      return NextResponse.json(
        { error: "Inquiry is required" },
        { status: 400 }
      );
    }

    const queryEmbedding = await embedText(inquiry);

    const similarEmbeddings = await retrieveTopChunks(docId, userId, queryEmbedding);
    if (!similarEmbeddings || similarEmbeddings.length === 0 ) {
      return NextResponse.json(
        { error: "No relevant document chunks found" },
        { status: 400 }
      );
    }

    const context = similarEmbeddings.map((c) => c.content).join("\n\n");

    const prompt = `
        Context:
        ${context}

        Question:
        ${inquiry}
    `;

    // Stream the response to the frontend
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const chatStream = await streamAnswer(prompt);

          for await (const chunk of chatStream) {
            const content = chunk.choices?.[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (e) {
          controller.enqueue(
            encoder.encode("\n[Error communicating with OpenAI]\n")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
