"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  // Extract language from className (e.g. "language-python")
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";

  // Extract raw text for copying
  const extractText = (node: React.ReactNode): string => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node && typeof node === "object" && "props" in node) {
      return extractText((node as { props: { children?: React.ReactNode } }).props.children);
    }
    return "";
  };

  const codeText = extractText(children).trim();

  const handleCopy = async () => {
    if (!codeText) return;
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a] shadow-md">
      {/* Code Header Bar */}
      <div className="flex h-10 items-center justify-between border-b border-slate-800/80 bg-[#1e293b]/70 px-4">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-slate-600/70" />
          <span className="size-2.5 rounded-full bg-slate-600/70" />
          <span className="size-2.5 rounded-full bg-slate-600/70" />
          {language && (
            <span className="ml-2 font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
              {language}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          aria-label={copied ? "Copied to clipboard" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Text Body */}
      <pre className="overflow-x-auto p-4 sm:p-5 font-mono text-[13.5px] leading-relaxed text-[#f8fafc] selection:bg-slate-700">
        <code className="text-[#f8fafc] font-mono block whitespace-pre" {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}
