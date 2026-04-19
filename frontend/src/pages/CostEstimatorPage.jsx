import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { listConditions, estimateCost } from "../lib/api";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Calculator, Building2, Landmark, Sparkles, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import WhatsAppShareButton from "../components/WhatsAppShareButton";

const CITIES = ["Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Kolkata", "Pune", "Other"];

const fmt = (n) => "₹" + new Intl.NumberFormat("en-IN").format(Math.round(n));

export default function CostEstimatorPage() {
  const { mode, city: defaultCity } = useApp();
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [form, setForm] = useState({
    condition_key: "",
    city: defaultCity || "Bangalore",
    hospital_type: "both",
  });

  useEffect(() => {
    listConditions().then(r => {
      const filtered = r.items.filter((i) => i.category === (mode === "animal" ? "animal" : "human"));
      setConditions(filtered);
      if (filtered.length) setForm((f) => ({ ...f, condition_key: f.condition_key || filtered[0].key }));
    });
  }, [mode]);

  const run = async () => {
    if (!form.condition_key) return;
    setLoading(true);
    try {
      const payload = {
        condition_key: form.condition_key,
        city: form.city === "Other" ? null : form.city,
        hospital_type: form.hospital_type === "both" ? null : form.hospital_type,
      };
      const res = await estimateCost(payload);
      setEstimate(res);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (form.condition_key) run(); /* eslint-disable-next-line */ }, [form.condition_key]);

  const currentCond = conditions.find((c) => c.key === form.condition_key);
  const chartData = estimate?.breakdown?.map((b) => ({
    name: b.hospital_type === "govt" ? "Govt" : "Private",
    Min: b.min, Avg: b.avg, Max: b.max,
    fill: b.hospital_type === "govt" ? "hsl(199 89% 48%)" : "hsl(20 80% 55%)",
  })) || [];

  const accent = mode === "human" ? "sky" : "lime";

  return (
    <div className="space-y-6" data-testid="cost-estimator-page">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">Cost Estimator</h1>
        <p className="text-stone-500 text-sm mt-1">Transparent treatment costs · Govt vs Private · INR</p>
      </div>

      {/* FORM */}
      <div className="rounded-3xl bg-white border border-stone-200 p-5 sm:p-6 grid md:grid-cols-4 gap-4" data-testid="cost-form">
        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-stone-500 font-medium">Condition</label>
          <Select value={form.condition_key} onValueChange={(v) => setForm({ ...form, condition_key: v })}>
            <SelectTrigger data-testid="condition-select" className="mt-2 bg-stone-50 border-stone-200 rounded-xl h-11">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {conditions.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-stone-500 font-medium">City</label>
          <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })}>
            <SelectTrigger data-testid="city-select" className="mt-2 bg-stone-50 border-stone-200 rounded-xl h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-stone-500 font-medium">Hospital type</label>
          <Select value={form.hospital_type} onValueChange={(v) => setForm({ ...form, hospital_type: v })}>
            <SelectTrigger data-testid="hospital-type-select" className="mt-2 bg-stone-50 border-stone-200 rounded-xl h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">Compare both</SelectItem>
              <SelectItem value="govt">Government only</SelectItem>
              <SelectItem value="private">Private only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={run} disabled={loading} className={`w-full h-11 rounded-full bg-${accent}-600 hover:bg-${accent}-700 text-white`} data-testid="estimate-btn">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calculator className="w-4 h-4 mr-2" />}
            Estimate
          </Button>
        </div>
      </div>

      {estimate && (
        <div className="grid lg:grid-cols-3 gap-5 animate-fade-up">
          {/* Chart */}
          <div className="lg:col-span-2 rounded-3xl bg-white border border-stone-200 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Estimate</div>
                <h3 className="font-heading text-xl font-medium">{currentCond?.label}</h3>
                <p className="text-xs text-stone-500 mt-0.5">City: {estimate.city || "Any"} · Multiplier {estimate.city_multiplier}x</p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                  <XAxis dataKey="name" tick={{ fill: "#57534e", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₹${v / 1000 >= 1 ? (v / 1000).toFixed(0) + "k" : v}`} tick={{ fill: "#78716c", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4" }} />
                  <Bar dataKey="Min" fill="#bae6fd" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Avg" radius={[6, 6, 0, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                  <Bar dataKey="Max" fill="#fed7aa" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {estimate.breakdown.map((b) => (
                <div key={b.hospital_type} className={`rounded-2xl p-4 border ${b.hospital_type === "govt" ? "bg-sky-50 border-sky-200" : "bg-orange-50 border-orange-200"}`}>
                  <div className="flex items-center gap-2">
                    {b.hospital_type === "govt" ? <Landmark className="w-4 h-4 text-sky-700" /> : <Building2 className="w-4 h-4 text-orange-700" />}
                    <span className="text-xs uppercase tracking-[0.15em] font-medium">{b.hospital_type}</span>
                  </div>
                  <div className="font-heading text-3xl font-semibold mt-2">{fmt(b.avg)}</div>
                  <div className="text-xs text-stone-500 mt-1">Range: {fmt(b.min)} — {fmt(b.max)}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <WhatsAppShareButton
                text={`HealAI cost estimate for ${currentCond?.label} in ${estimate.city || "any city"}:\n\n${estimate.breakdown.map(b => `${b.hospital_type.toUpperCase()}: avg ${fmt(b.avg)} (range ${fmt(b.min)}–${fmt(b.max)})`).join("\n")}\n\n${estimate.alternatives?.[0] || ""}\n\nCheck yours at HealAI.`}
                label="Share estimate"
                testid="share-cost-btn"
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Alternatives */}
          <div className="rounded-3xl bg-amber-50 border border-amber-200 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-700"><Sparkles className="w-3.5 h-3.5" /> Save more</div>
            <h3 className="font-heading text-xl font-medium mt-2">Affordable alternatives</h3>
            <ul className="mt-4 space-y-3">
              {estimate.alternatives?.length ? estimate.alternatives.map((a, i) => (
                <li key={i} className="text-sm text-stone-700 leading-relaxed flex gap-2">
                  <span className="text-amber-600 font-bold">·</span> {a}
                </li>
              )) : (
                <li className="text-sm text-stone-600">Check <a href="/schemes" className="underline">government schemes</a> for possible coverage.</li>
              )}
            </ul>
            <div className="mt-5 text-xs text-stone-500 leading-relaxed">{estimate.disclaimer}</div>
          </div>

          {/* Matching Hospitals */}
          {estimate.matching_hospitals?.length > 0 && (
            <div className="lg:col-span-3 rounded-3xl bg-white border border-stone-200 p-5 sm:p-6" data-testid="matching-hospitals">
              <h3 className="font-heading text-xl font-medium mb-4">Matching hospitals</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {estimate.matching_hospitals.map((h) => (
                  <div key={h.id} className="rounded-2xl border border-stone-200 overflow-hidden card-lift">
                    <img src={h.image} alt={h.name} className="w-full h-32 object-cover" />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-heading font-medium">{h.name}</div>
                          <div className="text-xs text-stone-500 mt-0.5">{h.city} · {h.distance_km} km</div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${h.type === "government" ? "bg-sky-100 text-sky-700" : "bg-stone-100 text-stone-700"}`}>{h.type}</span>
                      </div>
                      <div className="mt-2 text-sm">★ {h.rating}</div>
                      <div className="mt-1 text-xs text-stone-500">Accepts: {h.accepts_schemes.join(", ") || "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
