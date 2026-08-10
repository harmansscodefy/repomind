import { useState } from "react";
import RepoInput from "@/components/RepoInput";
import ChatInterface from "@/components/ChatInterface";
import BackgroundPattern from "@/components/BackgroundPattern";

function App() {
  const [ingestedRepo, setIngestedRepo] = useState(null);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <BackgroundPattern />
      {!ingestedRepo ? (
        <RepoInput onIngestComplete={setIngestedRepo} />
      ) : (
        <ChatInterface repoUrl={ingestedRepo.repoUrl} />
      )}
    </div>
  );
}

export default App;