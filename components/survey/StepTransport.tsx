"use client";

import { motion } from "framer-motion";
import { Train, Bus } from "lucide-react";
import { useSurveyStore } from "@/lib/store";
import { INTERCITY_OPTIONS, INTRACITY_OPTIONS } from "@/lib/survey-config";
import TagSelector from "@/components/ui/TagSelector";
import OtherNoteInput from "@/components/ui/OtherNoteInput";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function StepTransport() {
  const { data, toggleTag } = useSurveyStore();
  const { intercity, intracity } = data.transport;

  return (
    <div className="space-y-8">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeInUp}>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400">
            <Train size={16} />
          </div>
          <h3 className="text-base font-semibold text-white/80">城际到达方式（可多选）</h3>
        </div>
        <p className="text-sm text-white/40 mb-3">你打算怎么到达目的地？</p>
        <TagSelector
          options={INTERCITY_OPTIONS}
          selected={intercity}
          onToggle={(value) => toggleTag("transport", "intercity", value)}
        />
        {intercity.includes("其他") && (
          <OtherNoteInput noteKey="transport.intercity" placeholder="请补充其他城际交通方式..." />
        )}
      </motion.div>

      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="border-t border-white/5"
      />

      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeInUp}>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400">
            <Bus size={16} />
          </div>
          <h3 className="text-base font-semibold text-white/80">市内交通方式（可多选）</h3>
        </div>
        <p className="text-sm text-white/40 mb-3">在城市里你偏好如何出行？</p>
        <TagSelector
          options={INTRACITY_OPTIONS}
          selected={intracity}
          onToggle={(value) => toggleTag("transport", "intracity", value)}
        />
        {intracity.includes("其他") && (
          <OtherNoteInput noteKey="transport.intracity" placeholder="请补充其他市内交通方式..." />
        )}
      </motion.div>
    </div>
  );
}
