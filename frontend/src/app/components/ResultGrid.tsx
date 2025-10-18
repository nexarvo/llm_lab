import React from "react";
import ResponseCard from "./ResponseCard";
import { ResultsGridProps } from "@/types";

export default function ResultsGrid({ results }: ResultsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((r, i) => (
        <ResponseCard key={i} result={r} />
      ))}
    </div>
  );
}
