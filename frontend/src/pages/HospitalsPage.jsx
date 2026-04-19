import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { searchHospitals } from "../lib/api";
import { Input } from "../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Search, MapPin, Star, Phone, Stethoscope } from "lucide-react";

const CITIES = ["All", "Bangalore", "Mumbai", "New Delhi", "Chennai", "Hyderabad"];
const SPECS_HUMAN = ["any", "cardiology", "oncology", "orthopedics", "neurology", "pediatrics", "gynecology", "general"];
const SPECS_ANIMAL = ["any", "veterinary", "pet_care", "livestock", "emergency"];

export default function HospitalsPage() {
  const { mode } = useApp();
  const [list, setList] = useState([]);
  const [q, setQ] = useState({ city: "All", specialty: "any", hospital_type: "any" });
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const payload = {
        city: q.city === "All" ? null : q.city,
        specialty: q.specialty === "any" ? null : q.specialty,
        hospital_type: q.hospital_type === "any" ? null : q.hospital_type,
        mode,
      };
      const res = await searchHospitals(payload);
      setList(res.hospitals || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchList(); /* eslint-disable-next-line */ }, [mode, q]);

  const specs = useMemo(() => mode === "animal" ? SPECS_ANIMAL : SPECS_HUMAN, [mode]);
  const accent = mode === "human" ? "sky" : "lime";

  return (
    <div className="space-y-6" data-testid="hospitals-page">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">Hospitals near you</h1>
        <p className="text-stone-500 text-sm mt-1">Filter by city, specialty, and hospital type · Ratings &amp; scheme acceptance</p>
      </div>

      <div className="rounded-3xl bg-white border border-stone-200 p-4 sm:p-5 grid md:grid-cols-4 gap-3" data-testid="hospitals-filters">
        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-stone-500">City</label>
          <Select value={q.city} onValueChange={(v) => setQ({ ...q, city: v })}>
            <SelectTrigger data-testid="filter-city" className="mt-2 bg-stone-50 border-stone-200 rounded-xl h-11"><SelectValue /></SelectTrigger>
            <SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-stone-500">Specialty</label>
          <Select value={q.specialty} onValueChange={(v) => setQ({ ...q, specialty: v })}>
            <SelectTrigger data-testid="filter-specialty" className="mt-2 bg-stone-50 border-stone-200 rounded-xl h-11"><SelectValue /></SelectTrigger>
            <SelectContent>{specs.map(s => <SelectItem key={s} value={s}>{s === "any" ? "Any specialty" : s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-stone-500">Type</label>
          <Select value={q.hospital_type} onValueChange={(v) => setQ({ ...q, hospital_type: v })}>
            <SelectTrigger data-testid="filter-type" className="mt-2 bg-stone-50 border-stone-200 rounded-xl h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={fetchList} className={`w-full h-11 rounded-full bg-${accent}-600 hover:bg-${accent}-700 text-white`} data-testid="filter-search-btn">
            <Search className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <div className="text-sm text-stone-500" data-testid="hospitals-count">Found {list.length} hospitals</div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((h) => (
          <div key={h.id} className="rounded-2xl border border-stone-200 bg-white overflow-hidden card-lift" data-testid={`hospital-card-${h.id}`}>
            <div className="relative">
              <img src={h.image} alt={h.name} className="w-full h-40 object-cover" loading="lazy" />
              <span className={`absolute top-3 left-3 text-[10px] px-2.5 py-1 rounded-full font-medium ${h.type === "government" ? "bg-sky-600 text-white" : "bg-orange-600 text-white"}`}>
                {h.type}
              </span>
              <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full bg-white/90 backdrop-blur border border-stone-200 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {h.rating}
              </span>
            </div>
            <div className="p-4 space-y-2">
              <div className="font-heading font-medium text-stone-900">{h.name}</div>
              <div className="text-xs text-stone-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {h.city}, {h.state} · {h.distance_km} km</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {h.specialties.slice(0, 4).map(s => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    {s}
                  </span>
                ))}
              </div>
              {h.accepts_schemes?.length > 0 && (
                <div className="text-xs text-amber-700 flex items-center gap-1.5 pt-2 border-t border-stone-100">
                  <Stethoscope className="w-3.5 h-3.5" /> {h.accepts_schemes.join(", ")}
                </div>
              )}
              <a href={`tel:${h.phone}`} className="mt-2 block">
                <Button variant="outline" size="sm" className="w-full rounded-full border-stone-300" data-testid={`call-${h.id}`}>
                  <Phone className="w-3.5 h-3.5 mr-2" /> {h.phone}
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>
      {!loading && list.length === 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-500" data-testid="hospitals-empty">
          No hospitals match these filters. Try "Any" in a filter.
        </div>
      )}
    </div>
  );
}
