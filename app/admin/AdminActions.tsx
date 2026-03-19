"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteOneButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("确认删除这条记录？")) return;
    setPending(true);
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("删除失败");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDelete();
      }}
      disabled={pending}
      className="text-xs text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-30"
    >
      {pending ? "删除中…" : "删除"}
    </button>
  );
}

export function DeleteAllButton({ count }: { count: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDeleteAll() {
    if (!confirm(`确认清空全部 ${count} 条记录？此操作不可撤销。`)) return;
    setPending(true);
    try {
      const res = await fetch("/api/submissions", { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("清空失败");
    } finally {
      setPending(false);
    }
  }

  if (count === 0) return null;

  return (
    <button
      onClick={handleDeleteAll}
      disabled={pending}
      className="px-3 py-1.5 rounded-lg border border-red-400/20 bg-red-400/5 text-xs text-red-400/70 hover:text-red-400 hover:border-red-400/40 transition-colors disabled:opacity-30"
    >
      {pending ? "清空中…" : "清空全部"}
    </button>
  );
}
