import { cosineSimilarity } from "@/lib/similarity";
import { listChunksForDoc } from "@/lib/docStore";

export function retrieveTopChunks(
    queryEmbedding: number[],
    opts?: { topK?: number; minScore?: number }
) {
    const topK = opts?.topK ?? 5;
    const minScore = opts?.minScore ?? 0.2;

    const scored = [];

    for (const chunk of listChunksForDoc()) {
        if (!chunk.embedding) continue;

        const score = cosineSimilarity(queryEmbedding, chunk.embedding);
        // if (score >= minScore) {
        //   scored.push({ chunk, score });
        // }
        scored.push({ chunk, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
}
