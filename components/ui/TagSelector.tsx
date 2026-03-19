"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  multiple?: boolean;
  columns?: number;
}

export default function TagSelector({
  options,
  selected,
  onToggle,
  multiple = true,
  columns,
}: TagSelectorProps) {
  const handleToggle = (value: string) => {
    if (!multiple && !selected.includes(value)) {
      // For single-select: deselect all current, then select new
      selected.forEach((s) => onToggle(s));
    }
    onToggle(value);
  };

  const gridStyle = columns
    ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
    : undefined;

  return (
    <motion.div
      layout
      className={cn(
        "grid gap-2",
        !columns && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      )}
      style={gridStyle}
    >
      {options.map((option) => {
        const isSelected = selected.includes(option);

        return (
          <motion.button
            key={option}
            layout
            onClick={() => handleToggle(option)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "relative flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium",
              "border transition-all duration-200 cursor-pointer select-none",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1",
              isSelected
                ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "bg-white/5 border-white/15 text-white/70 hover:border-orange-400/50 hover:text-white/90 hover:bg-white/8"
            )}
          >
            <AnimatePresence mode="popLayout">
              {isSelected && (
                <motion.span
                  key="check"
                  initial={{ scale: 0, opacity: 0, width: 0 }}
                  animate={{ scale: 1, opacity: 1, width: "auto" }}
                  exit={{ scale: 0, opacity: 0, width: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="flex items-center overflow-hidden"
                >
                  <Check size={13} strokeWidth={3} />
                </motion.span>
              )}
            </AnimatePresence>
            <span>{option}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
