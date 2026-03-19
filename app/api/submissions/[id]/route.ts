import { NextRequest, NextResponse } from "next/server";
import { getSubmission, deleteSubmission } from "@/lib/kv";

// GET /api/submissions/:id — get a single submission
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submission = await getSubmission(id);

    if (!submission) {
      return NextResponse.json({ error: "提交记录未找到" }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// DELETE /api/submissions/:id — delete a single submission
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await deleteSubmission(id);
    if (!ok) {
      return NextResponse.json({ error: "删除失败" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
