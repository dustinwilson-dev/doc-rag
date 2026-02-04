"use client";

import AskQuestions from "@/app/components/AskQuestions/AskQuestions";
import DarkModeToggle from "@/app/components/DarkModeToggle/DarkModeToggle";
import SavedDocuments from "@/app/components/SavedDocuments/SavedDocuments";
import UploadDocuments from "@/app/components/UploadDocuments/UploadDocuments";
import { Doc } from "@/lib/types";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [currDoc, setCurrDoc] = useState<Doc | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  
  const fetchDocs = async () => {
    const res = await fetch("/api/docs");
    const data = await res.json();
    setDocs(data.docs ?? []);
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
      <h1 className="text-3xl font-bold">Doc Chatbot (RAG Practice)</h1>
      <DarkModeToggle />

      {/* Upload section */}
      <UploadDocuments setCurrDoc={setCurrDoc} setDocs={setDocs} />

      {/* Chat section */}
      <AskQuestions
        currDoc={currDoc}
        loading={loading}
        setLoading={setLoading}
      />

      {/* Saved documents section */}
      <SavedDocuments fetchDocs={fetchDocs} docs={docs} setDocs={setDocs} setLoading={setLoading} setCurrDoc={setCurrDoc} />
    </main>
  );
}
