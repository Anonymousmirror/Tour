import Link from "next/link";
import { listSubmissions, countSubmissions, getConnectionInfo } from "@/lib/kv";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const resolvedParams = await searchParams;
  const offset = parseInt(resolvedParams.offset || "0", 10);
  const limit = 20;
  const connInfo = getConnectionInfo();

  const [submissions, total] = await Promise.all([
    listSubmissions(offset, limit),
    countSubmissions(),
  ]);

  const hasNext = offset + limit < total;
  const hasPrev = offset > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white/90">提交记录</h1>
        <div className="text-right">
          <span className="text-sm text-white/40">
            共 {total} 条记录
          </span>
          <p className="text-xs text-white/20 mt-0.5">
            {connInfo.hasRedis ? "🟢 Redis" : "🟡 内存模式"}
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/30 text-lg">暂无提交记录</p>
          <p className="text-white/20 text-sm mt-2">用户填写问卷后记录将显示在这里</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <Link
              key={sub.id}
              href={`/admin/${sub.id}`}
              className="block rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-200 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-base font-semibold text-white/85">
                      📍 {sub.city || "未填写城市"}
                    </span>
                    {sub.dateRange && (
                      <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                        📅 {sub.dateRange}
                      </span>
                    )}
                  </div>
                  {sub.companionSummary && (
                    <p className="text-sm text-white/40">
                      👥 {sub.companionSummary}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-white/30">
                    {new Date(sub.createdAt).toLocaleString("zh-CN", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-white/20 mt-1 font-mono">
                    {sub.id.slice(0, 8)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(hasPrev || hasNext) && (
        <div className="flex items-center justify-center gap-4 pt-4">
          {hasPrev ? (
            <Link
              href={`/admin?offset=${Math.max(0, offset - limit)}`}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 hover:text-white/80 hover:border-white/20 transition-colors"
            >
              上一页
            </Link>
          ) : (
            <span className="px-4 py-2 text-sm text-white/20">上一页</span>
          )}
          <span className="text-xs text-white/30">
            {offset + 1}-{Math.min(offset + limit, total)} / {total}
          </span>
          {hasNext ? (
            <Link
              href={`/admin?offset=${offset + limit}`}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 hover:text-white/80 hover:border-white/20 transition-colors"
            >
              下一页
            </Link>
          ) : (
            <span className="px-4 py-2 text-sm text-white/20">下一页</span>
          )}
        </div>
      )}
    </div>
  );
}
