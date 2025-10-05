"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, CircleMarker, TileLayer } from "leaflet";

// Dynamically import AirQualityModal to prevent SSR issues
const AirQualityModal = dynamic(
  () => import("@/components/air-quality-modal").then((mod) => mod.AirQualityModal),
  { ssr: false }
);

export default function IpLocationPage() {
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mapRef = useRef<LeafletMap | null>(null);
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const tileLayerRef = useRef<TileLayer | null>(null);

  // Initialize map (client-only)
  useEffect(() => {
    if (!mapElRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      const map = L.map(mapElRef.current!, { minZoom: 2, zoomControl: true }).setView([20, 0], 2);
      mapRef.current = map;

      tileLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles © Esri — Source: Esri, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        }
      ).addTo(map);
    };

    initMap();
  }, []);

  // Detect user location via IP
  useEffect(() => {
    const detectViaIP = async () => {
      try {
        const L = (await import("leaflet")).default;
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        setCity(data.city);
        setRegion(data.region);
        setCountry(data.country_name ?? "");

        const lat = Number(data.latitude);
        const lon = Number(data.longitude);

        if (Number.isFinite(lat) && Number.isFinite(lon) && mapRef.current) {
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lon]).bindPopup(`${data.city}`);
          } else {
            markerRef.current = L.circleMarker([lat, lon], {
              radius: 8,
              weight: 2,
              color: "#C7E8F3",
              fillColor: "#A4CCC1",
              fillOpacity: 0.85,
            })
              .addTo(mapRef.current)
              .bindPopup(`${data.city}`);
          }
          mapRef.current.flyTo([lat, lon], 13, { animate: true });
        }
      } catch (err) {
        console.error("Error detecting location via IP:", err);
      }
    };

    detectViaIP();
  }, []);

  const onClear = () => {
    setCity("");
    setRegion("");
    setCountry("");

    if (mapRef.current && markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
      mapRef.current.setView([20, 0], 2);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 text-white bg-gradient-to-br from-[#0A0424] to-[#18314F] font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Location Services</h1>
          <p className="text-white/80 max-w-2xl">
            View your current location on the map and check air quality information. Your location is automatically detected using your IP address.
          </p>
        </header>

        <div className="bg-[#0f172a]/60 backdrop-blur-lg rounded-xl border border-white/10 shadow-xl overflow-hidden">
          {/* Header with title and modal button */}
          <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-[#1e293b]/50">
            <h2 className="text-lg font-semibold">Location Details</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!city}
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                city
                  ? "bg-[#A4CCC1] text-[#0A0424] hover:bg-[#C7E8F3] shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  : "bg-gray-600/50 text-gray-300 cursor-not-allowed"
              }`}
            >
              Air Quality Info
            </button>
            <AirQualityModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              city={city}
              mapRef={mapRef}
              markerRef={markerRef}
            />
          </div>

          {/* Location Form */}
          <div className="p-4 md:p-6">
            <form onSubmit={(e) => e.preventDefault()} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">City</label>
                <input
                  type="text"
                  placeholder="Enter city name"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#A4CCC1]/50 focus:border-[#A4CCC1] outline-none transition duration-200 text-white placeholder-white/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Region/State</label>
                <input
                  type="text"
                  placeholder="e.g. North Carolina"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#A4CCC1]/50 focus:border-[#A4CCC1] outline-none transition duration-200 text-white placeholder-white/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Country</label>
                <input
                  type="text"
                  placeholder="e.g. United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#A4CCC1]/50 focus:border-[#A4CCC1] outline-none transition duration-200 text-white placeholder-white/40"
                />
              </div>
            </form>

            {/* Map */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white/90">Location Map</h3>
                <span className="text-xs text-white/50">Zoom and pan to explore</span>
              </div>
              <div
                ref={mapElRef}
                className="h-[400px] w-full rounded-xl overflow-hidden border-2 border-white/10 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 border-t border-white/10">
              <button
                onClick={onClear}
                className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 bg-transparent border border-red-400/30 text-red-300 hover:bg-red-400/10 hover:border-red-400/50"
              >
                Clear Map
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 bg-[#A4CCC1] text-[#0A0424] hover:bg-[#C7E8F3] shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Refresh Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
