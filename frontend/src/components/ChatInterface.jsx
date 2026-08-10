import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ChatInterface({ repoUrl }) {
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
        headers: { "Content-Type": "application/json" },
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
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="flex flex-col gap-1">
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

      <div className="flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="e.g. Where is authentication handled?"
          className="text-white"
        />
        <Button onClick={handleAsk} disabled={loading || !question.trim()} className="pixel-button-blue">
  FIRE AWAY
</Button>
      </div>
    </div>
  );
}

export default ChatInterface;