"use client";

import { useState } from "react";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"BASIC" | "DETAIL">("BASIC");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [format, setFormat] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function optimize() {
    setError("");

    if (prompt.trim().length < 10) {
      setError("Please enter a longer prompt.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/optimize-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          raw_prompt: prompt,
          context:
            mode === "DETAIL"
              ? { audience, tone, output_format: format }
              : {},
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data.result);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyPrompt() {
    const match = result.match(/Your Optimised Prompt:\n([\s\S]*)/);
    if (match) navigator.clipboard.writeText(match[1].trim());
  }

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <h1>Think Like Dana</h1>
      <p>Turn rough ideas into powerful ChatGPT prompts.</p>

      <textarea
        placeholder="Paste your rough prompt here"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={5}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <div>
        <strong>Mode:</strong>
        <label style={{ marginLeft: 10 }}>
          <input
            type="radio"
            checked={mode === "BASIC"}
            onChange={() => setMode("BASIC")}
          />{" "}
          BASIC
        </label>
        <label style={{ marginLeft: 10 }}>
          <input
            type="radio"
            checked={mode === "DETAIL"}
            onChange={() => setMode("DETAIL")}
          />{" "}
          DETAIL
        </label>
      </div>

      {mode === "DETAIL" && (
        <div style={{ marginTop: 10 }}>
          <input
            placeholder="Audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
          <input
            placeholder="Tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          />
          <input
            placeholder="Output format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          />
        </div>
      )}

      <button
        onClick={optimize}
        disabled={loading}
        style={{ marginTop: 10 }}
      >
        {loading ? "Optimizing…" : "Optimize Prompt"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <section style={{ marginTop: 30 }}>
          <pre style={{ whiteSpace: "pre-wrap" }}>{result}</pre>
          <button onClick={copyPrompt}>Copy Prompt</button>
        </section>
      )}
    </main>
  );
}
