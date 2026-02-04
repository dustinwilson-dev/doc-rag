import { Doc } from "@/lib/types";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

type PageProps = {
  setCurrDoc: React.Dispatch<React.SetStateAction<Doc | null>>;
  setDocs: React.Dispatch<React.SetStateAction<Doc[]>>;
};

const UploadDocuments = ({ setCurrDoc, setDocs }: PageProps) => {
  const [file, setFile] = useState<File | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("Select a .txt file");

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a .txt or .md file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/docs", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast("File uploaded successfully");
        setDocs((prevDocs) => [data.savedDoc, ...prevDocs]);
      } else {
        toast("Upload failed");
      }
      setCurrDoc(data.savedDoc || null);
    } catch (err) {
      toast("Error uploading file");
    }
  };

  return (
    <>
      <section className="w-full max-w-xl border rounded-xl p-4 space-y-4">
        <h2 className="text-xl font-semibold">1. Upload documents</h2>
        <input
          ref={ref}
          type="file"
          accept=".txt,text/plain"
          //   accept=".pdf,.txt,.md"
          className="sr-only"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setLabel(e.target.files?.[0]?.name ?? "Select a .txt file");
          }}
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm shadow-sm hover-surface focus:outline-none focus:ring-2 focus:ring-black hover:cursor-pointer"
        >
          <span className="truncate">{label}</span>
          <span className="ml-3 rounded px-2 py-1 text-xs border">
            Browse
          </span>
        </button>
        <button
          onClick={handleUpload}
          className="px-4 py-2 rounded-lg border hover:cursor-pointer hover-surface"
          disabled={!file}
        >
          {file ? `Upload ${file.name}` : "Select a file to upload"}
        </button>
      </section>
    </>
  );
};

export default UploadDocuments;
