import { useState, useEffect } from "react";
import AuthScreen from "@/components/AuthScreen";
import MyRepos from "@/components/MyRepos";
import RepoInput from "@/components/RepoInput";
import ChatInterface from "@/components/ChatInterface";
import BackgroundPattern from "@/components/BackgroundPattern";

function App() {
    const [auth, setAuth] = useState(null);
    const [view, setView] = useState("repos"); // "repos" | "ingest" | "chat"
    const [activeRepo, setActiveRepo] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("repomind_token");
        const email = localStorage.getItem("repomind_email");
        if (token && email) setAuth({ token, email });
    }, []);

    function handleLogout() {
        localStorage.removeItem("repomind_token");
        localStorage.removeItem("repomind_email");
        setAuth(null);
        setView("repos");
        setActiveRepo(null);
    }

    function handleIngestComplete(data) {
        setActiveRepo(data.repoUrl);
        setView("chat");
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4">
            <BackgroundPattern />

            {!auth ? (
                <AuthScreen onAuthSuccess={setAuth} />
            ) : view === "repos" ? (
                <MyRepos
                    token={auth.token}
                    onSelectRepo={(repoUrl) => {
                        setActiveRepo(repoUrl);
                        setView("chat");
                    }}
                    onNewRepo={() => setView("ingest")}
                    onLogout={handleLogout}
                />
            ) : view === "ingest" ? (
                <RepoInput
                    onIngestComplete={handleIngestComplete}
                    token={auth.token}
                    onBack={() => setView("repos")}
                />
            ) : (
                <ChatInterface
                    repoUrl={activeRepo}
                    token={auth.token}
                    onBack={() => setView("repos")}
                />
            )}
        </div>
    );
}

export default App;