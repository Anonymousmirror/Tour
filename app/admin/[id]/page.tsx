import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubmission } from "@/lib/kv";
import AdminPromptDisplay from "./AdminPromptDisplay";

export const dynamic = "force-dynamic";

export default async function AdminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmission(id);

  if (!submission) {
    notFound();
  }

  const { surveyData } = submission;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        ← 返回列表
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white/90">
              📍 {submission.city || "未填写"}
            </h1>
            {submission.dateRange && (
              <p className="text-sm text-white/50 mt-1">📅 {submission.dateRange}</p>
            )}
            {submission.companionSummary && (
              <p className="text-sm text-white/40 mt-1">👥 {submission.companionSummary}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-white/30">提交时间</p>
            <p className="text-sm text-white/50">
              {new Date(submission.createdAt).toLocaleString("zh-CN")}
            </p>
            <p className="text-xs text-white/20 mt-1 font-mono">{submission.id}</p>
          </div>
        </div>
      </div>

      {/* Survey data summary */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-base font-semibold text-white/70 mb-4">问卷选项概览</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SummaryItem
            icon="📍"
            label="基础信息"
            values={[
              surveyData.basicInfo.city,
              surveyData.basicInfo.startDate && surveyData.basicInfo.endDate
                ? `${surveyData.basicInfo.startDate} ~ ${surveyData.basicInfo.endDate}`
                : "",
              surveyData.basicInfo.departure ? `出发：${surveyData.basicInfo.departure}` : "",
              surveyData.basicInfo.returnTo ? `返回：${surveyData.basicInfo.returnTo}` : "",
            ].filter(Boolean)}
          />
          <SummaryItem icon="👥" label="出行成员" values={surveyData.companion} />
          <SummaryItem
            icon="🚌"
            label="交通"
            values={[
              ...surveyData.transport.intercity.map((v: string) => `城际:${v}`),
              ...surveyData.transport.intracity.map((v: string) => `市内:${v}`),
            ]}
          />
          <SummaryItem
            icon="🧭"
            label="行程风格"
            values={[
              ...surveyData.style.preferences,
              surveyData.style.stamina ? `体力:${surveyData.style.stamina}` : "",
              surveyData.style.timePreference || "",
            ].filter(Boolean)}
          />
          {surveyData.dining.enabled && (
            <SummaryItem
              icon="🍜"
              label="餐饮"
              values={[...surveyData.dining.scenes, ...surveyData.dining.cuisines, ...surveyData.dining.dietary]}
            />
          )}
          <SummaryItem
            icon="🎡"
            label="游玩"
            values={[...surveyData.attractions.scenicTypes, ...surveyData.attractions.activities]}
          />
          {surveyData.accommodation.enabled && (
            <SummaryItem
              icon="🏨"
              label="住宿"
              values={[...surveyData.accommodation.types, ...surveyData.accommodation.preferences]}
            />
          )}
          {surveyData.budget.level && (
            <SummaryItem icon="💳" label="预算" values={[surveyData.budget.level]} />
          )}
        </div>
      </div>

      {/* Prompt */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-white/[0.02]">
          <span className="text-base font-semibold text-white/70">生成的提示词</span>
        </div>
        <AdminPromptDisplay prompt={submission.prompt} />
      </div>
    </div>
  );
}

function SummaryItem({ icon, label, values }: { icon: string; label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div className="rounded-xl bg-white/5 border border-white/8 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-medium text-orange-300">
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
