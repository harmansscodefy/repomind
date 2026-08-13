import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function AuthScreen({ onAuthSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);

    const endpoint = isRegistering ? "/register" : "/login";

    try {
      const response = await fetch(`http://localhost:5050${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Save the token so future requests can use it
      localStorage.setItem("repomind_token", data.token);
      localStorage.setItem("repomind_email", data.email);

      onAuthSuccess({ token: data.token, email: data.email });
    } catch (err) {
      setError("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className=" pixel-card flex flex-col gap-4 max-w-sm mx-auto p-20">
      <h1 className="pixel-heading text-3xl text-white text-center align-center"> 
        REPO<span className="text-pink-300">MIND</span>
      </h1>
      <p className="pixel-tag text-slate-400 text-center text-[10px]">
        {isRegistering ? "CREATE AN ACCOUNT" : "WELCOME BACK"}
      </p>

      <div className="flex flex-col gap-1">
        <Label className="text-slate-300 text-xs font-mono pixel-tag">Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pixel-input text-white"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-slate-300 text-xs font-mono pixel-tag">Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="pixel-input text-white"
          placeholder="At least 6 characters"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading || !email || !password}
        className="pixel-button-pink w-full"
      >
        {loading ? "..." : isRegistering ? "SIGN UP" : "LOG IN"}
      </Button>

      {error && <p className="text-red-400 text-xs font-mono text-center">{error}</p>}

      <button
        onClick={() => {
          setIsRegistering(!isRegistering);
          setError("");
        }}
        className="text-slate-500 text-xs font-mono text-center hover:text-slate-300 pixel-tag"
      >
        {isRegistering ? "Already have an account? Log in" : "New here? Create an account"}
      </button>
    </div>
  );
}

export default AuthScreen;