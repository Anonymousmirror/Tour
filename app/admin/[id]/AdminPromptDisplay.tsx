"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function AdminPromptDisplay({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex justify-end px-6 pt-3">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 active:bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150"
        >
          {copied ? (
            <>
              <Check size={13} strokeWidth={3} />
              已复制！
            </>
          ) : (
            <>
              <Copy size={13} />
              一键复制
            </>
          )}
        </button>
      </div>
      <pre className="px-6 py-4 max-h-[600px] overflow-y-auto text-xs text-white/55 leading-relaxed whitespace-pre-wrap font-mono">
        {prompt}
      </pre>
    </div>
  );
}
