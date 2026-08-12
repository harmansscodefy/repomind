import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function RepoInput({ onIngestComplete, token }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleIngest() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5050/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      onIngestComplete(data);
    } catch (err) {
      setError("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pixel-card flex flex-col items-center gap-5 max-w-xl mx-auto p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="pixel-heading text-2xl text-white">
          REPO<span className="text-pink-300">MIND</span>
        </h1>
        <p className="pixel-tag text-slate-400 leading-relaxed">
          STOP GREPPING. START ASKING.
        </p>
        <p className="text-slate-500 text-sm max-w-md font-mono">
          Any GitHub repo. Any question. Real answers, straight from the source — with receipts.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          className="pixel-input text-white flex-1"
        />
        <Button onClick={handleIngest} disabled={loading || !repoUrl} className="pixel-button-pink">
          {loading ? "CRACKING OPEN THE REPO..." : "LET'S GO"}
        </Button>
      </div>

      {error && <p className="text-red-400 text-sm font-mono">{error}</p>}
    </div>
  );
}

export default RepoInput;