import React, { useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const CopyBtn = ({ text }) => {
  const copy = useCallback(() => {
    navigator.clipboard?.writeText?.(text);
  }, [text]);

  return (
    <button
      onClick={copy}
      className="text-xs px-2 py-1 rounded-md bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
    >
      Copy
    </button>
  );
};

const Answers = ({ ans }) => {
  if (ans.type === "q") {
    // User bubble (right)
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] bg-zinc-800 text-white px-4 py-2 rounded-b-2xl rounded-l-2xl shadow">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {ans.text}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  if (ans.type === "a") {
    // AI Answer card (Gemini style)
    return (
      <div className="flex justify-start">
        <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2 bg-zinc-800 border-b border-zinc-800">
            <span className="text-sm font-medium text-zinc-300">Answer</span>
          </div>

          {/* Body */}
          <div className="p-4 text-zinc-200 text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => (
                  <p className="mb-3 leading-relaxed" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc ml-6 mb-3 space-y-1" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal ml-6 mb-3 space-y-1" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-white" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="text-zinc-300" {...props} />
                ),
                // INLINE code
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const raw = String(children).replace(/\n$/, "");

                  if (inline || !match) {
                    return (
                      <code
                        className="bg-zinc-800/80 border border-zinc-700 px-1.5 py-0.5 rounded text-[0.9em]"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  // BLOCK code → Gemini-like sub-card
                  return (
                    <div className="my-3 rounded-xl border border-zinc-800 overflow-hidden">
                      {/* sub-header */}
                      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800 border-b border-zinc-800">
                        <span className="text-xs font-medium text-zinc-300">
                          Code{match[1] ? ` · ${match[1]}` : ""}
                        </span>
                        <CopyBtn text={raw} />
                      </div>

                      {/* highlighted code */}
                      <SyntaxHighlighter
                        language={match[1]}
                        style={oneDark}
                        PreTag="div"
                        wrapLongLines
                        customStyle={{
                          margin: 0,
                          background: "transparent",
                          fontSize: "0.9rem",
                          borderRadius: 0,
                        }}
                      >
                        {raw}
                      </SyntaxHighlighter>
                    </div>
                  );
                },
              }}
            >
              {ans.text}
            </ReactMarkdown>
          </div>

         
        </div>
      </div>
    );
  }

  return null;
};

export default Answers;
