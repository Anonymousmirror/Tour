/**
 * Weather service using Open-Meteo API (free, no API key required).
 * - Geocoding: city name → lat/lon
 * - Forecast: up to 16 days of daily weather
 * - Beyond 16 days: falls back to seasonal description
 */

export interface DayForecast {
  date: string; // YYYY-MM-DD
  tempMax: number;
  tempMin: number;
  precipitation: number; // mm
  weatherCode: number;
  description: string;
}

export interface WeatherResult {
  /** Days covered by real API forecast */
  forecast: DayForecast[];
  /** Days beyond forecast range, described by season */
  seasonalDays: string[];
  /** City resolved by geocoding */
  resolvedCity: string;
  /** Error message if fetch failed */
  error?: string;
}

const WMO_CODES: Record<number, string> = {
  0: "晴",
  1: "大部晴朗",
  2: "多云",
  3: "阴天",
  45: "雾",
  48: "雾凇",
  51: "小毛毛雨",
  53: "中毛毛雨",
  55: "大毛毛雨",
  56: "冻毛毛雨",
  57: "强冻毛毛雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  66: "冻雨",
  67: "强冻雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  77: "雪粒",
  80: "小阵雨",
  81: "中阵雨",
  82: "大阵雨",
  85: "小阵雪",
  86: "大阵雪",
  95: "雷暴",
  96: "雷暴伴冰雹",
  99: "强雷暴伴冰雹",
};

function weatherCodeToDesc(code: number): string {
  return WMO_CODES[code] || "未知";
}

const SEASON_MAP: Record<string, string> = {
  "1": "冬季（全年最冷，北方严寒，南方湿冷）",
  "2": "冬末（仍较冷，可能有寒潮）",
  "3": "初春（气温回升，早晚仍凉，可能有春雨）",
  "4": "春季（气候温和，部分地区多雨）",
  "5": "晚春初夏（渐热，南方可能进入梅雨季）",
  "6": "夏初（气温较高，南方梅雨/北方雷阵雨）",
  "7": "盛夏（高温多雨，注意防暑，台风季）",
  "8": "盛夏（高温，午后雷阵雨多发，台风季）",
  "9": "初秋（气温渐降，秋高气爽）",
  "10": "秋季（凉爽宜人，昼夜温差大）",
  "11": "深秋入冬（气温明显下降，北方已冷）",
  "12": "冬季（寒冷，北方可能降雪，南方湿冷）",
};

function getSeasonDesc(month: number): string {
  return SEASON_MAP[String(month)] || "";
}

/**
 * Format a Date as YYYY-MM-DD using local timezone (not UTC).
 */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Get all dates in range [start, end] as YYYY-MM-DD strings (local timezone).
 */
function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const current = new Date(start);
  while (current <= end) {
    dates.push(formatLocalDate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Geocode a Chinese city name to lat/lon using Open-Meteo.
 */
async function geocodeCity(city: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=3&language=zh`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;
    const best = data.results[0];
    return { lat: best.latitude, lon: best.longitude, name: best.name || city };
  } catch {
    return null;
  }
}

/**
 * Fetch daily forecast from Open-Meteo (up to 16 days from today).
 */
async function fetchForecast(lat: number, lon: number): Promise<Map<string, DayForecast>> {
  const map = new Map<string, DayForecast>();
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Asia%2FShanghai&forecast_days=16`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return map;
    const data = await res.json();
    const daily = data.daily;
    if (!daily || !daily.time) return map;
    for (let i = 0; i < daily.time.length; i++) {
      const code = daily.weather_code[i];
      map.set(daily.time[i], {
        date: daily.time[i],
        tempMax: daily.temperature_2m_max[i],
        tempMin: daily.temperature_2m_min[i],
        precipitation: daily.precipitation_sum[i],
        weatherCode: code,
        description: weatherCodeToDesc(code),
      });
    }
  } catch {
    // silently fail, will use seasonal fallback
  }
  return map;
}

/**
 * Main entry: fetch weather for a city and date range.
 * Returns real forecast for dates within 16 days, seasonal hints for the rest.
 */
export async function getWeatherForTrip(
  city: string,
  startDate: string,
  endDate: string
): Promise<WeatherResult> {
  if (!city || !startDate || !endDate) {
    return { forecast: [], seasonalDays: [], resolvedCity: city, error: "缺少城市或日期信息" };
  }

  // Geocode
  const geo = await geocodeCity(city);
  if (!geo) {
    // Fallback: all seasonal
    const allDates = getDateRange(startDate, endDate);
    const seasonalDays = allDates.map((d) => {
      const month = new Date(d + "T00:00:00").getMonth() + 1;
      return `${d}：${getSeasonDesc(month)}（无法获取精确预报）`;
    });
    return { forecast: [], seasonalDays, resolvedCity: city, error: "无法定位城市坐标" };
  }

  // Fetch forecast
  const forecastMap = await fetchForecast(geo.lat, geo.lon);
  const allDates = getDateRange(startDate, endDate);

  const forecast: DayForecast[] = [];
  const seasonalDays: string[] = [];

  for (const date of allDates) {
    const fc = forecastMap.get(date);
    if (fc) {
      forecast.push(fc);
    } else {
      const month = new Date(date + "T00:00:00").getMonth() + 1;
      seasonalDays.push(`${date}（${month}月）：${getSeasonDesc(month)}`);
    }
  }

  return { forecast, seasonalDays, resolvedCity: geo.name };
}

/**
 * Format WeatherResult into a text block for the prompt.
 */
export function formatWeatherForPrompt(weather: WeatherResult): string {
  const lines: string[] = [];

  if (weather.forecast.length > 0) {
    lines.push("以下为真实天气预报数据（来源：Open-Meteo），请严格参考：");
    for (const day of weather.forecast) {
      const rain = day.precipitation > 0 ? `，降水${day.precipitation}mm` : "";
      lines.push(`  - ${day.date}：${day.description}，${day.tempMin}~${day.tempMax}°C${rain}`);
    }
  }

  if (weather.seasonalDays.length > 0) {
    if (weather.forecast.length > 0) {
      lines.push("");
      lines.push("以下日期超出预报范围，请基于季节气候特征与城市地理位置推断天气：");
    } else {
      lines.push("无法获取精确天气预报，请基于以下季节气候特征与城市地理位置推断天气：");
    }
    for (const s of weather.seasonalDays) {
      lines.push(`  - ${s}`);
    }
  }

  if (weather.error) {
    lines.push(`注意：${weather.error}，天气数据仅供参考。`);
  }

  lines.push("");
  lines.push("请结合以上天气信息调整行程中的室内外活动比例、着装建议和必备物品。");

  return lines.join("\n");
}
