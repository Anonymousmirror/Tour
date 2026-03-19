import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "管理后台 - 旅行规划助手",
  description: "查看用户提交的问卷记录",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Admin header */}
      <header className="border-b border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white/90">管理后台</span>
            <span className="text-xs text-white/30 bg-white/10 px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <Link
            href="/"
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
