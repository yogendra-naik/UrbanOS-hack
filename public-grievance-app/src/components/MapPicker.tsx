"use client";
import { useEffect, useRef, useState } from "react";

interface MapPickerProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

// Dynamically load Leaflet only on client side
export default function MapPicker({ lat, lng, onLocationChange }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [status, setStatus] = useState<"idle" | "locating" | "done" | "error">("idle");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState({ lat, lng });

  // Reverse geocode using OpenStreetMap Nominatim (free, no API key needed)
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      const a = data.address;
      const parts = [
        a.road || a.neighbourhood,
        a.suburb || a.city_district,
        a.city || a.town || a.village,
        a.state,
      ].filter(Boolean);
      return parts.join(", ") || data.display_name;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  const updatePin = async (newLat: number, newLng: number, mapL: any) => {
    setCoords({ lat: newLat, lng: newLng });
    if (markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
    } else {
      const icon = mapL.divIcon({
        className: "",
        html: `<div style="
          width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#22d3ee);
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          border:3px solid white;box-shadow:0 4px 20px rgba(99,102,241,0.5);
        "></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });
      markerRef.current = mapL.marker([newLat, newLng], { icon, draggable: true }).addTo(mapInstanceRef.current);
      markerRef.current.on("dragend", async (e: any) => {
        const { lat: dLat, lng: dLng } = e.target.getLatLng();
        const addr = await reverseGeocode(dLat, dLng);
        setAddress(addr);
        setCoords({ lat: dLat, lng: dLng });
        onLocationChange(dLat, dLng, addr);
      });
    }
    const addr = await reverseGeocode(newLat, newLng);
    setAddress(addr);
    onLocationChange(newLat, newLng, addr);
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Inject Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    import("leaflet").then((L) => {
      const mapL = L.default || L;

      const map = mapL.map(mapRef.current!, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      // Tile layer — OpenStreetMap (free)
      mapL.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Place initial pin
      updatePin(lat, lng, mapL);

      // Click to place pin anywhere
      map.on("click", async (e: any) => {
        await updatePin(e.latlng.lat, e.latlng.lng, mapL);
        map.panTo([e.latlng.lat, e.latlng.lng]);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const handleLiveLocation = () => {
    if (!navigator.geolocation) { setStatus("error"); return; }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, { animate: true, duration: 1.5 });
        }
        import("leaflet").then(async (L) => {
          const mapL = L.default || L;
          await updatePin(latitude, longitude, mapL);
          setStatus("done");
        });
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(99,102,241,0.35)", boxShadow: "0 0 30px rgba(99,102,241,0.15)" }}>
      {/* Toolbar */}
      <div style={{ background: "rgba(15,23,42,0.95)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap" }}>
        <button
          onClick={handleLiveLocation}
          disabled={status === "locating"}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "7px 16px",
            background: status === "done" ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.25)",
            border: `1px solid ${status === "done" ? "rgba(16,185,129,0.4)" : "rgba(99,102,241,0.5)"}`,
            borderRadius: 9, color: status === "done" ? "#34d399" : "#a5b4fc",
            cursor: status === "locating" ? "wait" : "pointer", fontSize: 13, fontWeight: 600,
            fontFamily: "Inter,sans-serif", transition: "all 0.2s",
          }}>
          {status === "locating" ? (
            <><span style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: 2 }}>⏳</span> Detecting...</>
          ) : status === "done" ? "✅ Live Location Set" : status === "error" ? "❌ GPS Unavailable" : "📍 Use My Live Location"}
        </button>
        <div style={{ flex: 1, fontSize: 12, color: "#64748b", minWidth: 0 }}>
          {address
            ? <span style={{ color: "#94a3b8" }}>📍 {address}</span>
            : <span>Click anywhere on the map to pin your complaint location</span>}
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ height: 300, width: "100%", background: "#0f172a" }} />

      {/* Coordinates bar */}
      <div style={{ background: "rgba(15,23,42,0.9)", padding: "8px 14px", display: "flex", alignItems: "center", gap: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>
          🌐 Lat: <span style={{ color: "#6366f1" }}>{coords.lat.toFixed(6)}</span>&nbsp;&nbsp;
          Lng: <span style={{ color: "#22d3ee" }}>{coords.lng.toFixed(6)}</span>
        </span>
        <span style={{ fontSize: 11, color: "#334155" }}>Drag the pin to fine-tune • Click map to repin • Scroll to zoom</span>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .leaflet-container { font-family: 'Inter', sans-serif; }
        .leaflet-control-attribution { font-size: 9px !important; }
        .leaflet-tile-pane { filter: brightness(0.8) saturate(0.9); }
      `}</style>
    </div>
  );
}
