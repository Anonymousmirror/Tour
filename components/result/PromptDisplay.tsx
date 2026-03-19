"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";

interface PromptDisplayProps {
  prompt: string;
}

export default function PromptDisplay({ prompt }: PromptDisplayProps) {
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

  const formatLine = (line: string, index: number) => {
    if (line.startsWith("# ")) {
      return (
        <div key={index} className="mt-4 mb-1 first:mt-0">
          <span className="font-bold text-orange-400 text-sm">{line.slice(2)}</span>
        </div>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <div key={index} className="mt-3 mb-0.5">
          <span className="font-semibold text-white/70 text-sm">{line.slice(3)}</span>
        </div>
      );
    }
    if (line.startsWith("- ") || line.startsWith("  - ")) {
      const indent = line.startsWith("  - ");
      return (
        <div key={index} className={indent ? "pl-6" : "pl-2"}>
          <span className="text-white/30 mr-1">•</span>
          <span className="text-white/55 text-sm">{line.replace(/^(\s*- )/, "")}</span>
        </div>
      );
    }
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <div key={index} className="mt-2">
          <span className="font-semibold text-white/70 text-sm">{line.slice(2, -2)}</span>
        </div>
      );
    }
    if (line === "---") {
      return <hr key={index} className="border-white/10 my-3" />;
    }
    if (line === "") {
      return <div key={index} className="h-1" />;
    }
    return (
      <div key={index}>
        <span className="text-white/55 text-sm">{line}</span>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white/70">生成的提示词</span>
          <span className="text-xs text-white/30">可直接粘贴到 AI 助手</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 active:bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="flex items-center gap-1"
              >
                <Check size={13} strokeWidth={3} />
                已复制！
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="flex items-center gap-1"
              >
                <Copy size={13} />
                一键复制
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Prompt content */}
      <div className="px-5 py-4 max-h-96 overflow-y-auto font-mono text-xs leading-relaxed space-y-0.5">
        {prompt.split("\n").map((line, i) => formatLine(line, i))}
      </div>
    </div>
  );
}
