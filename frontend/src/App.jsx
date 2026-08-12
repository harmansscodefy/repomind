import { useState, useEffect } from "react";
import AuthScreen from "@/components/AuthScreen";
import RepoInput from "@/components/RepoInput";
import ChatInterface from "@/components/ChatInterface";
import BackgroundPattern from "@/components/BackgroundPattern";

function App() {
  const [auth, setAuth] = useState(null); // { token, email }
  const [ingestedRepo, setIngestedRepo] = useState(null);

  // On page load, check if a token already exists from a previous session
  useEffect(() => {
    const token = localStorage.getItem("repomind_token");
    const email = localStorage.getItem("repomind_email");
    if (token && email) {
      setAuth({ token, email });
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("repomind_token");
    localStorage.removeItem("repomind_email");
    setAuth(null);
    setIngestedRepo(null);
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <BackgroundPattern />
      {auth && (
  <button
    onClick={handleLogout}
    className="fixed top-4 right-4 text-slate-400 text-xs font-mono hover:text-white pixel-pill px-3 py-1.5"
  >
    LOGOUT ({auth.email})
  </button>
)}

      {!auth ? (
        <AuthScreen onAuthSuccess={setAuth} />
      ) : !ingestedRepo ? (
        <RepoInput onIngestComplete={setIngestedRepo} token={auth.token} />
      ) : (
        <ChatInterface repoUrl={ingestedRepo.repoUrl} token={auth.token} />
      )}
    </div>
  );
}

export default App;