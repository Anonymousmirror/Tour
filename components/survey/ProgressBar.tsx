"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = Math.min((currentStep / totalSteps) * 100, 100);

  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/40 font-medium">
          步骤 {currentStep} / {totalSteps}
        </span>
        <span className="text-xs text-white/40 font-medium">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress track */}
      <div
        className={cn(
          "relative h-1.5 w-full rounded-full overflow-hidden",
          "bg-white/8"
        )}
      >
        {/* Animated fill */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #f97316, #fb923c, #38bdf8)",
            backgroundSize: "200% 100%",
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Shimmer overlay */}
        <motion.div
          className="absolute top-0 h-full w-1/3 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
          }}
          animate={{ left: ["0%", "100%"] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 0.5,
          }}
        />
      </div>

      {/* Glow dot at progress tip */}
      <div className="relative h-0">
        <motion.div
          className="absolute -top-3 w-3 h-3 rounded-full"
          style={{
            background: "radial-gradient(circle, #fb923c, #f97316)",
            boxShadow: "0 0 8px rgba(249,115,22,0.8), 0 0 16px rgba(249,115,22,0.4)",
            marginLeft: "-6px",
          }}
          animate={{ left: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
