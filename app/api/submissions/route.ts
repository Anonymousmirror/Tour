import { NextRequest, NextResponse } from "next/server";
import { saveSubmission, listSubmissions, countSubmissions, deleteAllSubmissions } from "@/lib/kv";
import type { Submission } from "@/lib/submission-types";

// POST /api/submissions — save a new submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { surveyData, prompt } = body;

    if (!surveyData || !prompt) {
      return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
    }

    const submission: Submission = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      surveyData,
      prompt,
      city: surveyData.basicInfo?.city || "",
      dateRange: surveyData.basicInfo?.startDate && surveyData.basicInfo?.endDate
        ? `${surveyData.basicInfo.startDate} ~ ${surveyData.basicInfo.endDate}`
        : "",
      companionSummary: Array.isArray(surveyData.companion)
        ? surveyData.companion.join("、")
        : "",
    };

    await saveSubmission(submission);

    return NextResponse.json({ id: submission.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// GET /api/submissions — list submissions (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const [submissions, total] = await Promise.all([
      listSubmissions(offset, Math.min(limit, 50)),
      countSubmissions(),
    ]);

    return NextResponse.json({ submissions, total, offset, limit });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// DELETE /api/submissions — delete all submissions
export async function DELETE() {
  try {
    const count = await deleteAllSubmissions();
    return NextResponse.json({ ok: true, deleted: count });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
