import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function RepoInput({ onIngestComplete }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleIngest() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5050/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="flex flex-col items-center gap-4 max-w-xl mx-auto">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="pixel-heading text-7xl text-white">
  REPO<span className="text-pink-300">MIND</span>
</h1>
        <p className="pixel-tag text-slate-250 leading-relaxed ">
  STOP GREPPING. START ASKING.
</p>
<p className="text-slate-600 text-sm max-w-md font-mono pixel-tag">
  Any GitHub repo. Any question. Real answers, straight from the source —
  with receipts.
</p>
      </div>

      <div className="pixel-card flex flex-col items-center 
      gap-3 p-4 w-full pixel-tag">
        <Input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          className="text-white"
        />
        <Button onClick={handleIngest} disabled={loading || !repoUrl} className="pixel-button-pink">
  {loading ? "CRACKING OPEN THE REPO..." : "LET'S GO"}
</Button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}

export default RepoInput;