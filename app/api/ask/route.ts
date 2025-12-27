import { embedText } from "@/lib/embedding";
import { streamAnswer } from "@/lib/openai";
import { retrieveTopChunks } from "@/lib/retrieve";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { inquiry } = await req.json();

    if (!inquiry || !inquiry.trim()) {
      return NextResponse.json(
        { error: "Inquiry is required" },
        { status: 400 }
      );
    }

    const queryEmbedding = await embedText(inquiry);

    const similarEmbeddings = retrieveTopChunks(queryEmbedding);

    const context = similarEmbeddings.map(c => c.chunk.text).join("\n\n");

    const prompt = `
        Context:
        ${context}

        Question:
        ${inquiry}
    `;

    // Stream the response to the frontend
    const encoder = new TextEncoder();

    

//   const stream = new ReadableStream({
//     async start(controller) {
//       try {
//         controller.enqueue(encoder.encode("Chunk 1\n"));
//         await new Promise(r => setTimeout(r, 1000));
//         controller.enqueue(encoder.encode("Chunk 2\n"));
//         await new Promise(r => setTimeout(r, 1000));
//         controller.enqueue(encoder.encode("Chunk 3\n"));
//       } finally {
//         controller.close();
//       }
//     },
//   });

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
        controller.enqueue(encoder.encode("\n[Error communicating with OpenAI]\n"));
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

