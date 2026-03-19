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

/**
 * Parse REDIS_URL (rediss://default:TOKEN@HOST:PORT) into REST API credentials.
 * Upstash REST API is available at https://HOST with the password as token.
 */
function parseRedisUrl(url: string): { restUrl: string; restToken: string } | null {
  try {
    // rediss://default:PASSWORD@host.upstash.io:6379
    const parsed = new URL(url);
    const token = parsed.password;
    const host = parsed.hostname;
    if (!token || !host) return null;
    return { restUrl: `https://${host}`, restToken: token };
  } catch {
    return null;
  }
}

// Try explicit REST env vars first, then parse from REDIS_URL
let redisUrl = findEnvVar(
  "KV_REST_API_URL",
  "UPSTASH_REDIS_REST_URL",
  "STORAGE_KV_REST_API_URL",
  "REDIS_REST_URL"
);

let redisToken = findEnvVar(
  "KV_REST_API_TOKEN",
  "UPSTASH_REDIS_REST_TOKEN",
  "STORAGE_KV_REST_API_TOKEN",
  "REDIS_REST_TOKEN"
);

// Fallback: derive REST credentials from REDIS_URL
if (!redisUrl || !redisToken) {
  const rawUrl = findEnvVar("REDIS_URL", "STORAGE_REDIS_URL", "KV_URL");
  if (rawUrl) {
    const parsed = parseRedisUrl(rawUrl);
    if (parsed) {
      redisUrl = parsed.restUrl;
      redisToken = parsed.restToken;
    }
  }
}

const hasRedis = !!(redisUrl && redisToken);

// ---------- In-memory fallback ----------
const memStore = new Map<string, string>();
const memList: { id: string; score: number }[] = [];

// ---------- Redis client ----------

let redisInstance: unknown = null;

async function getRedis() {
  if (!redisInstance) {
    const { Redis } = await import("@upstash/redis");
    redisInstance = new Redis({ url: redisUrl!, token: redisToken! });
  }
  return redisInstance as import("@upstash/redis").Redis;
}

/** Diagnostic info for debugging connection issues */
export function getConnectionInfo() {
  return {
    hasRedis,
    redisUrl: redisUrl ? `${redisUrl.slice(0, 20)}...` : "NOT SET",
    tokenLen: redisToken?.length ?? 0,
  };
}

// ---------- Public API ----------

export async function saveSubmission(submission: Submission): Promise<void> {
  const key = `submission:${submission.id}`;
  const json = JSON.stringify(submission);
  const score = new Date(submission.createdAt).getTime();

  if (hasRedis) {
    try {
      const redis = await getRedis();
      await redis.set(key, json);
      await redis.zadd("submissions", { score, member: submission.id });
    } catch (err) {
      console.error("[kv] saveSubmission Redis error:", err);
      // Fall back to memory so data isn't lost
      memStore.set(key, json);
      memList.push({ id: submission.id, score });
      memList.sort((a, b) => b.score - a.score);
    }
  } else {
    memStore.set(key, json);
    memList.push({ id: submission.id, score });
    memList.sort((a, b) => b.score - a.score);
  }
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const key = `submission:${id}`;

  if (hasRedis) {
    try {
      const redis = await getRedis();
      const data = await redis.get<string>(key);
      if (!data) return null;
      return typeof data === "string" ? JSON.parse(data) : data as unknown as Submission;
    } catch (err) {
      console.error("[kv] getSubmission Redis error:", err);
      return null;
    }
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
    try {
      const redis = await getRedis();
      ids = await redis.zrange("submissions", offset, offset + limit - 1, { rev: true });
    } catch (err) {
      console.error("[kv] listSubmissions Redis error:", err);
      ids = [];
    }
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
    try {
      const redis = await getRedis();
      return await redis.zcard("submissions");
    } catch (err) {
      console.error("[kv] countSubmissions Redis error:", err);
      return 0;
    }
  } else {
    return memList.length;
  }
}
