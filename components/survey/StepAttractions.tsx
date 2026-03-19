"use client";

import { motion } from "framer-motion";
import { useSurveyStore } from "@/lib/store";
import { SCENIC_TYPE_OPTIONS, ACTIVITY_OPTIONS } from "@/lib/survey-config";
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

export default function StepAttractions() {
  const { data, toggleTag } = useSurveyStore();
  const { attractions } = data;

  return (
    <div className="space-y-8">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeInUp}>
        <h3 className="text-base font-semibold text-white/80 mb-1">景区/目的地偏好（可多选）</h3>
        <p className="text-sm text-white/40 mb-3">你喜欢哪类景点和目的地？</p>
        <TagSelector
          options={SCENIC_TYPE_OPTIONS}
          selected={attractions.scenicTypes}
          onToggle={(v) => toggleTag("attractions", "scenicTypes", v)}
        />
        {attractions.scenicTypes.includes("其他") && (
          <OtherNoteInput noteKey="attractions.scenicTypes" placeholder="请补充其他景区/目的地偏好..." />
        )}
      </motion.div>

      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeInUp} className="border-t border-white/5" />

      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeInUp}>
        <h3 className="text-base font-semibold text-white/80 mb-1">活动体验偏好（可多选）</h3>
        <p className="text-sm text-white/40 mb-3">旅途中你想参与哪些活动？</p>
        <TagSelector
          options={ACTIVITY_OPTIONS}
          selected={attractions.activities}
          onToggle={(v) => toggleTag("attractions", "activities", v)}
        />
        {attractions.activities.includes("其他") && (
          <OtherNoteInput noteKey="attractions.activities" placeholder="请补充其他活动体验偏好..." />
        )}
      </motion.div>
    </div>
  );
}
