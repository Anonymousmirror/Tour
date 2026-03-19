"use client";

import { motion } from "framer-motion";
import { useSurveyStore } from "@/lib/store";
import {
  STYLE_PREFERENCE_OPTIONS,
  TIME_PREFERENCE_OPTIONS,
} from "@/lib/survey-config";
import TagSelector from "@/components/ui/TagSelector";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const STAMINA_CONFIG = [
  { value: "低", emoji: "🐢", desc: "轻松悠闲" },
  { value: "中", emoji: "🚶", desc: "适度活动" },
  { value: "高", emoji: "🏃", desc: "充沛精力" },
];

export default function StepStyle() {
  const { data, toggleTag, updateStyle } = useSurveyStore();
  const { preferences, stamina, timePreference } = data.style;

  const handleTimeToggle = (value: string) => {
    updateStyle({ timePreference: timePreference === value ? "" : value });
  };

  return (
    <div className="space-y-8">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeInUp}>
        <h3 className="text-base font-semibold text-white/80 mb-1">出行体验偏好（可多选）</h3>
        <p className="text-sm text-white/40 mb-3">选择最符合你旅行风格的标签</p>
        <TagSelector
          options={STYLE_PREFERENCE_OPTIONS}
          selected={preferences}
          onToggle={(v) => toggleTag("style", "preferences", v)}
        />
      </motion.div>

      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeInUp} className="border-t border-white/5" />

      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeInUp}>
        <h3 className="text-base font-semibold text-white/80 mb-1">体力接受度</h3>
        <p className="text-sm text-white/40 mb-3">你能接受的行程强度</p>
        <div className="grid grid-cols-3 gap-3">
          {STAMINA_CONFIG.map(({ value, emoji, desc }) => {
            const isSelected = stamina === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => updateStyle({ stamina: isSelected ? "" : value })}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border-2 py-4 px-2 transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "border-orange-500 bg-orange-500/15 shadow-lg shadow-orange-500/10"
                    : "border-white/10 bg-white/5 hover:border-orange-400/40"
                )}
              >
                <span className="text-2xl">{emoji}</span>
                <span className={cn("text-sm font-semibold", isSelected ? "text-orange-400" : "text-white/70")}>
                  {value}
                </span>
                <span className="text-xs text-white/40">{desc}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeInUp} className="border-t border-white/5" />

      <motion.div custom={4} initial="hidden" animate="visible" variants={fadeInUp}>
        <h3 className="text-base font-semibold text-white/80 mb-1">时间偏好</h3>
        <p className="text-sm text-white/40 mb-3">你的日常作息节奏是？</p>
        <TagSelector
          options={TIME_PREFERENCE_OPTIONS}
          selected={timePreference ? [timePreference] : []}
          onToggle={handleTimeToggle}
        />
      </motion.div>
    </div>
  );
}
