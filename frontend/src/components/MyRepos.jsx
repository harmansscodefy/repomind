import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

function MyRepos({ token, onSelectRepo, onNewRepo, onLogout }) {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingUrl, setDeletingUrl] = useState(null);

    useEffect(() => {
        fetchRepos();
    }, []);

    async function fetchRepos() {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/my-repos`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || "Failed to load repos");
                return;
            }
            setRepos(data.repos);
        } catch (err) {
            setError("Failed to connect to the server");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(repoUrl, e) {
        e.stopPropagation(); // don't trigger onSelectRepo when clicking delete
        setDeletingUrl(repoUrl);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/repos?repoUrl=${encodeURIComponent(repoUrl)}`, {
                        method: "DELETE",
                     headers: { Authorization: `Bearer ${token}` },
});
            if (response.ok) {
                setRepos((prev) => prev.filter((r) => r.repoUrl !== repoUrl));
            }
        } catch (err) {
            setError("Failed to delete repo");
        } finally {
            setDeletingUrl(null);
        }
    }

    return (
        <div className=" flex flex-col gap-5 max-w-xl mx-auto p-8">
            <div className="flex items-center justify-between">
                <h1 className="pixel-heading text-5xl text-white">
                    MY <span className="text-pink-300">REPOS</span>
                </h1>
                <button
                    onClick={onLogout}
                    className="pixel-tag pixel-card  p-3 text-slate-500 text-xs font-mono hover:text-slate-300"
                >
                    Log out
                </button>
            </div>

            {loading && <p className="text-slate-400 text-sm font-mono pixel-tag">Loading...</p>}
            {error && <p className="text-red-400 text-sm font-mono">{error}</p>}

            {!loading && repos.length === 0 && !error && (
                <p className="text-slate-500 text-sm font-mono pixel-tag simple-border p-2 text-center">
                    OOPS! You haven't ingested any repos yet.
                </p>
            )}

            <div className="flex flex-col gap-2">
                {repos.map((repo) => (
                    <div
                        key={repo.repoUrl}
                        onClick={() => onSelectRepo(repo.repoUrl)}
                        className="pixel-card p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-pink-300"
                    >
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-white text-sm font-mono truncate">
                                {repo.repoUrl.replace("https://github.com/", "")}
                            </span>
                            <span className="text-slate-500 text-xs font-mono">
                                {repo.chunkCount} chunks · last ingested{" "}
                                {new Date(repo.lastIngested).toLocaleDateString()}
                            </span>
                        </div>
                        <button
                            onClick={(e) => handleDelete(repo.repoUrl, e)}
                            disabled={deletingUrl === repo.repoUrl}
                            className="text-slate-500 text-xs font-mono hover:text-red-400 shrink-0 pixel-card p-3"
                        >
                            {deletingUrl === repo.repoUrl ? "..." : "delete"}
                        </button>
                    </div>
                ))}
            </div>

            <Button onClick={onNewRepo} className="pixel-button-pink w-full">
                + INGEST A NEW REPO
            </Button>
        </div>
    );
}

export default MyRepos;