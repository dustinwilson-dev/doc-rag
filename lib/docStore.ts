import "server-only";

export type StoredDoc = {
    id: string;
    filename: string;
    text: string;
    uploadedAt: string;
};

export type StoredChunk = {
    id: string;
    docId: string;
    index: number;
    text: string;
    embedding?: number[]; // add this
};

const docs = new Map<string, StoredDoc>();
const chunks = new Map<string, StoredChunk>(); // chunkId -> chunk

export function saveDoc(doc: StoredDoc) {
    docs.set(doc.id, doc);
}

export function listDocs() {
    return Array.from(docs.values());
}

export function getDoc(id: string) {
    return docs.get(id);
}

export function saveChunks(newChunks: StoredChunk[]) {
    for (const c of newChunks) chunks.set(c.id, c);
}

export function listChunksForDoc() {
    return Array.from(chunks.values());
}

// export function listChunksForDoc(docId: string) {
//     return Array.from(chunks.values())
//         .filter(c => c.docId === docId)
//         .sort((a, b) => a.index - b.index);
// }
