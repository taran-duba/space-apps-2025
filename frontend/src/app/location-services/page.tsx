import React, { useEffect, useRef, useState, JSX } from "react";
import "leaflet/dist/leaflet.css";
// If you use Next.js app router, keep this as a Client Component
// "use client";

import L, { Map as LeafletMap, TileLayer, CircleMarker } from "leaflet";

export default function IpLocationPage(): JSX.Element {
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("Detecting via IP...");

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
        setStatus("Detecting via IP...");
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
              .bindPopup(`${data.city}, ${data.region}, ${data.country_name}`);
          } else {
            markerRef.current = L.circleMarker([lat, lon], {
              radius: 8,
              weight: 2,
              color: "#C7E8F3",
              fillColor: "#A4CCC1",
              fillOpacity: 0.85,
            })
              .addTo(mapRef.current)
              .bindPopup(`${data.city}, ${data.region}, ${data.country_name}`);
          }
          mapRef.current.flyTo([lat, lon], 13, { animate: true });
        }
        setStatus(`Location found: ${data.city}, ${data.region}, ${data.country_name}`);
      } catch (e) {
        setStatus("Location detection failed.");
        console.error(e);
      }
    };

    detectViaIP();
  }, []);

  const onClear = () => {
    setCity("");
    setRegion("");
    setCountry("");
    setStatus("Cleared.");
    if (mapRef.current) {
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      mapRef.current.setView([20, 0], 2);
    }
  };

  return (
    <div className="min-h-screen p-5 text-white bg-gradient-to-br from-[#0A0424] to-[#18314F] font-sans">
      <h1 className="m-0 mb-2 text-[20px] text-white">Your Current Location</h1>
      <p className="text-white">
        This page automatically detects your approximate location using your IP address and zooms into it on the map.
      </p>

      <div className="relative max-w-[880px] rounded-xl border border-white/50 p-3 bg-[rgba(24,49,79,0.4)] backdrop-blur">
        {/* Learn More button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => window.open("https://www.epa.gov/air-trends/air-quality", "_blank")}
            className="bg-[#A4CCC1] text-[#0A0424] font-bold border-0 px-4 py-2 rounded-lg shadow transition-transform duration-300 hover:bg-[#C7E8F3] hover:scale-110"
          >
            Learn More
          </button>
        </div>

        {/* Inputs */}
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-3 flex-wrap">
          <div>
            <label className="block text-[13px] text-white mb-1">City</label>
            <input
              type="text"
              placeholder="Raleigh"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-2 py-2 rounded-md border border-white/30 min-w-[160px] bg-transparent text-white placeholder-white/60 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-[13px] text-white mb-1">Region</label>
            <input
              type="text"
              placeholder="North Carolina"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-2 py-2 rounded-md border border-white/30 min-w-[160px] bg-transparent text-white placeholder-white/60 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-[13px] text-white mb-1">Country</label>
            <input
              type="text"
              placeholder="United States"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-2 py-2 rounded-md border border-white/30 min-w-[160px] bg-transparent text-white placeholder-white/60 backdrop-blur-sm"
            />
          </div>
        </form>

        {/* Status & Map */}
        <div className="mt-2 text-sm text-white">{status}</div>
        <div ref={mapElRef} className="h-[360px] rounded-lg overflow-hidden mt-3 bg-[#111]" />

        {/* Clear Button */}
        <div className="mt-4 flex justify-start">
          <button
            onClick={onClear}
            className="px-3 py-2 cursor-pointer rounded-md border border-gray-300 bg-[#f7f7f7] text-[#111] font-semibold transition duration-300 hover:bg-[#A4CCC1] hover:text-[#0A0424] hover:scale-105"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}