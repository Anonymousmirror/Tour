"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSurveyStore } from "@/lib/store";
import {
  DINING_SCENE_OPTIONS,
  CUISINE_OPTIONS,
  DIETARY_OPTIONS,
} from "@/lib/survey-config";
import TagSelector from "@/components/ui/TagSelector";
import OtherNoteInput from "@/components/ui/OtherNoteInput";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function StepDining() {
  const { data, updateDining, toggleTag } = useSurveyStore();
  const { dining } = data;

  return (
    <div className="space-y-6">
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
      >
        <div>
          <p className="text-base font-semibold text-white/80">是否需要安排餐食</p>
          <p className="text-sm text-white/30 mt-0.5">开启后可配置用餐偏好</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={dining.enabled}
          onClick={() => updateDining({ enabled: !dining.enabled })}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
            dining.enabled ? "bg-orange-500" : "bg-white/15"
          )}
        >
          <motion.span
            animate={{ x: dining.enabled ? 20 : 0 }}
            transition={{ type: "spring", stiffness: 700, damping: 40 }}
            className="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0"
          />
        </button>
      </motion.div>

      <AnimatePresence>
        {dining.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden space-y-6"
          >
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.3 }}>
              <h3 className="text-base font-semibold text-white/80 mb-1">用餐场景偏好（可多选）</h3>
              <p className="text-sm text-white/30 mb-3">选择你偏好的用餐氛围</p>
              <TagSelector options={DINING_SCENE_OPTIONS} selected={dining.scenes} onToggle={(v) => toggleTag("dining", "scenes", v)} />
              {dining.scenes.includes("其他") && (
                <OtherNoteInput noteKey="dining.scenes" placeholder="请补充其他用餐场景偏好..." />
              )}
            </motion.div>

            <div className="border-t border-white/5" />

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
              <h3 className="text-base font-semibold text-white/80 mb-1">餐饮品类偏好（可多选）</h3>
              <p className="text-sm text-white/30 mb-3">你想吃什么类型的美食？</p>
              <TagSelector options={CUISINE_OPTIONS} selected={dining.cuisines} onToggle={(v) => toggleTag("dining", "cuisines", v)} />
              {dining.cuisines.includes("其他") && (
                <OtherNoteInput noteKey="dining.cuisines" placeholder="请补充其他餐饮品类偏好..." />
              )}
            </motion.div>

            <div className="border-t border-white/5" />

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}>
              <h3 className="text-base font-semibold text-white/80 mb-1">忌口（可多选）</h3>
              <p className="text-sm text-white/30 mb-3">有饮食禁忌或过敏需求吗？</p>
              <TagSelector options={DIETARY_OPTIONS} selected={dining.dietary} onToggle={(v) => toggleTag("dining", "dietary", v)} />
              {dining.dietary.includes("其他") && (
                <OtherNoteInput noteKey="dining.dietary" placeholder="请补充其他忌口或过敏信息..." />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
