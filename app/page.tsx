"use client";

import Image from "next/image";
import { useState } from "react";
import Chat from "./components/chat/page";
import UploadTxt from "./components/uploadTxt/page";

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [inquiry, setInquiry] = useState("");
  const [sentInquiry, setSentInquiry] = useState("");

  const handleInquiry = async () => {
    if (!inquiry.trim()) return;

    // const userMessage = { role: "user", content: inquiry };
    // setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setSentInquiry(inquiry);
    setInquiry("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiry }),
      });

      if (!res.body) {
        throw new Error("No response body");
      }

      // Prepare for streaming response
      // let assistantMessage = { role: "assistant", content: "" };
      // setMessages(prev => [...prev, assistantMessage]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        const chunk = decoder.decode(value || new Uint8Array());

        setResponse((prev) => prev + chunk);

        // Update the last assistant message with streamed chunk
        // setMessages(prev => {
        //     const updated = [...prev];
        //     // Only update the last assistant message added for this response
        //     const lastIdx = updated.length - 1;
        //     if (updated[lastIdx] && updated[lastIdx].role === "assistant") {
        //         updated[lastIdx] = {
        //             ...updated[lastIdx],
        //             content: updated[lastIdx].content + chunk
        //         };
        //     }
        //     return updated;
        // });
      }
    } catch (err) {
      setResponse("[Error communicating with the server]");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      alert("Please select a .txt or .md file to upload.");
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert(`File uploaded successfully: ${data.stored[0]?.filename}`);
      } else {
        alert(data.error || "Upload failed.");
      }
    } catch (err) {
      alert("Error uploading file.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
      <h1 className="text-3xl font-bold">Doc Chatbot (RAG Practice)</h1>

      {/* Upload section */}
      <section className="w-full max-w-xl border rounded-xl p-4 space-y-4">
        <h2 className="text-xl font-semibold">1. Upload documents</h2>
        <input
          type="file"
          // multiple
          onChange={handleFileChange}
          className="block w-full"
        />
        <button
          onClick={handleUpload}
          className="px-4 py-2 rounded-lg border hover:cursor-pointer hover:bg-gray-100"
        >
          Upload & Index
        </button>
      </section>

      {/* Chat section */}
      <section className="w-full max-w-xl border rounded-xl p-4 space-y-4">
        <h2 className="text-xl font-semibold">2. Ask questions</h2>
        <textarea
          className="w-full border rounded-lg p-2 min-h-20"
          placeholder="Ask something about your docs..."
          value={inquiry}
          onChange={(e) => setInquiry(e.target.value)}
        />
        <button
          onClick={handleInquiry}
          disabled={loading}
          className="px-4 py-2 rounded-lg border hover:cursor-pointer hover:bg-gray-100"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>

        {sentInquiry && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Question</h3>
            <p>{sentInquiry}</p>
          </div>
        )}

        {response && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Response</h3>
            <p>{response}</p>
          </div>
        )}
      </section>
      <button
        onClick={async () => {
          const sid = await fetch("/api/sid");
          const data = await sid.text();
          console.log("Session ID:", data);
        }}
        className="px-4 py-2 rounded-lg border hover:cursor-pointer hover:bg-gray-100"
      >sid test</button>

      <Chat />

      <UploadTxt />
    </main>
  );
}
