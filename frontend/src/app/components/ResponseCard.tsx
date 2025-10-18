import React from "react";
import { ResponseCardProps } from "@/types";

export default function ResponseCard({ result }: ResponseCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 w-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">
          <strong>{result.model}</strong> • t={result.temperature} p=
          {result.top_p}
        </div>
        <div className="text-xs">{result.execution_time?.toFixed?.(2)}s</div>
      </div>

      <div className="prose max-w-none flex-1 overflow-auto">
        {result.success ? (
          <div>{result.response}</div>
        ) : (
          <div className="text-red-500">Error: {result.error}</div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          className="text-sm underline"
          onClick={() => navigator.clipboard.writeText(result.response)}
        >
          Copy
        </button>
        <a
          className="text-sm"
          href={`data:text/json;utf8,${encodeURIComponent(
            JSON.stringify(result)
          )}`}
          download={`result-${result.model}.json`}
        >
          Export JSON
        </a>
      </div>
    </div>
  );
}
