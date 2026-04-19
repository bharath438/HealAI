import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { listSchemes, checkEligibility } from "../lib/api";
import { Input } from "../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { ShieldCheck, ExternalLink, Sparkles, IndianRupee } from "lucide-react";
import WhatsAppShareButton from "../components/WhatsAppShareButton";

const STATES = ["Karnataka", "Maharashtra", "Delhi", "Tamil Nadu", "Telangana", "Andhra Pradesh", "Uttar Pradesh", "Other"];
const CATEGORIES = ["BPL", "APL", "SECC", "rural_poor", "urban_worker", "farmer", "dairy_farmer", "central_govt_employee", "pensioner"];

const fmt = (n) => "₹" + new Intl.NumberFormat("en-IN").format(n);

export default function SchemesPage() {
  const { mode } = useApp();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ income_yearly: 150000, state: "Karnataka", category: "BPL", is_farmer: mode === "animal" });
  const [result, setResult] = useState(null);

  useEffect(() => {
    listSchemes(mode === "animal" ? "animal" : "human").then((r) => setAll(r.schemes || []));
  }, [mode]);

  useEffect(() => { setForm((f) => ({ ...f, is_farmer: mode === "animal" })); }, [mode]);

  const check = async () => {
    setLoading(true);
    try {
      const r = await checkEligibility({ ...form, mode });
      setResult(r);
    } finally { setLoading(false); }
  };

  const accent = mode === "human" ? "sky" : "lime";

  return (
    <div className="space-y-6" data-testid="schemes-page">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">Government schemes</h1>
        <p className="text-stone-500 text-sm mt-1">
          Check eligibility for {mode === "animal" ? "livestock & farmer schemes" : "Ayushman Bharat, CGHS, state schemes"} in 30 seconds.
        </p>
      </div>

      {/* Eligibility form */}
      <div className="rounded-3xl bg-white border border-stone-200 p-5 sm:p-6 grid md:grid-cols-5 gap-4" data-testid="eligibility-form">
        <div className="md:col-span-1">
          <label className="text-xs uppercase tracking-[0.15em] text-stone-500">Yearly income (₹)</label>
          <Input
            type="number"
            value={form.income_yearly}
            onChange={(e) => setForm({ ...form, income_yearly: Number(e.target.value) })}
            className="mt-2 bg-stone-50 border-stone-200 rounded-xl h-11"
            data-testid="income-input"
          />
        </div>
        <div className="md:col-span-1">
          <label className="text-xs uppercase tracking-[0.15em] text-stone-500">State</label>
          <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
            <SelectTrigger data-testid="state-select" className="mt-2 bg-stone-50 border-stone-200 rounded-xl h-11"><SelectValue /></SelectTrigger>
            <SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="md:col-span-1">
          <label className="text-xs uppercase tracking-[0.15em] text-stone-500">Category</label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger data-testid="category-select" className="mt-2 bg-stone-50 border-stone-200 rounded-xl h-11"><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="md:col-span-1 flex items-center gap-2 pt-6">
          <Checkbox id="farmer" checked={form.is_farmer} onCheckedChange={(v) => setForm({ ...form, is_farmer: !!v })} data-testid="farmer-checkbox" />
          <label htmlFor="farmer" className="text-sm text-stone-700">I am a farmer / livestock owner</label>
        </div>
        <div className="md:col-span-1 flex items-end">
          <Button onClick={check} disabled={loading} className={`w-full h-11 rounded-full bg-${accent}-600 hover:bg-${accent}-700 text-white`} data-testid="check-eligibility-btn">
            <ShieldCheck className="w-4 h-4 mr-2" /> Check
          </Button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="grid lg:grid-cols-2 gap-5 animate-fade-up">
          <div className="rounded-3xl bg-amber-50 border border-amber-200 p-5 sm:p-6" data-testid="eligible-list">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-700">
              <Sparkles className="w-3.5 h-3.5" /> Likely Eligible · {result.eligible.length}
            </div>
            <h3 className="font-heading text-2xl font-medium mt-2">You may qualify for</h3>
            <ul className="mt-4 space-y-3">
              {result.eligible.map((s) => (
                <SchemeRow key={s.id} s={s} />
              ))}
              {result.eligible.length === 0 && <li className="text-sm text-stone-600">No exact match. See "Maybe" list.</li>}
            </ul>
            {result.eligible.length > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-200">
                <WhatsAppShareButton
                  text={`I'm eligible for these Government Health Schemes (via HealAI):\n\n${result.eligible.map(s => `• ${s.name} — Up to ₹${new Intl.NumberFormat("en-IN").format(s.coverage_amount_inr)}\n  ${s.apply_link}`).join("\n\n")}\n\nCheck yours at HealAI.`}
                  label="Share eligible schemes"
                  testid="share-schemes-btn"
                  className="h-9 text-xs"
                />
              </div>
            )}
          </div>
          <div className="rounded-3xl bg-white border border-stone-200 p-5 sm:p-6" data-testid="maybe-list">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-stone-500">Maybe · {result.maybe_eligible.length}</div>
            <h3 className="font-heading text-2xl font-medium mt-2">Worth checking</h3>
            <ul className="mt-4 space-y-3">
              {result.maybe_eligible.map((s) => <SchemeRow key={s.id} s={s} />)}
              {result.maybe_eligible.length === 0 && <li className="text-sm text-stone-500">Nothing here — try different options.</li>}
            </ul>
          </div>
        </div>
      )}

      {/* All schemes */}
      <div data-testid="all-schemes">
        <h3 className="font-heading text-xl font-medium mb-3">All {mode === "animal" ? "livestock" : "human"} schemes</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {all.map((s) => <SchemeRow key={s.id} s={s} full />)}
        </div>
      </div>
    </div>
  );
}

const SchemeRow = ({ s, full = false }) => (
  <div className={`rounded-2xl bg-white border border-stone-200 p-4 ${full ? "card-lift" : ""}`} data-testid={`scheme-${s.id}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="font-heading font-medium text-stone-900">{s.name}</div>
        <div className="mt-1 text-xs flex items-center gap-1.5 text-amber-700">
          <IndianRupee className="w-3.5 h-3.5" /> Up to {"₹" + new Intl.NumberFormat("en-IN").format(s.coverage_amount_inr)}
        </div>
      </div>
      <a href={s.apply_link} target="_blank" rel="noreferrer" className="text-xs text-sky-700 hover:underline flex items-center gap-1">
        Apply <ExternalLink className="w-3 h-3" />
      </a>
    </div>
    <p className="mt-2 text-sm text-stone-600 leading-relaxed">{s.description}</p>
    {full && s.benefits?.length > 0 && (
      <ul className="mt-3 space-y-1">
        {s.benefits.slice(0, 3).map((b, i) => (
          <li key={i} className="text-xs text-stone-600 flex gap-2"><span className="text-amber-600">·</span>{b}</li>
        ))}
      </ul>
    )}
    {full && (
      <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500 leading-relaxed">
        <b>How:</b> {s.how_to_apply}
      </div>
    )}
  </div>
);
