/*import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ChatInterface({ repoUrl, token }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;

    const currentQuestion = question;
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5050/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ repoUrl, question: currentQuestion }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { question: currentQuestion, answer: data.answer, sources: data.sources || [] },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { question: currentQuestion, answer: "Something went wrong. Please try again.", sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className=" w-full max-w-2xl mx-auto flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {messages.map((msg, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="pixel-bubble-user p-3 self-end max-w-[80%] ml-auto font-mono text-sm">
              {msg.question}
            </div>
            <div className="pixel-bubble-answer p-3 max-w-[80%] whitespace-pre-wrap font-mono text-sm">
              {msg.answer}
            </div>
            {msg.sources.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {msg.sources.map((source, i) => (
                  <span key={i} className="pixel-pill text-xs px-2 py-1">
                    {source.fileName}:{source.startLine}-{source.endLine}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="pixel-bubble-answer p-3 max-w-[80%] italic font-mono text-sm">
            HUNTING THROUGH THE CODE...
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="e.g. Where is authentication handled?"
          className="pixel-input text-white flex-1"
        />
        <Button onClick={handleAsk} disabled={loading || !question.trim()} className="pixel-button-blue">
          FIRE AWAY
        </Button>
      </div>
    </div>
  );
}

export default ChatInterface;*/

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ChatInterface({ repoUrl, token, onBack }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;

    const currentQuestion = question;
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ repoUrl, question: currentQuestion }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { question: currentQuestion, answer: data.answer, sources: data.sources || [] },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { question: currentQuestion, answer: "Something went wrong. Please try again.", sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-slate-400 text-xs font-mono hover:text-pink-300"
        >
          ← MY REPOS
        </button>
        <span className="text-slate-500 text-xs font-mono truncate max-w-[60%]">
          {repoUrl.replace("https://github.com/", "")}
        </span>
      </div>

      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {messages.map((msg, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="pixel-bubble-user p-3 self-end max-w-[80%] ml-auto font-mono text-sm">
              {msg.question}
            </div>
            <div className="pixel-bubble-answer p-3 max-w-[80%] whitespace-pre-wrap font-mono text-sm">
              {msg.answer}
            </div>
            {msg.sources.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {msg.sources.map((source, i) => (
                  <span key={i} className="pixel-pill text-xs px-2 py-1">
                    {source.fileName}:{source.startLine}-{source.endLine}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className=" pixel-tag pixel-bubble-answer p-3 max-w-[80%] italic font-mono text-sm">
            HUNTING THROUGH THE CODE...
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="e.g. Where is authentication handled?"
          className="pixel-input text-white flex-1"
        />
        <Button onClick={handleAsk} disabled={loading || !question.trim()} className="pixel-button-blue">
          FIRE AWAY
        </Button>
      </div>
    </div>
  );
}

export default ChatInterface;