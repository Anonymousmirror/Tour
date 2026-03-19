import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const envCheck: Record<string, string> = {};

  // Check which Redis env vars exist (show first/last 4 chars only for security)
  const varsToCheck = [
    "REDIS_URL",
    "KV_REST_API_URL",
    "KV_REST_API_TOKEN",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "STORAGE_KV_REST_API_URL",
    "STORAGE_KV_REST_API_TOKEN",
    "STORAGE_REDIS_URL",
    "KV_URL",
  ];

  for (const v of varsToCheck) {
    const val = process.env[v];
    if (val) {
      envCheck[v] = val.length > 12
        ? `${val.slice(0, 6)}...${val.slice(-4)} (len=${val.length})`
        : `(len=${val.length})`;
    } else {
      envCheck[v] = "NOT SET";
    }
  }

  // Try parsing REDIS_URL
  let parsed = null;
  const redisUrl = process.env["REDIS_URL"];
  if (redisUrl) {
    try {
      const u = new URL(redisUrl);
      parsed = {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port,
        username: u.username,
        passwordLen: u.password?.length ?? 0,
        restUrl: `https://${u.hostname}`,
      };
    } catch (e: unknown) {
      parsed = { error: `URL parse failed: ${e instanceof Error ? e.message : String(e)}` };
    }
  }

  // Try connecting to Redis
  let redisTest = "not attempted";
  if (parsed && !("error" in parsed)) {
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({
        url: `https://${(parsed as { hostname: string }).hostname}`,
        token: process.env["REDIS_URL"] ? new URL(process.env["REDIS_URL"]).password : "",
      });
      const pong = await redis.ping();
      redisTest = `SUCCESS: ${pong}`;
    } catch (e: unknown) {
      redisTest = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json({ envCheck, parsed, redisTest }, { status: 200 });
}
