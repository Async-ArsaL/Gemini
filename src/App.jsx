import { useState, useRef, useEffect } from "react";
import Answers from "./components/Answers";

const App = () => {
  // -------------------- STATE --------------------
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);

  // -------------------- REFS --------------------
  const lastMsgRef = useRef(null);

  // -------------------- ENV VARIABLES --------------------
  const URL = import.meta.env.VITE_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  // -------------------- HANDLERS --------------------
  const askQuestion = async () => {
    if (!question.trim() || loading) return;

    // push question immediately
    setMessages((prev) => [...prev, { type: "q", text: question }]);
    setLoading(true);

    const payload = { contents: [{ parts: [{ text: question }] }] };

    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": API_KEY,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "…";

      // clean
      const clean = text
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .join("\n");

      setMessages((prev) => [...prev, { type: "a", text: clean }]);
      setSessions((prev) => [...prev, { q: question, a: clean }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { type: "a", text: "_(Error while fetching response)_" },
      ]);
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  // enter key
  const onKey = (e) => {
    if (e.key === "Enter") askQuestion();
  };

  // -------------------- AUTO SCROLL --------------------
  useEffect(() => {
    if (lastMsgRef.current) {
      lastMsgRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [messages, loading]);

  // -------------------- UI --------------------
  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-5 bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="hidden md:block col-span-1 bg-zinc-900 border-r border-zinc-800 p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-sm text-zinc-300">2.5 Flash</span>
        </div>

        <h2 className="text-zinc-300 font-semibold mb-2">Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-zinc-500 text-sm">No sessions yet</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s, i) => (
              <button
                key={i}
                className="w-full text-left p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 line-clamp-2"
                title={s.q}
              >
                {s.q}
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* Chat area */}
      <main className="col-span-4 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-200">
            Hello, <span className="text-emerald-400">Async</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base">
            What can I help you with?
          </p>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 hide-scrollbar">
          {messages.map((m, idx) => {
            const isLast = idx === messages.length - 1;
            return (
              <div key={idx} ref={isLast ? lastMsgRef : null}>
                <Answers ans={m} />
              </div>
            );
          })}

          {/* Typing dots */}
          {loading && (
            <div className="flex justify-start" ref={lastMsgRef}>
              <div className="bg-zinc-800 px-4 py-2 rounded-xl text-sm flex items-center gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce [animation-delay:120ms]">
                  ●
                </span>
                <span className="animate-bounce [animation-delay:240ms]">
                  ●
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-950 fixed bottom-0 left-0 right-0 md:static">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-3xl px-3 sm:px-4 py-2">
            <input
              className="flex-1 bg-transparent outline-none placeholder-zinc-500 text-sm sm:text-base"
              placeholder="Ask Gemini"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onKey}
            />
            <button
              onClick={askQuestion}
              className={`px-3 sm:px-4 py-1.5 rounded-2xl text-white text-sm ${
                loading
                  ? "bg-zinc-700 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500"
              }`}
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
