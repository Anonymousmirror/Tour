"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { RotateCcw, CloudSun, Loader2 } from "lucide-react";
import { useSurveyStore } from "@/lib/store";
import { generatePrompt } from "@/lib/prompt-generator";
import { formatWeatherForPrompt, type WeatherResult } from "@/lib/weather";
import SummaryCard from "./SummaryCard";
import PromptDisplay from "./PromptDisplay";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

interface ResultPageProps {
  isAdmin?: boolean;
}

export default function ResultPage({ isAdmin = false }: ResultPageProps) {
  const { data, reset } = useSurveyStore();
  const [adminMode, setAdminMode] = useState(isAdmin);
  const [weatherContext, setWeatherContext] = useState("");
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherStatus, setWeatherStatus] = useState<"loading" | "success" | "fallback" | "error">("loading");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const weatherFetched = useRef(false);
  const submissionSent = useRef(false);

  const prompt = generatePrompt(data, weatherContext);

  // Fetch weather on mount
  useEffect(() => {
    if (weatherFetched.current) return;
    weatherFetched.current = true;

    const { city, startDate, endDate } = data.basicInfo;
    if (!city || !startDate || !endDate) {
      setWeatherLoading(false);
      setWeatherStatus("error");
      return;
    }

    const params = new URLSearchParams({ city, startDate, endDate });

    fetch(`/api/weather?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`weather_api_${res.status}`);
        }
        return (await res.json()) as WeatherResult;
      })
      .then((result) => {
        const text = formatWeatherForPrompt(result);
        setWeatherContext(text);
        if (result.forecast.length > 0) {
          setWeatherStatus("success");
        } else {
          setWeatherStatus("fallback");
        }
      })
      .catch(() => {
        setWeatherStatus("error");
      })
      .finally(() => {
        setWeatherLoading(false);
      });
  }, [data.basicInfo]);

  // Submit to backend after weather loads (prompt is finalized)
  useEffect(() => {
    if (weatherLoading || submissionSent.current || isAdmin) return;
    submissionSent.current = true;

    const finalPrompt = generatePrompt(data, weatherContext);
    setSubmitStatus("saving");

    fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surveyData: data, prompt: finalPrompt }),
    })
      .then((res) => {
        if (res.ok) {
          setSubmitStatus("saved");
        } else {
          setSubmitStatus("error");
        }
      })
      .catch(() => {
        setSubmitStatus("error");
      });
  }, [weatherLoading, data, weatherContext, isAdmin]);

  // Sync admin mode from prop + keyboard shortcut Ctrl+Shift+P
  useEffect(() => {
    setAdminMode(isAdmin);
  }, [isAdmin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setAdminMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const weatherStatusText = {
    loading: "正在获取天气预报...",
    success: "已获取真实天气预报数据",
    fallback: "超出预报范围，使用季节气候推断",
    error: "天气获取失败，使用季节气候推断",
  };

  const weatherStatusColor = {
    loading: "text-white/40",
    success: "text-emerald-400",
    fallback: "text-amber-400",
    error: "text-red-400/70",
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-1">
      {/* Header */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-6 text-white shadow-xl shadow-orange-500/20"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-3xl mb-2">🎉</div>
            <h1 className="text-xl font-bold">问卷已完成！</h1>
            <p className="text-orange-100 text-sm mt-1">
              你的旅行偏好已记录，稍后将为你生成专属行程规划
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 ml-4 flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 px-3 py-2 text-sm font-medium text-white transition-colors duration-150"
          >
            <RotateCcw size={14} />
            重新填写
          </button>
        </div>

        <div className="mt-4 flex gap-3 flex-wrap">
          {data.basicInfo.city && (
            <div className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium">
              📍 {data.basicInfo.city}
            </div>
          )}
          {data.basicInfo.startDate && data.basicInfo.endDate && (
            <div className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium">
              📅 {data.basicInfo.startDate} ~ {data.basicInfo.endDate}
            </div>
          )}
        </div>
      </motion.div>

      {/* Status indicators */}
      <motion.div
        custom={0.5}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03]"
      >
        <div className="flex items-center gap-2">
          {weatherLoading ? (
            <Loader2 size={15} className="animate-spin text-white/40" />
          ) : (
            <CloudSun size={15} className={weatherStatusColor[weatherStatus]} />
          )}
          <span className={`text-sm ${weatherStatusColor[weatherStatus]}`}>
            {weatherStatusText[weatherStatus]}
          </span>
        </div>
        {submitStatus === "saved" && (
          <span className="text-xs text-emerald-400/70">已保存</span>
        )}
        {submitStatus === "saving" && (
          <span className="text-xs text-white/30">保存中...</span>
        )}
      </motion.div>

      {/* Summary Card */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeInUp}>
        <SummaryCard data={data} />
      </motion.div>

      {/* Prompt Display — admin only (Ctrl+Shift+P) */}
      {adminMode && (
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeInUp}>
          <PromptDisplay prompt={prompt} />
        </motion.div>
      )}

      {/* Bottom reset */}
      <motion.div custom={adminMode ? 3 : 2} initial="hidden" animate="visible" variants={fadeInUp} className="flex justify-center pb-4">
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-medium text-white/60 hover:border-orange-400/40 hover:text-white/80 transition-all duration-200"
        >
          <RotateCcw size={14} />
          重新填写问卷
        </button>
      </motion.div>
    </div>
  );
}
