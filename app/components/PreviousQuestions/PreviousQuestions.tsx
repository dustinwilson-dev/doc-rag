import React, { useState } from "react";

type PageProps = {
  messages: { inquiry: string; response: string }[];
};

const PreviousQuestions = ({ messages }: PageProps) => {
  const [showMessages, setShowMessages] = useState(false);
  return (
    <>
      <button
        onClick={() => setShowMessages((prev) => !prev)}
        className="px-4 py-2 rounded-lg border hover:cursor-pointer hover-surface"
      >
        Previous Questions
      </button>
      {showMessages && (
        <div className="border rounded-4xl p-5 w-70 h-100 fixed top-20 right-20 overflow-scroll overflow-x-hidden">
          <p>Previous Questions</p>
          <hr />
          {messages.map((msg, i) => (
            <div key={i} className="border-t p-2">
              <p>
                <strong>Q:</strong> {msg.inquiry}
              </p>
              <p>
                <strong>A:</strong> {msg.response}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PreviousQuestions;
