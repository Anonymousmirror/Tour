import { NextResponse } from "next/server";
import { getConnectionInfo } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  const connInfo = getConnectionInfo();
  const redisUrl = process.env.REDIS_URL;

  let parsed = null;
  if (redisUrl) {
    try {
      const u = new URL(redisUrl);
      parsed = {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port,
        username: u.username,
        passwordLen: u.password?.length ?? 0,
      };
    } catch (e: unknown) {
      parsed = { error: `URL parse failed: ${e instanceof Error ? e.message : String(e)}` };
    }
  }

  // Try connecting via ioredis
  let redisTest = "not attempted";
  if (redisUrl) {
    try {
      const Redis = (await import("ioredis")).default;
      const redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 5000,
        lazyConnect: true,
      });
      await redis.connect();
      const pong = await redis.ping();
      redisTest = `SUCCESS: ${pong}`;
      await redis.quit();
    } catch (e: unknown) {
      redisTest = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json({ connInfo, parsed, redisTest }, { status: 200 });
}
