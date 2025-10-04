"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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

import { MutableRefObject } from 'react';
import L, { Map as LeafletMap, CircleMarker } from 'leaflet';
import SemiGauge from "./semi-gauge";

interface AirQualityModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    city: string;
    mapRef?: MutableRefObject<LeafletMap | null>;
    markerRef?: MutableRefObject<L.CircleMarker | null>;
}

export function AirQualityModal({ open, onOpenChange, city, mapRef, markerRef }: AirQualityModalProps) {
    const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !city) return;

        const fetchAirQuality = async () => {
            setLoading(true);
            setError(null);
            try {
                // First, get the coordinates for the city
                const geocodeResponse = await axios.get(
                    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
                );
                
                if (!geocodeResponse.data?.results?.length) {
                    throw new Error('Could not find coordinates for the specified city');
                }
                
                const { latitude, longitude } = geocodeResponse.data.results[0];
                
                // Check if API key is available
                if (!process.env.NEXT_PUBLIC_RAPIDAPI_KEY) {
                    throw new Error('RapidAPI key is not configured. Please set the NEXT_PUBLIC_RAPIDAPI_KEY environment variable.');
                }

                // Then get air quality data using the coordinates
                const response = await axios.get(
                    'https://air-quality.p.rapidapi.com/history/airquality',
                    {
                        params: { 
                            lon: longitude, 
                            lat: latitude,
                            // Add any additional required parameters here
                        },
                        headers: {
                            'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
                            'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPIDAPI_HOST || 'air-quality.p.rapidapi.com',
                            'Content-Type': 'application/json',
                        },
                        timeout: 15000, // Increased timeout to 15 seconds
                        validateStatus: (status) => status < 500, // Don't throw for 4xx errors
                    }
                );

                // Check for API errors
                if (response.status !== 200) {
                    throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
                }

                if (!response.data || !Array.isArray(response.data.data)) {
                    throw new Error('Invalid API response format');
                }
                
                // Transform the response to match our expected format
                const result = response.data;
                const data: AirQualityData = {
                    city_name: city,
                    country_code: 'US', // Default, can be updated if needed
                    data: result.data || [],
                    lat: latitude,
                    lon: longitude,
                    state_code: '', // Can be updated if needed
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                };
                setAirQualityData(data);

                // Update map position if map and marker refs are provided
                if (mapRef?.current) {
                    const latLng: [number, number] = [data.lat, data.lon];

                    // Update marker if it exists, or create a new one
                    if (markerRef) {
                        if (markerRef.current) {
                            markerRef.current.setLatLng(latLng);
                        } else if (mapRef.current) {
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

                    // Fly to the location
                    mapRef.current.flyTo(latLng, 13, { animate: true });

                    // Add popup if it doesn't exist
                    if (markerRef?.current && !markerRef.current.getPopup()) {
                        markerRef.current.bindPopup(`${data.city_name}, ${data.state_code}`).openPopup();
                    }
                }
            } catch (err) {
                console.error("Error fetching air quality data:", err);
                let errorMessage = "Failed to load air quality data. ";
                
                if (axios.isAxiosError(err)) {
                    if (err.code === 'ECONNABORTED') {
                        errorMessage += "Request timed out. Please check your connection and try again.";
                    } else if (err.response) {
                        // Server responded with a status code outside 2xx
                        errorMessage += `Server responded with status ${err.response.status}: ${err.response.statusText}`;
                    } else if (err.request) {
                        // Request was made but no response received
                        errorMessage += "No response from the server. Please check your connection.";
                    } else {
                        // Something happened in setting up the request
                        errorMessage += err.message;
                    }
                } else if (err instanceof Error) {
                    errorMessage += err.message;
                }
                
                setError(errorMessage);
                
                // Log the full error in development
                if (process.env.NODE_ENV === 'development') {
                    console.error('Full error details:', err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAirQuality();
    }, [open, city]);

    const getAqiStatus = (pm25: number): { status: string; color: string } => {
        if (pm25 <= 12) return { status: "Good", color: "text-green-500" };
        if (pm25 <= 35.4) return { status: "Moderate", color: "text-yellow-500" };
        if (pm25 <= 55.4) return { status: "Unhealthy for Sensitive Groups", color: "text-orange-500" };
        if (pm25 <= 150.4) return { status: "Unhealthy", color: "text-red-500" };
        if (pm25 <= 250.4) return { status: "Very Unhealthy", color: "text-purple-500" };
        return { status: "Hazardous", color: "text-maroon-500" };
    };

    const latestData = airQualityData?.data[0];
    const aqiStatus = latestData?.pm25 !== undefined ? getAqiStatus(latestData.pm25) : null;
    
    // Get current AQI level for highlighting
    const getAqiLevel = (aqi: number) => {
        if (aqi <= 50) return 'good';
        if (aqi <= 100) return 'moderate';
        if (aqi <= 150) return 'sensitive';
        if (aqi <= 200) return 'unhealthy';
        if (aqi <= 300) return 'very-unhealthy';
        return 'hazardous';
    };
    
    const currentAqi = latestData?.aqi || 0;
    const currentAqiLevel = getAqiLevel(currentAqi);
    const getAqiDescription = (aqi: number): string => {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
        if (aqi <= 200) return 'Unhealthy';
        if (aqi <= 300) return 'Very Unhealthy';
        return 'Hazardous';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-[#0A0424] border-white/20 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Air Quality Information</DialogTitle>
                    <DialogDescription className="text-white/80">
                        {city ? `Showing air quality data for ${city}` : 'No location selected'}
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

                {!loading && !error && airQualityData && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            {/* AQI Card */}
                            <div className="bg-[#18314F]/50 p-6 rounded-lg border border-white/10">
                                <h3 className="text-sm font-medium text-white/80 mb-4 text-center">Air Quality Index (AQI)</h3>
                                <div className="flex flex-col items-center">
                                    <div className="flex flex-col items-center">
                                        <div className="flex justify-center">
                                            <SemiGauge 
                                                value={latestData?.aqi || 0} 
                                                size={200}
                                                min={0}
                                                max={300}
                                                label={aqiStatus?.status}
                                                color={aqiStatus?.color}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#18314F]/50 p-4 rounded-lg border border-white/10">
                                    <h3 className="text-sm font-medium text-white/80 mb-1">PM2.5</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold">
                                            {latestData?.pm25?.toFixed(1) || 'N/A'}
                                        </span>
                                        <span className="text-sm text-white/60">μg/m³</span>
                                    </div>
                                </div>

                                <div className="bg-[#18314F]/50 p-4 rounded-lg border border-white/10">
                                    <h3 className="text-sm font-medium text-white/80 mb-1">PM10</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold">
                                            {latestData?.pm10?.toFixed(1) || 'N/A'}
                                        </span>
                                        <span className="text-sm text-white/60">μg/m³</span>
                                    </div>
                                </div>

                                <div className="bg-[#18314F]/50 p-4 rounded-lg border border-white/10">
                                    <h3 className="text-sm font-medium text-white/80 mb-1">O₃</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold">
                                            {latestData?.o3?.toFixed(1) || 'N/A'}
                                        </span>
                                        <span className="text-sm text-white/60">ppb</span>
                                    </div>
                                </div>

                                <div className="bg-[#18314F]/50 p-4 rounded-lg border border-white/10">
                                    <h3 className="text-sm font-medium text-white/80 mb-1">NO₂</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold">
                                            {latestData?.no2?.toFixed(1) || 'N/A'}
                                        </span>
                                        <span className="text-sm text-white/60">ppb</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium">Air Quality Index (AQI) Scale:</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                <div className={`p-2 rounded transition-all duration-200 ${
                                    currentAqiLevel === 'good' 
                                        ? 'bg-green-500/40 ring-2 ring-green-400/50' 
                                        : 'bg-green-500/20 hover:bg-green-500/30'
                                }`}>
                                    <div className="font-medium">0-50: Good</div>
                                    <div className={currentAqiLevel === 'good' ? 'text-white/90' : 'text-white/60'}>Air quality is satisfactory</div>
                                </div>
                                <div className={`p-2 rounded transition-all duration-200 ${
                                    currentAqiLevel === 'moderate' 
                                        ? 'bg-yellow-500/40 ring-2 ring-yellow-400/50' 
                                        : 'bg-yellow-500/20 hover:bg-yellow-500/30'
                                }`}>
                                    <div className="font-medium">51-100: Moderate</div>
                                    <div className={currentAqiLevel === 'moderate' ? 'text-white/90' : 'text-white/60'}>Acceptable quality</div>
                                </div>
                                <div className={`p-2 rounded transition-all duration-200 ${
                                    currentAqiLevel === 'sensitive' 
                                        ? 'bg-orange-500/40 ring-2 ring-orange-400/50' 
                                        : 'bg-orange-500/20 hover:bg-orange-500/30'
                                }`}>
                                    <div className="font-medium">101-150: Sensitive Groups</div>
                                    <div className={currentAqiLevel === 'sensitive' ? 'text-white/90' : 'text-white/60'}>Unhealthy for sensitive groups</div>
                                </div>
                                <div className={`p-2 rounded transition-all duration-200 ${
                                    currentAqiLevel === 'unhealthy' 
                                        ? 'bg-red-500/40 ring-2 ring-red-400/50' 
                                        : 'bg-red-500/20 hover:bg-red-500/30'
                                }`}>
                                    <div className="font-medium">151-200: Unhealthy</div>
                                    <div className={currentAqiLevel === 'unhealthy' ? 'text-white/90' : 'text-white/60'}>Health effects possible</div>
                                </div>
                                <div className={`p-2 rounded transition-all duration-200 ${
                                    currentAqiLevel === 'very-unhealthy' 
                                        ? 'bg-purple-500/40 ring-2 ring-purple-400/50' 
                                        : 'bg-purple-500/20 hover:bg-purple-500/30'
                                }`}>
                                    <div className="font-medium">201-300: Very Unhealthy</div>
                                    <div className={currentAqiLevel === 'very-unhealthy' ? 'text-white/90' : 'text-white/60'}>Health warnings</div>
                                </div>
                                <div className={`p-2 rounded transition-all duration-200 ${
                                    currentAqiLevel === 'hazardous' 
                                        ? 'bg-maroon-500/40 ring-2 ring-maroon-400/50' 
                                        : 'bg-maroon-500/20 hover:bg-maroon-500/30'
                                }`}>
                                    <div className="font-medium">301-500: Hazardous</div>
                                    <div className={currentAqiLevel === 'hazardous' ? 'text-white/90' : 'text-white/60'}>Health alert</div>
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-white/60 italic">
                            <p>Data provided by NASA's Earth Observing System Data and Information System (EOSDIS)</p>
                            <p>Last updated: {new Date().toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
