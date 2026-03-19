"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useSurveyStore } from "@/lib/store";
import { COMPANION_OPTIONS } from "@/lib/survey-config";
import { cn } from "@/lib/utils";
import OtherNoteInput from "@/components/ui/OtherNoteInput";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const SOLO = "一人";
const OTHER = "其他";

export default function StepCompanion() {
  const { data, setCompanion } = useSurveyStore();
  const { companion } = data;

  const isSolo = companion.includes(SOLO);
  const groupOptions = COMPANION_OPTIONS.filter((o) => o !== SOLO);

  const handleToggleSolo = () => {
    if (isSolo) {
      setCompanion([]);
    } else {
      setCompanion([SOLO]);
    }
  };

  const handleToggleGroup = (value: string) => {
    const withoutSolo = companion.filter((v) => v !== SOLO);
    if (withoutSolo.includes(value)) {
      setCompanion(withoutSolo.filter((v) => v !== value));
    } else {
      setCompanion([...withoutSolo, value]);
    }
  };

  const showOtherInput = companion.includes(OTHER);

  return (
    <div className="space-y-5">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeInUp}>
        <p className="text-sm text-white/40 mb-4">选择出行成员类型 *（可多选）</p>

        {/* 一人 - standalone */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleToggleSolo}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium",
            "border transition-all duration-200 cursor-pointer select-none mb-3",
            isSolo
              ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/25"
              : "bg-white/5 border-white/15 text-white/70 hover:border-orange-400/50 hover:text-white/90"
          )}
        >
          {isSolo && <Check size={14} strokeWidth={3} />}
          🧍 独自出行
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 border-t border-white/10" />
          <span className="text-xs text-white/30">或选择同行人</span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        {/* Group options */}
        <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-2", isSolo && "opacity-40 pointer-events-none")}>
          {groupOptions.map((option) => {
            const isSelected = companion.includes(option);
            return (
              <motion.button
                key={option}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleToggleGroup(option)}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "relative flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium",
                  "border transition-all duration-200 cursor-pointer select-none",
                  isSelected
                    ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/25"
                    : "bg-white/5 border-white/15 text-white/70 hover:border-orange-400/50 hover:text-white/90 hover:bg-white/8"
                )}
              >
                {isSelected && <Check size={13} strokeWidth={3} />}
                <span>{option}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {showOtherInput && (
        <OtherNoteInput noteKey="companion" placeholder="例如：带宠物、大家庭..." />
      )}
    </div>
  );
}
