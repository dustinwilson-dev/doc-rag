import "server-only";

import { client } from "@/lib/openai"; // whatever you named it

export async function embedText(text: string) {
    const res = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    });

    return res.data[0].embedding as number[];
}

export async function embedTexts(texts: string[]) {
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  return res.data.map(d => d.embedding as number[]);
}