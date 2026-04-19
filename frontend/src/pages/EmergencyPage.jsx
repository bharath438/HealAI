import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { emergencyInfo } from "../lib/api";
import { Button } from "../components/ui/button";
import { Phone, Siren, MapPin, AlertTriangle, Ambulance } from "lucide-react";

export default function EmergencyPage() {
  const { mode, city } = useApp();
  const [data, setData] = useState(null);

  useEffect(() => { emergencyInfo(city, mode).then(setData); }, [city, mode]);

  return (
    <div className="space-y-6" data-testid="emergency-page">
      {/* Big red hero */}
      <section className="relative overflow-hidden rounded-3xl bg-orange-600 text-white p-8 sm:p-12">
        <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full bg-orange-500 opacity-50 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-red-500 opacity-40 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-orange-100">
            <Siren className="w-4 h-4" /> Emergency Mode
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-semibold mt-3">Call help immediately.</h1>
          <p className="mt-3 text-orange-50 max-w-xl">
            If you or the animal shows any red-flag symptom, do not wait — dial an ambulance.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="tel:108">
              <Button size="lg" className="rounded-full bg-white text-orange-700 hover:bg-orange-50 h-14 px-7 text-lg pulse-emergency" data-testid="call-108-btn">
                <Ambulance className="w-5 h-5 mr-2" /> Call 108 (Ambulance)
              </Button>
            </a>
            <a href="tel:100">
              <Button size="lg" variant="outline" className="rounded-full h-14 px-6 bg-transparent text-white border-white/50 hover:bg-white/10" data-testid="call-100-btn">
                <Phone className="w-5 h-5 mr-2" /> Police · 100
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Red flags */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-3xl bg-white border border-stone-200 p-5 sm:p-6" data-testid="redflag-human">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-orange-700"><AlertTriangle className="w-3.5 h-3.5" /> Human Red Flags</div>
          <ul className="mt-3 space-y-2">
            {(data?.red_flag_symptoms || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-700"><span className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-2" />{s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-white border border-stone-200 p-5 sm:p-6" data-testid="redflag-animal">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-orange-700"><AlertTriangle className="w-3.5 h-3.5" /> Animal Red Flags</div>
          <ul className="mt-3 space-y-2">
            {(data?.animal_red_flags || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-700"><span className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-2" />{s}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Hotlines */}
      <div className="rounded-3xl bg-white border border-stone-200 p-5 sm:p-6" data-testid="emergency-contacts">
        <h3 className="font-heading text-xl font-medium mb-3">National Helplines</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(data?.contacts || []).map((c, i) => (
            <a key={i} href={`tel:${c.number}`} className="rounded-2xl border border-stone-200 p-4 card-lift flex items-center justify-between" data-testid={`hotline-${i}`}>
              <div>
                <div className="font-heading font-medium">{c.name}</div>
                <div className="text-xs text-stone-500 mt-0.5">{c.description || "Tap to dial"}</div>
              </div>
              <div className="flex items-center gap-2 text-orange-700 font-semibold">
                <Phone className="w-4 h-4" /> {c.number}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Nearest hospitals */}
      <div className="rounded-3xl bg-white border border-stone-200 p-5 sm:p-6" data-testid="nearest-hospitals">
        <h3 className="font-heading text-xl font-medium mb-3">Nearest emergency-capable hospitals {city && <span className="text-stone-500 text-sm">· {city}</span>}</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.nearest_hospitals || []).map((h) => (
            <div key={h.id} className="rounded-2xl border border-stone-200 p-4">
              <div className="font-heading font-medium">{h.name}</div>
              <div className="text-xs text-stone-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {h.city} · {h.distance_km} km</div>
              <a href={`tel:${h.phone}`} className="mt-3 block">
                <Button size="sm" variant="outline" className="w-full rounded-full border-stone-300">
                  <Phone className="w-3.5 h-3.5 mr-2" /> {h.phone}
                </Button>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
