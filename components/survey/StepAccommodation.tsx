"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSurveyStore } from "@/lib/store";
import {
  ACCOMMODATION_TYPE_OPTIONS,
  ACCOMMODATION_PREFERENCE_OPTIONS,
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

export default function StepAccommodation() {
  const { data, updateAccommodation, toggleTag } = useSurveyStore();
  const { accommodation } = data;

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
          <p className="text-base font-semibold text-white/80">是否需要住宿安排</p>
          <p className="text-sm text-white/30 mt-0.5">开启后可配置住宿类型与偏好</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={accommodation.enabled}
          onClick={() => updateAccommodation({ enabled: !accommodation.enabled })}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
            accommodation.enabled ? "bg-orange-500" : "bg-white/15"
          )}
        >
          <motion.span
            animate={{ x: accommodation.enabled ? 20 : 0 }}
            transition={{ type: "spring", stiffness: 700, damping: 40 }}
            className="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0"
          />
        </button>
      </motion.div>

      <AnimatePresence>
        {accommodation.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden space-y-6"
          >
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.3 }}>
              <h3 className="text-base font-semibold text-white/80 mb-1">住宿类型（可多选）</h3>
              <p className="text-sm text-white/30 mb-3">你偏好哪种住宿方式？</p>
              <TagSelector
                options={ACCOMMODATION_TYPE_OPTIONS}
                selected={accommodation.types}
                onToggle={(v) => toggleTag("accommodation", "types", v)}
              />
              {accommodation.types.includes("其他") && (
                <OtherNoteInput noteKey="accommodation.types" placeholder="请补充其他住宿类型..." />
              )}
            </motion.div>

            <div className="border-t border-white/5" />

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
              <h3 className="text-base font-semibold text-white/80 mb-1">住宿偏好（可多选）</h3>
              <p className="text-sm text-white/30 mb-3">对住宿位置和条件有什么要求？</p>
              <TagSelector
                options={ACCOMMODATION_PREFERENCE_OPTIONS}
                selected={accommodation.preferences}
                onToggle={(v) => toggleTag("accommodation", "preferences", v)}
              />
              {accommodation.preferences.includes("其他") && (
                <OtherNoteInput noteKey="accommodation.preferences" placeholder="请补充其他住宿偏好..." />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
