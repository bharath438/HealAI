import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { listSchemes, listHospitals } from "../lib/api";
import { Button } from "../components/ui/button";
import { Tractor, Leaf, Stethoscope, Calendar, ShieldCheck, ArrowRight, ImagePlus } from "lucide-react";

const FARMER_IMG = "https://images.unsplash.com/photo-1707721690619-7658b6058fa6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBmYXJtZXIlMjBjb3d8ZW58MHx8fHwxNzc2NTc3MTQxfDA&ixlib=rb-4.1.0&q=85";

const VACCINATION_SCHEDULE = [
  { age: "Birth", item: "Calf diphtheria vaccine", species: "Cattle" },
  { age: "3 months", item: "FMD (Foot & Mouth Disease)", species: "Cattle, Goat, Sheep" },
  { age: "6 months", item: "HS (Haemorrhagic Septicaemia)", species: "Cattle, Buffalo" },
  { age: "9 months", item: "Brucellosis (RB51 / S19)", species: "Female Cattle" },
  { age: "Annual", item: "FMD booster + Deworming", species: "All" },
  { age: "6-8 weeks (pup)", item: "DHPP (Distemper, Hepatitis, Parvo)", species: "Dog" },
  { age: "12-14 weeks (pup)", item: "DHPP booster + Rabies", species: "Dog" },
  { age: "Annual (dog)", item: "DHPP + Rabies booster", species: "Dog" },
];

export default function FarmerModePage() {
  const { changeMode } = useApp();
  const [schemes, setSchemes] = useState([]);
  const [vets, setVets] = useState([]);

  useEffect(() => {
    changeMode("animal");
    listSchemes("animal").then((r) => setSchemes(r.schemes || []));
    listHospitals("animal").then((r) => setVets(r.hospitals || []));
    // eslint-disable-next-line
  }, []);

  return (
    <div className="space-y-6" data-testid="farmer-page">
      <section className="relative overflow-hidden rounded-3xl border border-lime-200 bg-lime-50 p-8 sm:p-12">
        <img src={FARMER_IMG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative max-w-2xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-lime-800"><Tractor className="w-3.5 h-3.5" /> Farmer &amp; Livestock Mode</div>
          <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight mt-3 text-stone-900">Healthy livestock. Happier farmers.</h1>
          <p className="mt-3 text-stone-700 max-w-xl">
            Diagnose sick animals, get vaccination reminders, and tap into livestock-focused government schemes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/chat"><Button className="rounded-full h-11 px-6 bg-lime-700 hover:bg-lime-800 text-white" data-testid="farmer-chat-btn"><Stethoscope className="w-4 h-4 mr-2" />Ask about my animal</Button></Link>
            <Link to="/diagnose"><Button variant="outline" className="rounded-full h-11 px-6 border-lime-300" data-testid="farmer-diagnose-btn"><ImagePlus className="w-4 h-4 mr-2" />Image diagnosis</Button></Link>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-5">
        {/* Schemes */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-stone-200 p-6" data-testid="farmer-schemes">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-700"><ShieldCheck className="w-3.5 h-3.5" /> Government Support</div>
          <h3 className="font-heading text-2xl font-medium mt-2">Livestock schemes you can apply for</h3>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {schemes.map((s) => (
              <a key={s.id} href={s.apply_link} target="_blank" rel="noreferrer" className="rounded-2xl border border-stone-200 bg-stone-50 p-4 card-lift block">
                <div className="font-heading font-medium">{s.name}</div>
                <div className="text-xs text-amber-700 mt-1">Up to ₹{new Intl.NumberFormat("en-IN").format(s.coverage_amount_inr)}</div>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">{s.description}</p>
                <div className="mt-3 text-xs flex items-center gap-1 text-lime-800">Apply now <ArrowRight className="w-3 h-3" /></div>
              </a>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-3xl bg-lime-50 border border-lime-200 p-6" data-testid="farmer-tips">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-lime-800"><Leaf className="w-3.5 h-3.5" /> Pro tips</div>
          <h3 className="font-heading text-xl font-medium mt-2">This month</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-700">
            <li>• Provide clean drinking water 3x a day in summer</li>
            <li>• Deworm every 3 months — improves milk yield up to 15%</li>
            <li>• Quarantine new animals for 21 days before mixing</li>
            <li>• Report unusual deaths to local veterinary officer</li>
          </ul>
        </div>
      </section>

      {/* Vaccination schedule */}
      <section className="rounded-3xl bg-white border border-stone-200 p-6" data-testid="vaccination-schedule">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-lime-800"><Calendar className="w-3.5 h-3.5" /> Vaccination Calendar</div>
        <h3 className="font-heading text-2xl font-medium mt-2">Immunization quick reference</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase tracking-[0.15em] text-stone-500">
              <tr className="text-left">
                <th className="py-2 pr-4">Age</th>
                <th className="py-2 pr-4">Vaccine / Action</th>
                <th className="py-2 pr-4">Species</th>
              </tr>
            </thead>
            <tbody>
              {VACCINATION_SCHEDULE.map((v, i) => (
                <tr key={i} className="border-t border-stone-100">
                  <td className="py-3 pr-4 font-heading font-medium">{v.age}</td>
                  <td className="py-3 pr-4 text-stone-700">{v.item}</td>
                  <td className="py-3 pr-4 text-stone-500">{v.species}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-stone-500">Consult your local veterinarian to tailor schedules for your region &amp; breed.</div>
      </section>

      {/* Vets */}
      <section className="rounded-3xl bg-white border border-stone-200 p-6" data-testid="vets-nearby">
        <h3 className="font-heading text-xl font-medium mb-3">Veterinarians near you</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vets.map((v) => (
            <div key={v.id} className="rounded-2xl border border-stone-200 overflow-hidden card-lift">
              <img src={v.image} alt={v.name} className="w-full h-32 object-cover" />
              <div className="p-4">
                <div className="font-heading font-medium">{v.name}</div>
                <div className="text-xs text-stone-500 mt-1">{v.city} · {v.distance_km} km · ★ {v.rating}</div>
                <a href={`tel:${v.phone}`} className="mt-3 block">
                  <Button variant="outline" size="sm" className="w-full rounded-full border-stone-300">Call {v.phone}</Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
