"use client";
import { useState } from "react";
import { ChatBox } from "./components/ChatBox";
import ResultsGrid from "./components/ResultGrid";
import { LLMResult } from "@/types";

export default function Page() {
  const [results, setResults] = useState<LLMResult[]>([]);

  return (
    <main
      className="min-h-screen p-8 bg-slate-50"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
        <aside className="col-span-3">{/* <ParameterPanel /> */}</aside>

        <section className="col-span-9">
          <div className="my-auto mb-4 w-full max-w-2xl">
            <ChatBox />
          </div>

          <div aria-live="polite">
            <ResultsGrid results={results} />
          </div>
        </section>
      </div>
    </main>
  );
}
