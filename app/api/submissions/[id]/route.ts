import { NextRequest, NextResponse } from "next/server";
import { getSubmission } from "@/lib/kv";

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
