"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const palette = {
    midnight: "#0A0424",
    deep: "#18314F",
    sea: "#A4CCC1",
    ice: "#C7E8F3",
} as const;

type AqiPoint = {
    aqi: number;
    pm25?: number;
    pm10?: number;
    o3?: number;
    no2?: number;
    so2?: number;
    co?: number;
    datetime?: string;
};

type GeminiAdvice = {
    safe_to_go_out: boolean;
    risk_summary: string;
    recommendations: string[];
};

type Illness = {
    id?: string;
    name: string;
    severity: "low" | "medium" | "high";
    notes: string;
    user_id: string;
};

function useIpLocation() {
    const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
    const [city, setCity] = useState<string | null>(null);
    const [ip, setIp] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchIpLoc = useCallback(async () => {
        try {
            setError(null);
            // Use a public IP geo endpoint (no key). Alternatives: https://ipapi.co/json/, https://ipinfo.io/json
            // ipwho.is returns: { success, latitude, longitude, city, ip, ... }
            const res = await fetch("https://ipwho.is/?fields=latitude,longitude,city,ip,success,message");
            const data = await res.json();
            if (!data?.success) throw new Error(data?.message || "Failed to resolve IP location");
            setCoords({ lat: data.latitude, lon: data.longitude });
            setCity(data.city ?? null);
            setIp(data.ip ?? null);
        } catch (e: unknown) {
            setError((e as Error)?.message || "IP geolocation failed");
        }
    }, []);

    useEffect(() => {
        void fetchIpLoc();
    }, [fetchIpLoc]);

    return { coords, city, ip, error, refresh: fetchIpLoc } as const;
}

async function fetchAqi(lat: number, lon: number): Promise<AqiPoint | null> {
    // Align with AirQualityModal: use Open-Meteo Air Quality API
    const response = await axios.get(
        "https://air-quality-api.open-meteo.com/v1/air-quality",
        {
            params: {
                latitude: lat,
                longitude: lon,
                current: "us_aqi", // request current US AQI
                hourly: "pm2_5,us_aqi", // also fetch hourly series for fallback/latest pm2.5
                timezone: "auto",
            },
            timeout: 15000,
            validateStatus: (status) => status < 500,
        }
    );

    const data = response.data;
    if (!data || typeof data !== "object") return null;

    const current = data.current as { us_aqi?: number; time?: string } | undefined;
    const hourly = data.hourly as { pm2_5?: Array<number | null | undefined> } | undefined;

    const aqi = current?.us_aqi;
    if (aqi == null) return null;

    // Determine latest PM2.5 similar to AirQualityModal
    let latestPm25: number | undefined;
    if (typeof (data?.current as { pm2_5?: number })?.pm2_5 === 'number') {
        latestPm25 = (data.current as { pm2_5?: number })?.pm2_5;
    } else if (hourly?.pm2_5 && Array.isArray(hourly.pm2_5)) {
        for (let i = hourly.pm2_5.length - 1; i >= 0; i--) {
            const v = hourly.pm2_5[i];
            if (v !== null && v !== undefined) {
                latestPm25 = v as number;
                break;
            }
        }
    }

    const point: AqiPoint = {
        aqi,
        pm25: latestPm25,
        datetime: current?.time,
    };

    return point;
}

// AQI Cache utility with IP-based keys and expiration
interface CachedAqiData {
    data: AqiPoint;
    timestamp: number;
    ip: string;
    coords: { lat: number; lon: number };
}

function getAqiCacheKey(ip: string): string {
    return `aqi_cache_${ip}`;
}

function getCachedAqiData(ip: string): AqiPoint | null {
    try {
        const key = getAqiCacheKey(ip);
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const parsed: CachedAqiData = JSON.parse(cached);
        const now = Date.now();
        const cacheAge = now - parsed.timestamp;
        const cacheExpiry = 60 * 60 * 1000; // 1 hour in milliseconds

        // Check if cache is expired or IP/location changed
        if (cacheAge > cacheExpiry || parsed.ip !== ip) {
            localStorage.removeItem(key);
            return null;
        }

        return parsed.data;
    } catch {
        // If cache is corrupted, remove it
        localStorage.removeItem(getAqiCacheKey(ip));
        return null;
    }
}

function setCachedAqiData(ip: string, data: AqiPoint, coords: { lat: number; lon: number }): void {
    try {
        const key = getAqiCacheKey(ip);
        const cacheData: CachedAqiData = {
            data,
            timestamp: Date.now(),
            ip,
            coords,
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
    } catch {
        // Silently fail if localStorage is not available
        console.warn('Failed to cache AQI data');
    }
}

function clearAqiCache(ip?: string): void {
    try {
        if (ip) {
            // Clear cache for specific IP
            localStorage.removeItem(getAqiCacheKey(ip));
        } else {
            // Clear all AQI cache entries
            const keys = Object.keys(localStorage).filter(key => key.startsWith('aqi_cache_'));
            keys.forEach(key => localStorage.removeItem(key));
        }
    } catch {
        console.warn('Failed to clear AQI cache');
    }
}

async function forceRefreshAqi(lat: number, lon: number, ip: string): Promise<AqiPoint | null> {
    // Clear cache for this IP and fetch fresh data
    clearAqiCache(ip);
    const freshData = await fetchAqi(lat, lon);
    if (freshData) {
        setCachedAqiData(ip, freshData, { lat, lon });
    }
    return freshData;
}

function aqiLevel(aqi: number) {
    if (aqi <= 50) return { label: "Good", color: "text-green-500" } as const;
    if (aqi <= 100) return { label: "Moderate", color: "text-yellow-500" } as const;
    if (aqi <= 150) return { label: "Sensitive", color: "text-orange-500" } as const;
    if (aqi <= 200) return { label: "Unhealthy", color: "text-red-500" } as const;
    if (aqi <= 300) return { label: "Very Unhealthy", color: "text-purple-500" } as const;
    return { label: "Hazardous", color: "text-pink-600" } as const;
}

function buildPrompt(lat: number, lon: number, point: AqiPoint, conditions: Illness[]) {
    const { aqi, pm25, pm10, o3, no2, so2, co } = point;
    const conditionsSummary = conditions && conditions.length
        ? conditions
            .slice(0, 8)
            .map((c) => `${c.name}${c.severity ? `(${c.severity})` : ""}${c.notes ? ` - ${c.notes}` : ""}`)
            .join("; ")
        : "none reported";
    return `You are a concise respiratory-health advisor.
Given local air metrics, assess outdoor safety and health risks for a general adult.

Respond ONLY with compact JSON matching this TypeScript type:
{
  "safe_to_go_out": boolean,
  "risk_summary": string,
  "recommendations": string[]
}

Rules:
- Be specific to the given AQI and pollutants.
- If unsafe, quantify risk and short-term symptoms likely; if safe, provide brief caveats.
- Recommendations must be actionable (mask type, activity duration, indoor alternatives, timing/day suggestions).
- Keep strings short (<220 chars each). No markdown.

Inputs:
- Location: lat ${lat.toFixed(4)}, lon ${lon.toFixed(4)}
- AQI: ${aqi}
- PM2.5: ${pm25 ?? "n/a"}
- PM10: ${pm10 ?? "n/a"}
- O3: ${o3 ?? "n/a"}
- NO2: ${no2 ?? "n/a"}
- SO2: ${so2 ?? "n/a"}
- CO: ${co ?? "n/a"}
- User health conditions (consider risks/recs tailored to these): ${conditionsSummary}`;
}

async function getGeminiAdvice(prompt: string): Promise<GeminiAdvice> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY");

    const genAI = new GoogleGenerativeAI(apiKey);
    // Try a sequence of commonly available models to avoid 404s on certain API versions
    const candidateModels = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemma-3-27b-it",
    ];

    let text: string | null = null;
    let lastErr: unknown = null;
    for (const m of candidateModels) {
        try {
            const model = genAI.getGenerativeModel({
                model: m,
                generationConfig: {
                    temperature: 0,
                    topP: 0,
                    topK: 1,
                    candidateCount: 1,
                },
            });
            const res = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
            text = res.response.text().trim();
            if (text) break;
        } catch (e) {
            lastErr = e;
            continue;
        }
    }
    if (!text) {
        throw new Error(`Gemini request failed${lastErr ? ": " + ((lastErr as Error)?.message || String(lastErr)) : ""}`);
    }

    // Try to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;
    const parsed = JSON.parse(jsonText);
    // Basic shape guard
    if (
        typeof parsed.safe_to_go_out === "boolean" &&
        typeof parsed.risk_summary === "string" &&
        Array.isArray(parsed.recommendations)
    ) {
        return parsed as GeminiAdvice;
    }
    throw new Error("Unexpected Gemini output format");
}

export default function MedicalReviewCard() {
    const { coords, city, ip, error: locError, refresh: refreshIp } = useIpLocation();
    const [aqiPoint, setAqiPoint] = useState<AqiPoint | null>(null);
    const [loading, setLoading] = useState(false);
    const [advice, setAdvice] = useState<GeminiAdvice | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFromCache, setIsFromCache] = useState(false);
    const { user } = useAuth();
    const supabase = useMemo(() => createSupabaseClient(), []);
    const [conditions, setConditions] = useState<Illness[]>([]);
    const [condLoading, setCondLoading] = useState(false);
    const [conditionsLoaded, setConditionsLoaded] = useState(false);
    const conditionsRef = useRef<Illness[]>([]);
    const hasAutoRefreshedRef = useRef(false);

    // Fetch user's health conditions
    useEffect(() => {
        const fetchConditions = async () => {
            if (!user) {
                setConditions([]);
                setConditionsLoaded(true);
                return;
            }
            try {
                setCondLoading(true);
                const { data, error } = await supabase
                    .from('user_illnesses')
                    .select('*')
                    .eq('user_id', user.id);
                if (error) throw error;
                setConditions(data || []);
            } catch (e) {
                console.error('Failed to load health conditions', e);
            } finally {
                setCondLoading(false);
                setConditionsLoaded(true);
            }
        };
        void fetchConditions();
    }, [supabase, user]);

    // Keep a ref in sync to avoid re-creating callbacks when conditions change
    useEffect(() => {
        conditionsRef.current = conditions;
    }, [conditions]);

    const status = useMemo(() => {
        const aqi = aqiPoint?.aqi ?? null;
        return aqi != null ? aqiLevel(aqi) : null;
    }, [aqiPoint]);

    const refresh = useCallback(async () => {
        if (!coords || !ip) return;
        setLoading(true);
        setError(null);
        setAdvice(null);
        setIsFromCache(false);

        try {
            // Check if we have cached data first
            const cachedData = getCachedAqiData(ip);
            if (cachedData) {
                setAqiPoint(cachedData);
                setIsFromCache(true);
                const prompt = buildPrompt(coords.lat, coords.lon, cachedData, conditionsRef.current);
                const ai = await getGeminiAdvice(prompt);
                setAdvice(ai);
                setLoading(false);
                return;
            }

            // Fetch fresh data if no cache
            const latest = await fetchAqi(coords.lat, coords.lon);
            if (!latest) throw new Error("No AQI data available");
            setAqiPoint(latest);
            setCachedAqiData(ip, latest, { lat: coords.lat, lon: coords.lon });
            const prompt = buildPrompt(coords.lat, coords.lon, latest, conditionsRef.current);
            const ai = await getGeminiAdvice(prompt);
            setAdvice(ai);
        } catch (e: unknown) {
            setError((e as Error)?.message || "Failed to load review");
        } finally {
            setLoading(false);
        }
    }, [coords, ip]);

    const forceRefresh = useCallback(async () => {
        if (!coords || !ip) return;
        setLoading(true);
        setError(null);
        setAdvice(null);
        setIsFromCache(false);

        try {
            const latest = await forceRefreshAqi(coords.lat, coords.lon, ip);
            if (!latest) throw new Error("No AQI data available");
            setAqiPoint(latest);
            const prompt = buildPrompt(coords.lat, coords.lon, latest, conditionsRef.current);
            const ai = await getGeminiAdvice(prompt);
            setAdvice(ai);
        } catch (e: unknown) {
            setError((e as Error)?.message || "Failed to load review");
        } finally {
            setLoading(false);
        }
    }, [coords, ip]);

    useEffect(() => {
        // Auto-run once when both location and conditions are ready
        if (!hasAutoRefreshedRef.current && coords && conditionsLoaded) {
            hasAutoRefreshedRef.current = true;
            void refresh();
        }
    }, [coords, conditionsLoaded, refresh]);

    return (
        <Card
            className="rounded-2xl border border-white/10 bg-[#18314F]/50 backdrop-blur"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
        >
            <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg" style={{ color: palette.ice }}>AI Medical Review</CardTitle>
                        <CardDescription className="text-white/80">Personalized guidance from AQI in your area</CardDescription>
                    </div>
                    <Button
                        onClick={refresh}
                        variant="outline"
                        className="rounded-xl border px-4 py-2 text-sm"
                        style={{ borderColor: `${palette.ice}55`, color: palette.ice, background: "transparent" }}
                        disabled={loading || !coords}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                    </Button>
                    {isFromCache && !loading && (
                        <Button
                            onClick={forceRefresh}
                            variant="outline"
                            size="sm"
                            className="rounded-xl border px-3 py-1 text-xs"
                            style={{ borderColor: `${palette.sea}55`, color: palette.sea, background: "transparent" }}
                            disabled={loading}
                        >
                            Force Refresh
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                {!process.env.NEXT_PUBLIC_GEMINI_API_KEY && (
                    <div className="mb-3 text-sm text-red-300">Missing NEXT_PUBLIC_GEMINI_API_KEY</div>
                )}

                {locError && (
                    <div className="mb-4 text-sm text-red-300">Location error (IP-based): {locError}
                        <Button size="sm" onClick={refreshIp} className="ml-2" variant="outline">Retry</Button>
                    </div>
                )}

                <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-white/80">
                    <MapPin className="h-4 w-4" />
                    {coords ? (
                        <span>
              {city ? <span className="font-medium" style={{ color: palette.ice }}>{city}</span> : null}
                            {city ? " • " : ""}
                            lat {coords.lat.toFixed(3)}, lon {coords.lon.toFixed(3)}
            </span>
                    ) : (
                        <span>Resolving your location from IP…</span>
                    )}
                    {aqiPoint && (
                        <span className={`ml-2 font-medium ${status?.color ?? ""}`}>
              AQI {aqiPoint.aqi} • {status?.label}
                            {isFromCache && (
                                <span className="ml-2 text-xs opacity-75" style={{ color: palette.sea }}>
                  (cached)
                </span>
                            )}
            </span>
                    )}
                </div>

                {loading && (
                    <div className="flex items-center gap-2 text-white/80"><Loader2 className="h-4 w-4 animate-spin" /> Generating review…</div>
                )}

                {error && (
                    <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-red-200 text-sm">{error}</div>
                )}

                {!loading && !error && advice && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            {advice.safe_to_go_out ? (
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                            )}
                            <span className="font-semibold">
                {advice.safe_to_go_out ? "Safe to go out" : "Not recommended to go out"}
              </span>
                        </div>
                        <p className="text-sm text-white/90">{advice.risk_summary}</p>
                        {advice.recommendations?.length > 0 && (
                            <ul className="pl-5 text-sm text-white/85" style={{ listStyleType: "disc" }}>
                                {advice.recommendations.slice(0, 5).map((r, i) => (
                                    <li key={i}>{r}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
