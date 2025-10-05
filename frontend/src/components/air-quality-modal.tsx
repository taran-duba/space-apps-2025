"use client";

import { useEffect, useState, MutableRefObject } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SemiGauge from "./semi-gauge";

interface AirQualityData {
  city_name: string;
  country_code: string;
  data: Array<{
    aqi: number;
    co: number;
    datetime: string;
    no2: number;
    o3: number;
    pm10: number;
    pm25: number;
    so2: number;
    timestamp_local: string;
    timestamp_utc: string;
    ts: number;
  }>;
  lat: number;
  lon: number;
  state_code: string;
  timezone: string;
}

interface AirQualityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city: string;
  mapRef?: MutableRefObject<import("leaflet").Map | null>;
  markerRef?: MutableRefObject<import("leaflet").CircleMarker | null>;
}

export function AirQualityModal({
  open,
  onOpenChange,
  city,
  mapRef,
  markerRef,
}: AirQualityModalProps) {
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !city) return;

    const fetchAirQuality = async () => {
      setLoading(true);
      setError(null);

      try {
        // Dynamically import Leaflet (SSR-safe)
        const L: typeof import("leaflet") = (await import("leaflet")).default;

        // Get coordinates of city
        const geocodeResponse = await axios.get(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            city
          )}&count=1&language=en&format=json`
        );

        const results = geocodeResponse.data?.results;
        if (!results?.length) throw new Error("City not found");

        const { latitude, longitude } = results[0];

        // Ensure API key exists
        if (!process.env.NEXT_PUBLIC_RAPIDAPI_KEY) {
          throw new Error(
            "NEXT_PUBLIC_RAPIDAPI_KEY environment variable is missing"
          );
        }

        const response = await axios.get(
          "https://air-quality.p.rapidapi.com/history/airquality",
          {
            params: { lat: latitude, lon: longitude },
            headers: {
              "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
              "x-rapidapi-host":
                process.env.NEXT_PUBLIC_RAPIDAPI_HOST ||
                "air-quality.p.rapidapi.com",
              "Content-Type": "application/json",
            },
            timeout: 15000,
            validateStatus: (status) => status < 500,
          }
        );

        if (!response.data?.data || !Array.isArray(response.data.data)) {
          throw new Error("Invalid API response format");
        }

        const data: AirQualityData = {
          city_name: city,
          country_code: "US",
          data: response.data.data,
          lat: latitude,
          lon: longitude,
          state_code: "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        setAirQualityData(data);

        // Update Leaflet map if refs exist
        if (mapRef?.current) {
          const latLng: [number, number] = [data.lat, data.lon];

          if (markerRef) {
            if (markerRef.current) {
              markerRef.current.setLatLng(latLng);
            } else {
              const newMarker = L.circleMarker(latLng, {
                radius: 8,
                weight: 2,
                color: "#C7E8F3",
                fillColor: "#A4CCC1",
                fillOpacity: 0.85,
              }).addTo(mapRef.current);
              markerRef.current = newMarker;
            }
          }

          mapRef.current.flyTo(latLng, 13, { animate: true });

          if (markerRef?.current && !markerRef.current.getPopup()) {
            markerRef.current
              .bindPopup(`${data.city_name}, ${data.state_code}`)
              .openPopup();
          }
        }
      } catch (err: unknown) {
        console.error("Error fetching air quality:", err);
        let message = "Failed to load air quality data.";

        if (axios.isAxiosError(err)) {
          if (err.code === "ECONNABORTED") message += " Request timed out.";
          else if (err.response)
            message += ` Server responded with ${err.response.status}.`;
          else if (err.request)
            message += " No response received from server.";
          else message += ` ${err.message}`;
        } else if (err instanceof Error) message += ` ${err.message}`;

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAirQuality();
  }, [open, city, mapRef, markerRef]);

  const latestData = airQualityData?.data[0];

  const getAqiStatus = (pm25: number) => {
    if (pm25 <= 12) return { status: "Good", color: "text-green-500" };
    if (pm25 <= 35.4) return { status: "Moderate", color: "text-yellow-500" };
    if (pm25 <= 55.4)
      return { status: "Unhealthy for Sensitive Groups", color: "text-orange-500" };
    if (pm25 <= 150.4) return { status: "Unhealthy", color: "text-red-500" };
    if (pm25 <= 250.4) return { status: "Very Unhealthy", color: "text-purple-500" };
    return { status: "Hazardous", color: "text-maroon-500" };
  };

  const aqiStatus = latestData?.pm25 !== undefined ? getAqiStatus(latestData.pm25) : null;

  const getAqiLevel = (aqi: number) => {
    if (aqi <= 50) return "good";
    if (aqi <= 100) return "moderate";
    if (aqi <= 150) return "sensitive";
    if (aqi <= 200) return "unhealthy";
    if (aqi <= 300) return "very-unhealthy";
    return "hazardous";
  };

  const currentAqi = latestData?.aqi || 0;
  const currentAqiLevel = getAqiLevel(currentAqi);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#0A0424] border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Air Quality Information</DialogTitle>
          <DialogDescription className="text-white/80">
            {city ? `Showing air quality data for ${city}` : "No location selected"}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A4CCC1] mx-auto"></div>
            <p className="mt-4">Loading air quality data...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md text-red-200">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && airQualityData && latestData && (
          <div className="space-y-6">
            <div className="bg-[#18314F]/50 p-6 rounded-lg border border-white/10">
              <h3 className="text-sm font-medium text-white/80 mb-4 text-center">
                Air Quality Index (AQI)
              </h3>
              <div className="flex justify-center">
                <SemiGauge
                  value={latestData.aqi}
                  size={200}
                  min={0}
                  max={300}
                  label={aqiStatus?.status}
                  color={aqiStatus?.color}
                />
              </div>
            </div>
            <div className="text-xs text-white/60 italic">
              <p>Data provided by NASA&apos;s Earth Observing System Data and Information System (EOSDIS)</p>
              <p>Last updated: {new Date().toLocaleString()}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
