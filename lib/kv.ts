import type { Submission } from "./submission-types";
import Redis from "ioredis";

/**
 * Redis storage with in-memory fallback for local development.
 *
 * On Vercel: uses ioredis via REDIS_URL (standard Redis protocol, works with
 * any provider: Redis Cloud, Upstash, self-hosted, etc.)
 * Locally without env vars: uses in-memory Map (resets on server restart).
 */

// ---------- Redis connection ----------

const redisUrl = process.env.REDIS_URL;
const hasRedis = !!redisUrl;

let redisInstance: Redis | null = null;

function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(redisUrl!, {
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
      lazyConnect: true,
    });
  }
  return redisInstance;
}

/** Diagnostic info for debugging connection issues */
export function getConnectionInfo() {
  return {
    hasRedis,
    redisUrl: redisUrl ? `${redisUrl.slice(0, 30)}...` : "NOT SET",
  };
}

// ---------- In-memory fallback ----------
const memStore = new Map<string, string>();
const memList: { id: string; score: number }[] = [];

// ---------- Public API ----------

export async function saveSubmission(submission: Submission): Promise<void> {
  const key = `submission:${submission.id}`;
  const json = JSON.stringify(submission);
  const score = new Date(submission.createdAt).getTime();

  if (hasRedis) {
    try {
      const redis = getRedis();
      await redis.set(key, json);
      await redis.zadd("submissions", score.toString(), submission.id);
    } catch (err) {
      console.error("[kv] saveSubmission Redis error:", err);
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
      const redis = getRedis();
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data);
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
      const redis = getRedis();
      ids = await redis.zrevrange("submissions", offset, offset + limit - 1);
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
      const redis = getRedis();
      return await redis.zcard("submissions");
    } catch (err) {
      console.error("[kv] countSubmissions Redis error:", err);
      return 0;
    }
  } else {
    return memList.length;
  }
}
