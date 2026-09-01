import type { WeatherSnapshot } from "./types";

const WMO: Record<number, string> = {
  0: "açık",
  1: "çoğunlukla açık",
  2: "parçalı bulutlu",
  3: "kapalı",
  45: "sisli",
  48: "kırağılı sis",
  51: "hafif çisenti",
  61: "hafif yağmur",
  63: "yağmur",
  65: "şiddetli yağmur",
  71: "hafif kar",
  73: "kar",
  75: "yoğun kar",
  80: "sağanak",
  95: "gök gürültülü",
};

export function weatherLabel(code: number): string {
  return WMO[code] ?? "değişken";
}

export async function fetchWeather(city?: string): Promise<WeatherSnapshot> {
  let lat = 41.0082;
  let lon = 28.9784;
  let name = "İstanbul";

  const q = city?.trim();
  if (q) {
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=tr`,
    );
    if (geo.ok) {
      const body = (await geo.json()) as {
        results?: { name: string; latitude: number; longitude: number; country?: string }[];
      };
      const hit = body.results?.[0];
      if (hit) {
        lat = hit.latitude;
        lon = hit.longitude;
        name = hit.name;
      }
    }
  }

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`,
  );
  if (!res.ok) throw new Error("Hava alınamadı");
  const data = (await res.json()) as {
    current: {
      temperature_2m: number;
      weather_code: number;
      wind_speed_10m: number;
      relative_humidity_2m: number;
    };
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
    };
  };

  return {
    city: name,
    temp: Math.round(data.current.temperature_2m),
    code: data.current.weather_code,
    wind: Math.round(data.current.wind_speed_10m),
    humidity: Math.round(data.current.relative_humidity_2m),
    daily: data.daily.time.map((date, i) => ({
      date,
      min: Math.round(data.daily.temperature_2m_min[i] ?? 0),
      max: Math.round(data.daily.temperature_2m_max[i] ?? 0),
      code: data.daily.weather_code[i] ?? 0,
    })),
    fetchedAt: Date.now(),
  };
}
