import PreviousQuestions from "@/app/components/PreviousQuestions/PreviousQuestions";
import { Doc } from "@/lib/types";
import React, { useState } from "react";

type PageProps = {
  currDoc: Doc | null;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const AskQuestions = ({ currDoc, loading, setLoading }: PageProps) => {
  const handleInquiry = async () => {
    if (!inquiry.trim()) return;
    if (!currDoc) {
      alert("Please select a document to ask questions about.");
      return;
    }

    setLoading(true);
    setResponse("");
    setSentInquiry(inquiry);

    let full = "";

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiry, docId: currDoc?.id }),
      });

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        const chunk = decoder.decode(value || new Uint8Array());

        full += chunk;

        setResponse(full);
      }
    } catch (err) {
      setResponse("[Error communicating with the server]");
    } finally {
      setMessages((prev) => [...prev, { inquiry, response: full }]);
      console.log(messages);
      setLoading(false);
    }
  };

  const [inquiry, setInquiry] = useState("");
  const [messages, setMessages] = useState<
    { inquiry: string; response: string }[]
  >([]);
  const [response, setResponse] = useState("");
  const [sentInquiry, setSentInquiry] = useState("");

  return (
    <>
      <section className="w-full max-w-xl border rounded-xl p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">2. Ask questions</h2>
          {currDoc && (
            <span>
              Current document: <strong>{currDoc.title}</strong>
            </span>
          )}
        </div>
        <textarea
          className="w-full border rounded-lg p-2 min-h-20"
          placeholder="Ask something about your docs..."
          value={inquiry}
          onChange={(e) => setInquiry(e.target.value)}
        />
        <div className="flex justify-between">
          <button
            onClick={handleInquiry}
            disabled={loading}
            className="px-4 py-2 rounded-lg border hover:cursor-pointer hover:bg-gray-100"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
          <PreviousQuestions messages={messages} />
        </div>

        {true && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Question</h3>
            <p>{sentInquiry}</p>
          </div>
        )}

        {true && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Response</h3>
            {loading ? (
              <p className="typewriter inline">{response}</p>
            ) : (
              <p>{response}</p>
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default AskQuestions;
