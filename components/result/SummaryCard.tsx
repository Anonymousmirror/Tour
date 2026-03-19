"use client";

import type { SurveyData } from "@/lib/types";

interface SummaryCardProps {
  data: SurveyData;
}

interface CategoryItem {
  icon: string;
  label: string;
  values: string[];
}

function buildCategories(data: SurveyData): CategoryItem[] {
  const categories: CategoryItem[] = [];
  const { basicInfo, companion, transport, style, dining, attractions, accommodation, budget } = data;

  if (basicInfo.city) {
    const parts = [basicInfo.city];
    if (basicInfo.startDate && basicInfo.endDate) parts.push(`${basicInfo.startDate} ~ ${basicInfo.endDate}`);
    if (basicInfo.departure) parts.push(`从 ${basicInfo.departure} 出发`);
    categories.push({ icon: "📍", label: "基础信息", values: parts });
  }

  if (companion.length > 0) categories.push({ icon: "👥", label: "出行成员", values: companion });

  const transportValues = [
    ...transport.intercity.map((v) => `城际: ${v}`),
    ...transport.intracity.map((v) => `市内: ${v}`),
  ];
  if (transportValues.length > 0) categories.push({ icon: "🚌", label: "出行方式", values: transportValues });

  const styleValues = [...style.preferences];
  if (style.stamina) styleValues.push(`体力: ${style.stamina}`);
  if (style.timePreference) styleValues.push(style.timePreference);
  if (styleValues.length > 0) categories.push({ icon: "🧭", label: "行程风格", values: styleValues });

  if (dining.enabled) {
    const dv = [...dining.scenes, ...dining.cuisines, ...dining.dietary.map((v) => `忌口: ${v}`)];
    categories.push({ icon: "🍜", label: "餐饮需求", values: dv.length > 0 ? dv : ["已开启餐食安排"] });
  }

  const attractionValues = [...attractions.scenicTypes, ...attractions.activities];
  if (attractionValues.length > 0) categories.push({ icon: "🎡", label: "游玩偏好", values: attractionValues });

  if (accommodation.enabled) {
    const av = [...accommodation.types, ...accommodation.preferences];
    categories.push({ icon: "🏨", label: "住宿要求", values: av.length > 0 ? av : ["已开启住宿安排"] });
  }

  if (budget.level) categories.push({ icon: "💳", label: "预算偏好", values: [budget.level] });

  const activeConstraints = budget.constraints.filter((c) => c.enabled);
  if (activeConstraints.length > 0) {
    categories.push({
      icon: "📌",
      label: "约束条件",
      values: activeConstraints.map((c) => (c.note ? `${c.label}：${c.note}` : c.label)),
    });
  }

  return categories;
}

export default function SummaryCard({ data }: SummaryCardProps) {
  const categories = buildCategories(data);
  if (categories.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-base font-semibold text-white/70 mb-4">你的旅行偏好概览</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div key={cat.label} className="rounded-xl bg-white/5 border border-white/8 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{cat.icon}</span>
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wide">{cat.label}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cat.values.map((v) => (
                <span key={v} className="inline-flex items-center rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-medium text-orange-300">
                  {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
