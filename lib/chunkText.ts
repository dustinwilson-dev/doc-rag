export function chunkText(
    text: string,
    opts?: { maxChars?: number; minChars?: number; overlapChars?: number }
) {
    const maxChars = opts?.maxChars ?? 2000;
    const minChars = opts?.minChars ?? 2000;
    const overlapChars = opts?.overlapChars ?? 200;

    // Normalize newlines
    const cleaned = text.replace(/\r\n/g, "\n").trim();

    // Prefer splitting on paragraphs first
    const parts = cleaned.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);

    const chunks: string[] = [];
    let current = "";

    for (const part of parts) {
        // If adding this paragraph would overflow, flush current
        if (current && (current.length + part.length + 2) > maxChars) {
            chunks.push(current);

            // overlap: keep the tail of the previous chunk
            const tail = current.slice(Math.max(0, current.length - overlapChars));
            current = tail + "\n\n" + part;
        } else {
            current = current ? (current + "\n\n" + part) : part;
        }
    }

    if (current) chunks.push(current);


    // Edge case: single giant paragraph (no paragraph breaks)are you 
    // fall back to slicing
    const finalChunks: string[] = [];
    for (const c of chunks) {
        if (c.length <= maxChars + minChars) {
            finalChunks.push(c);
            continue;
        }
        for (let i = 0; i < c.length; i += (maxChars - overlapChars)) {
            finalChunks.push(c.slice(i, i + maxChars));
        }
    }

    return finalChunks;
}
