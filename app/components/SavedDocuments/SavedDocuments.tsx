import React, { useEffect, useState } from "react";
import { Doc } from "@/lib/types";
import { toast } from "sonner";

const fmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
});

type PageProps = {
  setCurrDoc: React.Dispatch<React.SetStateAction<Doc | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setDocs: React.Dispatch<React.SetStateAction<Doc[]>>;
  fetchDocs: () => Promise<void>;
  docs: Doc[];
};

const SavedDocuments = ({
  setCurrDoc,
  setLoading,
  fetchDocs,
  setDocs,
  docs,
}: PageProps) => {
    
  useEffect(() => {
    fetchDocs();
  }, []);
  const handleDelete = async (docToDelete: Doc) => {
    try {
      const res = await fetch(`/api/docs/${docToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      console.log("Delete response:", data);
      if (res.ok) {
        toast(`${docToDelete.title} deleted`);
        setDocs((prevDocs) => prevDocs.filter((doc) => doc.id !== docToDelete.id));
      } else {
        toast.error(`Failed to delete ${docToDelete.title}`);
      }
      setCurrDoc(data.savedDoc || null);
    } catch (err) {
      toast(`Error deleting ${docToDelete.title}`);
    }
  };
  const handleDeleteAll = async () => {
    try {
      const res = await fetch(`/api/docs`, {
        method: "DELETE",
      });
      const data = await res.json();
      console.log("Delete response:", data);
      if (res.ok) {
        toast("Files deleted successfully");
        setDocs([]);
      } else {
        toast.error("Failed to delete files");
      }
      setCurrDoc(data.savedDoc || null);
    } catch (err) {
      toast.error("Error deleting files");
    }
  };

  return (
    <>
      {docs && (
        <section className="w-full max-w-xl border rounded-xl p-4 space-y-4 flex flex-col">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-xl">3. Saved Documents</h2>
            <button
              className="hover:cursor-pointer px-4 py-2 rounded-lg border hover:bg-gray-200"
              onClick={() => {
                handleDeleteAll();
              }}
            >
              Delete All
            </button>
          </div>
          <li className="grid grid-cols-2 gap-4 align-start">
            {docs.map((doc) => (
              <div className="p-2 border rounded-xl" key={doc.id}>
                <p className="mb-4">{doc.title}</p>
                <p className="mb-4">{doc.preview}</p>
                <p className="mb-4">
                  Uploaded {fmt.format(new Date(doc.created_at))}
                </p>
                <div className="flex justify-between">
                  <button
                    className="hover:cursor-pointer px-2 py-1 rounded-lg border hover:bg-gray-200"
                    onClick={() => {
                      setCurrDoc(doc);
                    }}
                  >
                    Ask Questions
                  </button>
                  <button
                    className="hover:cursor-pointer px-2 py-1 rounded-lg border hover:bg-gray-200"
                    onClick={() => {
                      handleDelete(doc);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </li>
        </section>
      )}
    </>
  );
};

export default SavedDocuments;
