import { isValidCoordinate } from "../campus-zones";
import { geoCache } from "./geo-cache";
import { secureUpstreamFetch } from "./ssrf-guard";

export interface WeatherData {
  isAvailable: boolean;
  temperatureC: number;
  feelsLikeC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  precipitationMm: number;
  maxPrecipitationProbability: number;
  conditionLabel: string;
  conditionCode: number;
  isDaytime: boolean;
  rainRisk: "low" | "moderate" | "high";
  contextualAdvisory: string;
  advisoryType: "info" | "warning" | "caution";
  attribution: string;
}

/**
 * Maps WMO Weather Interpretation Codes to human descriptions and icon cues.
 */
function interpretWmoCode(code: number): { label: string; isRain: boolean; isStorm: boolean } {
  if (code === 0) return { label: "Clear sky", isRain: false, isStorm: false };
  if (code === 1) return { label: "Mainly clear", isRain: false, isStorm: false };
  if (code === 2) return { label: "Partly cloudy", isRain: false, isStorm: false };
  if (code === 3) return { label: "Overcast", isRain: false, isStorm: false };
  if (code === 45 || code === 48) return { label: "Fog / Low visibility", isRain: false, isStorm: false };
  if (code >= 51 && code <= 57) return { label: "Drizzle", isRain: true, isStorm: false };
  if (code >= 61 && code <= 65) return { label: "Rain", isRain: true, isStorm: false };
  if (code >= 80 && code <= 82) return { label: "Rain showers", isRain: true, isStorm: false };
  if (code >= 95) return { label: "Thunderstorm", isRain: true, isStorm: true };
  return { label: "Fair", isRain: false, isStorm: false };
}

/**
 * Fetches current weather and rain prediction from Open-Meteo.
 * Includes input validation, timeout protection, 15-minute caching, and safe error fallback.
 */
export async function getJourneyWeather(
  lat: number,
  lng: number,
  vehicleWheels: "2-Wheeler" | "4-Wheeler" = "2-Wheeler"
): Promise<WeatherData> {
  if (!isValidCoordinate(lat, lng)) {
    throw new Error("Invalid latitude and longitude provided for weather inquiry.");
  }

  const cacheKey = `weather:${lat.toFixed(3)},${lng.toFixed(3)}:${vehicleWheels}`;
  const cached = geoCache.get<WeatherData>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m&hourly=precipitation_probability,weather_code&forecast_days=2&timezone=auto`;

    const res = await secureUpstreamFetch(url, {}, 5000);

    if (res.ok) {
      const data = await res.json();
      const current = data.current || {};
      const hourly = data.hourly || {};

      const temp = Math.round((Number(current.temperature_2m) || 28) * 10) / 10;
      const feelsLike = Math.round((Number(current.apparent_temperature) || temp) * 10) / 10;
      const humidity = Math.round(Number(current.relative_humidity_2m) || 65);
      const windSpeed = Math.round(Number(current.wind_speed_10m) || 12);
      const precip = Math.round((Number(current.precipitation) || 0) * 10) / 10;
      const weatherCode = Number(current.weather_code) || 0;
      const isDaytime = Boolean(current.is_day ?? 1);

      // Examine upcoming 6 hours precipitation probability
      const next6Probabilities: number[] = Array.isArray(hourly.precipitation_probability)
        ? hourly.precipitation_probability.slice(0, 6).map((n: unknown) => Number(n) || 0)
        : [];
      const maxPrecipProb = next6Probabilities.length ? Math.max(...next6Probabilities) : 0;

      const { label, isRain, isStorm } = interpretWmoCode(weatherCode);

      // Assess rain risk
      let rainRisk: "low" | "moderate" | "high" = "low";
      if (isStorm || precip > 2 || maxPrecipProb >= 65) {
        rainRisk = "high";
      } else if (isRain || precip > 0 || maxPrecipProb >= 35) {
        rainRisk = "moderate";
      }

      // Generate contextual advisory tailored to 2-wheelers vs 4-wheelers
      let contextualAdvisory = "";
      let advisoryType: "info" | "warning" | "caution" = "info";

      if (vehicleWheels === "2-Wheeler") {
        if (rainRisk === "high") {
          contextualAdvisory = "Advisory: High probability of rain during your journey. Rain gear and helmet visor inspection advised.";
          advisoryType = "warning";
        } else if (rainRisk === "moderate") {
          contextualAdvisory = "Notice: Intermittent precipitation expected. Drive with caution on damp campus corridors.";
          advisoryType = "caution";
        } else if (temp > 35) {
          contextualAdvisory = "High ambient heat. Stay hydrated during extended daytime rides.";
          advisoryType = "info";
        } else {
          contextualAdvisory = `Favorable riding conditions: ${temp}°C, mild breeze, dry road surfaces.`;
          advisoryType = "info";
        }
      } else {
        if (rainRisk === "high") {
          contextualAdvisory = "Advisory: Rain showers expected. Maintain safe braking distances and verify wiper speed.";
          advisoryType = "caution";
        } else {
          contextualAdvisory = `Smooth cruising conditions: ${temp}°C, good road visibility.`;
          advisoryType = "info";
        }
      }

      const weatherResult: WeatherData = {
        isAvailable: true,
        temperatureC: temp,
        feelsLikeC: feelsLike,
        humidityPercent: humidity,
        windSpeedKmh: windSpeed,
        precipitationMm: precip,
        maxPrecipitationProbability: maxPrecipProb,
        conditionLabel: label,
        conditionCode: weatherCode,
        isDaytime,
        rainRisk,
        contextualAdvisory,
        advisoryType,
        attribution: "Weather data by Open-Meteo.com (CC BY 4.0)",
      };

      geoCache.set(cacheKey, weatherResult, 900); // 15 mins cache
      return weatherResult;
    }
  } catch (err) {
    console.warn("Open-Meteo weather fetch error:", err);
  }

  // Graceful fallback when weather API is unreachable or times out
  return {
    isAvailable: false,
    temperatureC: 28,
    feelsLikeC: 28,
    humidityPercent: 60,
    windSpeedKmh: 10,
    precipitationMm: 0,
    maxPrecipitationProbability: 0,
    conditionLabel: "Campus Baseline",
    conditionCode: 0,
    isDaytime: true,
    rainRisk: "low",
    contextualAdvisory: "Live meteorological feed temporarily unavailable. Safe campus driving rules apply.",
    advisoryType: "info",
    attribution: "Open-Meteo / Fallback Offline Estimator",
  };
}
