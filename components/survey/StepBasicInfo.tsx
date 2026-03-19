"use client";

import { motion } from "framer-motion";
import { useSurveyStore } from "@/lib/store";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/90 placeholder-white/30 focus:border-orange-400/60 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition";

const labelClass = "block text-sm font-medium text-white/60 mb-1.5";

export default function StepBasicInfo() {
  const { data, updateBasicInfo } = useSurveyStore();
  const { basicInfo } = data;

  return (
    <div className="space-y-5">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeInUp}>
        <label className={labelClass}>旅行城市 *</label>
        <input
          type="text"
          className={inputClass}
          placeholder="例如：成都、杭州、大理..."
          value={basicInfo.city}
          onChange={(e) => updateBasicInfo({ city: e.target.value })}
        />
      </motion.div>

      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <label className={labelClass}>出发日期 *</label>
          <input
            type="date"
            className={inputClass}
            value={basicInfo.startDate}
            onChange={(e) => updateBasicInfo({ startDate: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>返回日期 *</label>
          <input
            type="date"
            className={inputClass}
            value={basicInfo.endDate}
            onChange={(e) => updateBasicInfo({ endDate: e.target.value })}
          />
        </div>
      </motion.div>

      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <label className={labelClass}>出发地 *</label>
          <input
            type="text"
            className={inputClass}
            placeholder="例如：北京西站、家（朝阳区xx小区）"
            value={basicInfo.departure}
            onChange={(e) => updateBasicInfo({ departure: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>返回地 *</label>
          <input
            type="text"
            className={inputClass}
            placeholder="例如：北京西站、公司（海淀区xx）"
            value={basicInfo.returnTo}
            onChange={(e) => updateBasicInfo({ returnTo: e.target.value })}
          />
        </div>
      </motion.div>

      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <label className={labelClass}>
            出发时间
            <span className="ml-1 text-xs text-white/30 font-normal">（选填）</span>
          </label>
          <input
            type="time"
            className={inputClass}
            value={basicInfo.departureTime}
            onChange={(e) => updateBasicInfo({ departureTime: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>
            返回时间
            <span className="ml-1 text-xs text-white/30 font-normal">（选填）</span>
          </label>
          <input
            type="time"
            className={inputClass}
            value={basicInfo.returnTime}
            onChange={(e) => updateBasicInfo({ returnTime: e.target.value })}
          />
        </div>
      </motion.div>
    </div>
  );
}
