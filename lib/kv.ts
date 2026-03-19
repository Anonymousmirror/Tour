import type { Submission } from "./submission-types";

/**
 * Redis storage with in-memory fallback for local development.
 *
 * On Vercel: uses @upstash/redis via environment variables.
 * Supports multiple env var naming conventions (Upstash integration may use
 * different prefixes like KV_, STORAGE_, or REDIS_).
 * Locally without env vars: uses in-memory Map (resets on server restart).
 */

// ---------- Detect Redis env vars ----------

function findEnvVar(...candidates: string[]): string | undefined {
  for (const name of candidates) {
    if (process.env[name]) return process.env[name];
  }
  return undefined;
}

const redisUrl = findEnvVar(
  "KV_REST_API_URL",
  "STORAGE_KV_REST_API_URL",
  "UPSTASH_REDIS_REST_URL",
  "STORAGE_UPSTASH_REDIS_REST_URL",
  "REDIS_REST_URL",
  "STORAGE_REST_URL",
  "KV_URL",
  "STORAGE_URL"
);

const redisToken = findEnvVar(
  "KV_REST_API_TOKEN",
  "STORAGE_KV_REST_API_TOKEN",
  "UPSTASH_REDIS_REST_TOKEN",
  "STORAGE_UPSTASH_REDIS_REST_TOKEN",
  "REDIS_REST_TOKEN",
  "STORAGE_REST_TOKEN",
  "KV_TOKEN",
  "STORAGE_TOKEN"
);

const hasRedis = !!(redisUrl && redisToken);

// ---------- In-memory fallback ----------
const memStore = new Map<string, string>();
const memList: { id: string; score: number }[] = [];

// ---------- Redis client ----------

async function getRedis() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url: redisUrl!, token: redisToken! });
}

// ---------- Public API ----------

export async function saveSubmission(submission: Submission): Promise<void> {
  const key = `submission:${submission.id}`;
  const json = JSON.stringify(submission);
  const score = new Date(submission.createdAt).getTime();

  if (hasRedis) {
    const redis = await getRedis();
    await redis.set(key, json);
    await redis.zadd("submissions", { score, member: submission.id });
  } else {
    memStore.set(key, json);
    memList.push({ id: submission.id, score });
    memList.sort((a, b) => b.score - a.score);
  }
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const key = `submission:${id}`;

  if (hasRedis) {
    const redis = await getRedis();
    const data = await redis.get<string>(key);
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

  if (hasRedis) {
    const redis = await getRedis();
    ids = await redis.zrange("submissions", offset, offset + limit - 1, { rev: true });
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
  if (hasRedis) {
    const redis = await getRedis();
    return await redis.zcard("submissions");
  } else {
    return memList.length;
  }
}
