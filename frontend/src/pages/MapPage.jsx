import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { listHospitals } from "../lib/api";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Star, Phone, List } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

// Fix default marker icons (Leaflet issue with webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Center: India
const INDIA_CENTER = [20.5937, 78.9629];

export default function MapPage() {
  const { mode } = useApp();
  const [hospitals, setHospitals] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    listHospitals(mode).then((r) => setHospitals(r.hospitals || []));
  }, [mode]);

  const accent = mode === "human" ? "sky" : "lime";

  return (
    <div className="space-y-4" data-testid="map-page">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">Hospital Map</h1>
          <p className="text-stone-500 text-sm mt-1">
            {mode === "animal" ? "Veterinary hospitals across India" : "Hospitals & clinics across India"} · {hospitals.length} locations
          </p>
        </div>
        <Link to="/hospitals">
          <Button variant="outline" className="rounded-full border-stone-300" data-testid="map-list-view-btn">
            <List className="w-4 h-4 mr-2" /> List view
          </Button>
        </Link>
      </div>

      <div className="rounded-3xl overflow-hidden border border-stone-200 bg-white" data-testid="hospital-map">
        <MapContainer
          center={INDIA_CENTER}
          zoom={5}
          scrollWheelZoom
          style={{ height: "65vh", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {hospitals.map((h) => (
            <Marker
              key={h.id}
              position={[h.lat, h.lng]}
              eventHandlers={{ click: () => setSelected(h.id) }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-semibold text-stone-900">{h.name}</div>
                  <div className="text-xs text-stone-500 mt-1">{h.city} · {h.type}</div>
                  <div className="text-xs mt-1 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {h.rating} · {h.distance_km} km
                  </div>
                  <a href={`tel:${h.phone}`} className="text-xs text-sky-700 mt-2 inline-flex items-center gap-1 hover:underline">
                    <Phone className="w-3 h-3" /> {h.phone}
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {hospitals.map((h) => (
          <div key={h.id} className={`rounded-2xl border p-4 card-lift ${selected === h.id ? `border-${accent}-400 ring-2 ring-${accent}-200` : "border-stone-200 bg-white"}`} data-testid={`map-card-${h.id}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-heading font-medium">{h.name}</div>
                <div className="text-xs text-stone-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {h.city}</div>
              </div>
              <span className="text-xs">★ {h.rating}</span>
            </div>
            <a href={`tel:${h.phone}`} className="text-xs text-sky-700 mt-2 inline-flex items-center gap-1 hover:underline">
              <Phone className="w-3 h-3" /> {h.phone}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
