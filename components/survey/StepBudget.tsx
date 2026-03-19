"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSurveyStore } from "@/lib/store";
import { BUDGET_LEVEL_OPTIONS, CONSTRAINT_OPTIONS } from "@/lib/survey-config";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const BUDGET_CONFIG = [
  { value: "省钱优先", icon: "💰", desc: "能省则省" },
  { value: "性价比优先", icon: "⚖️", desc: "合理分配" },
  { value: "体验优先", icon: "✨", desc: "注重品质" },
  { value: "高品质优先", icon: "👑", desc: "不设上限" },
];

export default function StepBudget() {
  const { data, updateBudget, toggleConstraint, updateConstraintNote } = useSurveyStore();
  const { budget } = data;
  const [customBudget, setCustomBudget] = useState("");

  const activeConstraintLabels = budget.constraints.filter((c) => c.enabled).map((c) => c.label);

  const getConstraintNote = (label: string) => {
    return budget.constraints.find((c) => c.label === label)?.note ?? "";
  };

  const handleBudgetSelect = (value: string) => {
    updateBudget({ level: budget.level === value ? "" : value });
    if (value !== "自定义") setCustomBudget("");
  };

  return (
    <div className="space-y-8">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeInUp}>
        <h3 className="text-base font-semibold text-white/80 mb-1">预算偏好</h3>
        <p className="text-sm text-white/40 mb-4">选择最符合你旅行预算的选项</p>

        <div className="grid grid-cols-2 gap-3">
          {BUDGET_CONFIG.map(({ value, icon, desc }) => {
            const isSelected = budget.level === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleBudgetSelect(value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border-2 py-5 px-3 transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "border-orange-500 bg-orange-500/15 shadow-lg shadow-orange-500/10"
                    : "border-white/10 bg-white/5 hover:border-orange-400/40"
                )}
              >
                <span className="text-3xl">{icon}</span>
                <span className={cn("text-sm font-semibold", isSelected ? "text-orange-400" : "text-white/70")}>
                  {value}
                </span>
                <span className="text-xs text-white/40">{desc}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => updateBudget({ level: budget.level === "自定义" ? "" : "自定义" })}
            className={cn(
              "w-full rounded-2xl border-2 py-3 px-4 text-sm font-medium transition-all duration-200 text-left",
              budget.level === "自定义"
                ? "border-orange-500 bg-orange-500/15 text-orange-400"
                : "border-white/10 bg-white/5 text-white/60 hover:border-orange-400/40"
            )}
          >
            📝 自定义预算金额
          </button>
          {budget.level === "自定义" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-2"
            >
              <input
                type="text"
                placeholder="例如：每天300元以内、总预算1500元..."
                value={customBudget}
                onChange={(e) => {
                  setCustomBudget(e.target.value);
                  updateBudget({ level: `自定义：${e.target.value}` });
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/90 placeholder-white/30 focus:border-orange-400/60 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition text-sm"
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeInUp} className="border-t border-white/5" />

      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeInUp}>
        <h3 className="text-base font-semibold text-white/80 mb-1">备注约束</h3>
        <p className="text-sm text-white/40 mb-4">勾选适用的约束条件，必将严格遵守</p>

        <div className="space-y-2">
          {CONSTRAINT_OPTIONS.map((option) => {
            const isChecked = activeConstraintLabels.includes(option.label);
            const note = getConstraintNote(option.label);

            return (
              <div key={option.label} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <label className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                  <div
                    onClick={() => toggleConstraint(option.label)}
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-150 cursor-pointer",
                      isChecked
                        ? "border-orange-500 bg-orange-500"
                        : "border-white/20 bg-transparent hover:border-orange-400/50"
                    )}
                  >
                    {isChecked && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    onClick={() => toggleConstraint(option.label)}
                    className={cn("text-sm font-medium transition-colors", isChecked ? "text-white/90" : "text-white/50")}
                  >
                    {option.label}
                  </span>
                </label>

                {isChecked && option.hasNote && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 pb-3"
                  >
                    <input
                      type="text"
                      placeholder={`请补充「${option.label}」的具体内容...`}
                      value={note}
                      onChange={(e) => updateConstraintNote(option.label, e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 placeholder-white/25 focus:border-orange-400/60 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition"
                    />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
