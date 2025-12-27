import "server-only";

import OpenAI from "openai";

export const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function streamAnswer(prompt: string) {
    return client.chat.completions.create({
        model: "gpt-5-nano",
        stream: true,
        messages: [
            { role: "system", content: `You are a helpful assistant. Answer using ONLY the context. If the context contains the answer, answer it directly.` },
            { role: "user", content: prompt },
        ],
    })
}

export async function generateAnswer(prompt: string) {
    return client.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
            { role: "system", content: `You are a helpful assistant. Answer using ONLY the context. If the context contains the answer, answer it directly.` },
            { role: "user", content: prompt },
        ],
    })
}