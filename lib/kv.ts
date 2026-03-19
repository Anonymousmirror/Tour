import type { Submission } from "./submission-types";

/**
 * Vercel KV wrapper with in-memory fallback for local development.
 *
 * On Vercel: uses @vercel/kv (Redis) via KV_REST_API_URL env var.
 * Locally without env vars: uses in-memory Map (resets on server restart).
 */

const hasKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// ---------- In-memory fallback ----------
const memStore = new Map<string, string>();
const memList: { id: string; score: number }[] = [];

// ---------- KV helpers ----------

async function getKV() {
  const { kv } = await import("@vercel/kv");
  return kv;
}

export async function saveSubmission(submission: Submission): Promise<void> {
  const key = `submission:${submission.id}`;
  const json = JSON.stringify(submission);
  const score = new Date(submission.createdAt).getTime();

  if (hasKV) {
    const kv = await getKV();
    await kv.set(key, json);
    await kv.zadd("submissions", { score, member: submission.id });
  } else {
    memStore.set(key, json);
    memList.push({ id: submission.id, score });
    memList.sort((a, b) => b.score - a.score);
  }
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const key = `submission:${id}`;

  if (hasKV) {
    const kv = await getKV();
    const data = await kv.get<string>(key);
    if (!data) return null;
    return typeof data === "string" ? JSON.parse(data) : data as unknown as Submission;
  } else {
    const json = memStore.get(key);
    if (!json) return null;
    return JSON.parse(json);
  }
}

export async function listSubmissions(
  offset: number = 0,
  limit: number = 20
): Promise<Submission[]> {
  let ids: string[];

  if (hasKV) {
    const kv = await getKV();
    // zrange with rev gives newest first
    ids = await kv.zrange("submissions", offset, offset + limit - 1, { rev: true });
  } else {
    ids = memList.slice(offset, offset + limit).map((e) => e.id);
  }

  const submissions: Submission[] = [];
  for (const id of ids) {
    const sub = await getSubmission(id);
    if (sub) submissions.push(sub);
  }
  return submissions;
}

export async function countSubmissions(): Promise<number> {
  if (hasKV) {
    const kv = await getKV();
    return await kv.zcard("submissions");
  } else {
    return memList.length;
  }
}
