"use client";

import React, { useEffect, useRef, useState, JSX } from "react";
import "leaflet/dist/leaflet.css";
import L, { Map as LeafletMap, TileLayer, CircleMarker } from "leaflet";
import { AirQualityModal } from "@/components/air-quality-modal";

export default function IpLocationPage(): JSX.Element {
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mapRef = useRef<LeafletMap | null>(null);
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const tileLayerRef = useRef<TileLayer | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapElRef.current) return;

    const map = L.map(mapElRef.current, { minZoom: 2, zoomControl: true }).setView(
      [20, 0],
      2
    );
    mapRef.current = map;

    tileLayerRef.current = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles © Esri — Source: Esri, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      }
    ).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const detectViaIP = async () => {
      try {
        const resp = await fetch("https://ipapi.co/json/");
        if (!resp.ok) throw new Error("IP lookup failed");
        const data = await resp.json();

        setCity(data.city ?? "");
        setRegion(data.region ?? "");
        setCountry(data.country_name ?? "");

        const lat = Number(data.latitude);
        const lon = Number(data.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lon) && mapRef.current) {
          if (markerRef.current) {
            markerRef.current
              .setLatLng([lat, lon])
              .bindPopup(`${data.city}`);
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
      } catch (e) {
        console.error(e);
      }
    };

    detectViaIP();
  }, []);
  
  const onClear = () => {
    setCity("");
    setRegion("");
    setCountry("");
    if (mapRef.current) {
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
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
          {/* Header with title and action button */}
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
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

          {/* Main content */}
          <div className="p-4 md:p-6">
            {/* Location Form */}
            <form onSubmit={(e) => e.preventDefault()} className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">City</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter city name"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#A4CCC1]/50 focus:border-[#A4CCC1] outline-none transition duration-200 text-white placeholder-white/40"
                    />
                  </div>
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
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. United States"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#A4CCC1]/50 focus:border-[#A4CCC1] outline-none transition duration-200 text-white placeholder-white/40"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Map Container */}
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
                className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 bg-transparent border border-red-400/30 text-red-300 hover:bg-red-400/10 hover:border-red-400/50 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Map
              </button>
              <button
                onClick={() => {}}
                className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 bg-[#A4CCC1] text-[#0A0424] hover:bg-[#C7E8F3] shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}