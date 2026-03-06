/* ─── WeatherWidget ─── Live weather + real-time clock ─────────────────
 * Uses Open-Meteo free API (no key required) for real weather data.
 * Fetches user geolocation via browser API, falls back to San Francisco.
 * Updates clock every second. Refreshes weather every 10 minutes.
 * ──────────────────────────────────────────────────────────────────── */
import { useState, useEffect, useCallback, useRef } from 'react';

/* ─── Types ─── */
interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  weatherCode: number;
  isDay: boolean;
  daily: {
    day: string;
    high: number;
    low: number;
    code: number;
  }[];
}

interface GeoLocation {
  lat: number;
  lon: number;
  city: string;
  region: string;
}

/* ─── Weather code → icon + label ─── */
function getWeatherInfo(code: number, isDay: boolean) {
  // WMO Weather interpretation codes
  if (code === 0) return { label: 'Clear', icon: isDay ? 'sun' : 'moon' };
  if (code <= 3) return { label: 'Partly Cloudy', icon: 'cloud-sun' };
  if (code <= 49) return { label: 'Foggy', icon: 'fog' };
  if (code <= 59) return { label: 'Drizzle', icon: 'drizzle' };
  if (code <= 69) return { label: 'Rain', icon: 'rain' };
  if (code <= 79) return { label: 'Snow', icon: 'snow' };
  if (code <= 84) return { label: 'Showers', icon: 'rain' };
  if (code <= 94) return { label: 'Snow Showers', icon: 'snow' };
  return { label: 'Thunderstorm', icon: 'storm' };
}

/* ─── SVG Weather Icons ─── */
function WeatherIcon({ type, className }: { type: string; className?: string }) {
  const cn = className ?? 'h-8 w-8 text-white';
  switch (type) {
    case 'sun':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      );
    case 'moon':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
        </svg>
      );
    case 'cloud-sun':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z" />
        </svg>
      );
    case 'rain':
    case 'drizzle':
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
        </svg>
      );
    case 'snow':
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-6-6l6 6 6-6M6 9l6-6 6 6" />
        </svg>
      );
    case 'storm':
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.412 15.655L9.75 21.75l3.745-4.012M9.257 13.5H3.75l2.659-2.849m2.048-2.194L14.25 2.25 12 10.5h8.25l-4.707 5.043" />
        </svg>
      );
    default: // fog, etc
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
        </svg>
      );
  }
}

/* ─── Mini analog clock face ─── */
function AnalogClock({ time }: { time: Date }) {
  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = hours * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6;
  const secondDeg = seconds * 6;

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      {/* Face */}
      <circle cx="50" cy="50" r="48" fill="white" fillOpacity={0.1} stroke="white" strokeOpacity={0.3} strokeWidth="1" />
      {/* Hour markers */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = 50 + 40 * Math.cos(angle);
        const y1 = 50 + 40 * Math.sin(angle);
        const x2 = 50 + 44 * Math.cos(angle);
        const y2 = 50 + 44 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeOpacity={0.6} strokeWidth={i % 3 === 0 ? 2 : 1} />;
      })}
      {/* Hour hand */}
      <line
        x1="50" y1="50"
        x2={50 + 25 * Math.cos((hourDeg - 90) * (Math.PI / 180))}
        y2={50 + 25 * Math.sin((hourDeg - 90) * (Math.PI / 180))}
        stroke="white" strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Minute hand */}
      <line
        x1="50" y1="50"
        x2={50 + 34 * Math.cos((minuteDeg - 90) * (Math.PI / 180))}
        y2={50 + 34 * Math.sin((minuteDeg - 90) * (Math.PI / 180))}
        stroke="white" strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Second hand */}
      <line
        x1="50" y1="50"
        x2={50 + 36 * Math.cos((secondDeg - 90) * (Math.PI / 180))}
        y2={50 + 36 * Math.sin((secondDeg - 90) * (Math.PI / 180))}
        stroke="#f97316" strokeWidth="0.8" strokeLinecap="round"
      />
      {/* Center dot */}
      <circle cx="50" cy="50" r="2" fill="white" />
    </svg>
  );
}

/* ─── Defaults ─── */
const DEFAULT_GEO: GeoLocation = { lat: 37.7749, lon: -122.4194, city: 'San Francisco', region: 'California' };
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 min

/* ─── Fetch weather from Open-Meteo ─── */
async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,uv_index,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=4&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather API error');
  const data = await res.json();

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return {
    temperature: Math.round(data.current.temperature_2m),
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: Math.round(data.current.wind_speed_10m),
    uvIndex: Math.round(data.current.uv_index),
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1,
    daily: data.daily.time.slice(1, 4).map((date: string, i: number) => {
      const d = new Date(date + 'T12:00:00');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isToday = d.toDateString() === tomorrow.toDateString();
      return {
        day: isToday ? 'Tomorrow' : `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`,
        high: Math.round(data.daily.temperature_2m_max[i + 1]),
        low: Math.round(data.daily.temperature_2m_min[i + 1]),
        code: data.daily.weather_code[i + 1],
      };
    }),
  };
}

/* ─── Main Component ─── */
export function WeatherWidget() {
  const [now, setNow] = useState(new Date());
  const [geo, setGeo] = useState<GeoLocation>(DEFAULT_GEO);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Real-time clock — tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode via Open-Meteo geocoding
        try {
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1`);
          const data = await res.json();
          if (data.results?.[0]) {
            setGeo({
              lat: latitude,
              lon: longitude,
              city: data.results[0].name,
              region: data.results[0].admin1 ?? data.results[0].country,
            });
          } else {
            setGeo({ ...DEFAULT_GEO, lat: latitude, lon: longitude });
          }
        } catch {
          setGeo({ ...DEFAULT_GEO, lat: latitude, lon: longitude });
        }
      },
      () => {/* denied – keep default */},
      { timeout: 5000 },
    );
  }, []);

  // Fetch weather data
  const loadWeather = useCallback(async () => {
    try {
      const data = await fetchWeather(geo.lat, geo.lon);
      setWeather(data);
    } catch {
      // Keep previous data or null
    } finally {
      setLoading(false);
    }
  }, [geo.lat, geo.lon]);

  useEffect(() => {
    loadWeather();
    timerRef.current = setInterval(loadWeather, REFRESH_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [loadWeather]);

  // Formatted time
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const weatherInfo = weather ? getWeatherInfo(weather.weatherCode, weather.isDay) : null;

  return (
    <div
      data-animate
      className="group relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-linear-to-b from-sky-500 to-indigo-500 shadow-2xl transition-all duration-300 hover:shadow-sky-500/25 min-h-0"
    >
      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%221%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2016.2A4.5%204.5%200%200017.5%208h-1.8A7%207%200%104%2014.9%22%2F%3E%3Cpath%20d%3D%22M12%2012v9%22%2F%3E%3Cpath%20d%3D%22M8%2017l4%204%22%2F%3E%3Cpath%20d%3D%22M16%2017l-4%204%22%2F%3E%3C%2Fsvg%3E')] bg-center opacity-5" />

      <div className="relative flex h-full flex-col p-2.5">
        {/* Location + live time */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-white">{geo.city}</h3>
            <p className="text-[8px] text-white/80">{geo.region}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold text-white tabular-nums">{timeStr}</p>
            <p className="text-[7px] text-white/70">{dateStr}</p>
          </div>
        </div>

        {/* Temperature + weather icon */}
        <div className="mt-2 flex items-center justify-between">
          <div>
            <div className="flex items-start">
              <span className="text-3xl font-bold text-white">
                {loading ? '--' : `${weather?.temperature}°`}
              </span>
              <span className="mt-0.5 text-sm text-white/80">F</span>
            </div>
            {weatherInfo && (
              <p className="text-[8px] text-white/70 mt-0.5">{weatherInfo.label}</p>
            )}
          </div>
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-white/20 blur-lg transition-opacity duration-300 group-hover:opacity-75" />
            {weatherInfo ? (
              <WeatherIcon type={weatherInfo.icon} className="relative h-8 w-8 text-white" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-white/10 p-1.5 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <svg className="h-3 w-3 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-[7px] text-white/80">Humidity</span>
            <span className="text-[10px] font-semibold text-white">{loading ? '--' : `${weather?.humidity}%`}</span>
          </div>
          <div className="flex flex-col items-center">
            <svg className="h-3 w-3 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            </svg>
            <span className="text-[7px] text-white/80">Wind</span>
            <span className="text-[10px] font-semibold text-white">{loading ? '--' : `${weather?.windSpeed}mph`}</span>
          </div>
          <div className="flex flex-col items-center">
            <svg className="h-3 w-3 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
            <span className="text-[7px] text-white/80">UV</span>
            <span className="text-[10px] font-semibold text-white">{loading ? '--' : weather?.uvIndex}</span>
          </div>
        </div>

        {/* Analog clock */}
        <div className="mt-2 flex items-center justify-center">
          <div className="h-16 w-16">
            <AnalogClock time={now} />
          </div>
        </div>

        {/* Forecast */}
        <div className="mt-1.5 flex-1 min-h-0 flex flex-col">
          <h4 className="mb-1 text-[8px] font-medium text-white/80">3-Day Forecast</h4>
          <div className="space-y-1 flex-1">
            {weather?.daily.map((day, i) => {
              const dayInfo = getWeatherInfo(day.code, true);
              return (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white/10 px-2 py-1 backdrop-blur-sm">
                  <span className="text-[8px] font-medium text-white truncate max-w-[50%]">{day.day}</span>
                  <div className="flex items-center gap-1.5">
                    <WeatherIcon type={dayInfo.icon} className="h-3 w-3 text-white" />
                    <span className="text-[8px] font-semibold text-white">{day.low}°</span>
                    <span className="text-[8px] text-white/60">{day.high}°</span>
                  </div>
                </div>
              );
            }) ?? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-5 rounded-lg bg-white/10 animate-pulse" />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
