import { NextRequest, NextResponse } from "next/server";
import { getWeatherForTrip } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = (searchParams.get("city") || "").trim();
    const startDate = (searchParams.get("startDate") || "").trim();
    const endDate = (searchParams.get("endDate") || "").trim();

    if (!city || !startDate || !endDate) {
      return NextResponse.json(
        { error: "缺少 city、startDate 或 endDate" },
        { status: 400 }
      );
    }

    const weather = await getWeatherForTrip(city, startDate, endDate);
    return NextResponse.json(weather, { status: 200 });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
