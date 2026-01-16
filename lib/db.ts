import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// ---------- DOCUMENTS ----------

export async function insertDocument(userId: string, title: string) {
  const [doc] = await sql`
    INSERT INTO documents (user_id, title)
    VALUES (${userId}, ${title})
    RETURNING *;
  `;
  return doc;
}

export async function getDocumentsByUser(userId: string) {
  return await sql`
    SELECT id, title, created_at
    FROM documents
    WHERE user_id = ${userId}
    ORDER BY created_at DESC;
  `;
}

// ---------- CHUNKS ----------

export async function insertChunksBulk(params: {
  documentId: string;
  chunks: { chunkIndex: number; content: string; embedding: number[] }[];
}) {
  const { documentId, chunks } = params;
  if (chunks.length === 0) return;

  const embeddingStrings = chunks.map((c) => `[${c.embedding.join(",")}]`);

  // Bulk insert
  await sql`
    INSERT INTO chunks (document_id, chunk_index, content, embedding)
    SELECT *
    FROM UNNEST(
      ${Array(chunks.length).fill(documentId)}::uuid[],
      ${chunks.map((c) => c.chunkIndex)}::int[],
      ${chunks.map((c) => c.content)}::text[],
      ${embeddingStrings}::vector[]
    );
  `;
}

export async function retrieveTopChunks(
  docId: string,
  userId: string,
  queryEmbedding: number[],
  opts?: { topK?: number; minScore?: number }
) {
  if (queryEmbedding.length === 0) return;

  const embeddingStrings = `[${queryEmbedding.join(",")}]`;

  const topK = opts?.topK ?? 5;
  const minScore = opts?.minScore ?? 0.2;
  
  return await sql`
    SELECT
      c.id,
      c.document_id,
      c.chunk_index,
      c.content,
      (c.embedding <=> ${embeddingStrings}::vector) AS distance
    FROM chunks c
    JOIN documents d ON d.id = c.document_id
    WHERE d.user_id = ${userId}
    AND d.id = ${docId}
    ORDER BY c.embedding <=> ${embeddingStrings}::vector
    LIMIT ${topK};
  `;
}
