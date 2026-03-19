"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StepContainerProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}

export default function StepContainer({
  title,
  subtitle,
  children,
  className,
}: StepContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn("w-full", className)}
    >
      {/* Header */}
      <div className="mb-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="text-2xl sm:text-3xl font-bold text-white/95 leading-tight mb-1.5"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-sm sm:text-base text-white/50"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Content card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "rounded-2xl p-5 sm:p-6",
          "bg-white/5 backdrop-blur-sm border border-white/10",
          "shadow-xl shadow-black/20"
        )}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
