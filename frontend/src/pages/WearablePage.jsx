import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import {
  Activity, Heart, Moon, Flame, Footprints, Plug, PlugZap, Waves, Sparkles, Loader2,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { toast } from "sonner";

const DEVICES = ["Fitbit Demo", "Apple Watch Demo", "Mi Band Demo", "Google Fit Demo"];

const StatCard = ({ icon: Icon, label, value, unit, color = "sky", sub }) => (
  <div className={`rounded-2xl bg-${color}-50 border border-${color}-200 p-5`}>
    <div className={`flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-${color}-700`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </div>
    <div className="mt-2 flex items-baseline gap-1.5">
      <div className="font-heading text-3xl font-semibold text-stone-900">{value}</div>
      {unit && <div className="text-xs text-stone-500">{unit}</div>}
    </div>
    {sub && <div className="text-xs text-stone-500 mt-1">{sub}</div>}
  </div>
);

export default function WearablePage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(DEVICES[0]);

  const load = async () => {
    const r = await api.get("/wearable/summary", { withCredentials: true });
    setData(r.data);
  };
  useEffect(() => { load(); }, []);

  const connect = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("device", selectedDevice);
      await api.post("/wearable/connect", fd, { withCredentials: true });
      toast.success(`Connected to ${selectedDevice}`);
      load();
    } finally { setLoading(false); }
  };

  const disconnect = async () => {
    await api.post("/wearable/disconnect", {}, { withCredentials: true });
    toast("Device disconnected");
    load();
  };

  if (!data) return <div className="text-stone-500" data-testid="wearable-loading">Loading…</div>;

  const s = data.summary;
  const stepsPct = Math.min(100, Math.round((s.steps / s.steps_goal) * 100));

  return (
    <div className="space-y-6" data-testid="wearable-page">
      {/* Header */}
      <section className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 flex flex-col lg:flex-row justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-stone-500 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Wearable · {s.date}
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight mt-2">
            {data.connected ? `Synced with ${data.device}` : "Connect a wearable to track vitals"}
          </h1>
          <p className="mt-2 text-stone-500 text-sm max-w-xl">
            Demo data shown. Real Google Fit / Apple Health / Fitbit OAuth can be added on top of this scaffold.
          </p>
          {!user && (
            <p className="mt-2 text-xs text-amber-700">Sign in to save device preferences across sessions.</p>
          )}
        </div>

        <div className="flex flex-col items-start lg:items-end gap-2">
          <div className="flex items-center gap-2" data-testid="device-selector">
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="h-10 px-3 rounded-full bg-stone-50 border border-stone-200 text-sm"
              disabled={data.connected}
            >
              {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {data.connected ? (
              <Button onClick={disconnect} variant="outline" className="rounded-full border-stone-300" data-testid="disconnect-btn">
                <Plug className="w-4 h-4 mr-1.5" /> Disconnect
              </Button>
            ) : (
              <Button onClick={connect} disabled={loading} className="rounded-full bg-lime-700 hover:bg-lime-800 text-white" data-testid="connect-btn">
                {loading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <PlugZap className="w-4 h-4 mr-1.5" />}
                Connect
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Grid of stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="wearable-stats">
        <StatCard icon={Footprints} label="Steps" value={s.steps.toLocaleString("en-IN")} unit={`/${s.steps_goal.toLocaleString("en-IN")}`} color="sky" sub={`${stepsPct}% of goal`} />
        <StatCard icon={Heart} label="Heart rate" value={s.heart_rate_avg} unit="bpm avg" color="orange" sub={`Resting ${s.heart_rate_resting}`} />
        <StatCard icon={Waves} label="SpO₂" value={s.spo2} unit="%" color="lime" />
        <StatCard icon={Moon} label="Sleep" value={s.sleep_hours} unit="hrs" color="amber" />
        <StatCard icon={Flame} label="Calories" value={s.calories} unit="kcal" color="orange" />
        <StatCard icon={Activity} label="Active min" value={s.active_minutes} unit="min" color="sky" />
        <StatCard icon={Waves} label="Stress" value={s.stress_level} unit="/100" color="amber" sub={s.stress_level > 40 ? "Elevated" : "Normal"} />
        <StatCard icon={Sparkles} label="Health score" value={72 + Math.min(18, Math.round(stepsPct / 10))} unit="/100" color="lime" />
      </section>

      {/* Weekly charts */}
      <section className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-3xl bg-white border border-stone-200 p-5">
          <div className="text-xs uppercase tracking-[0.15em] text-stone-500 mb-2">Steps · this week</div>
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={data.weekly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="day" tick={{ fill: "#78716c", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#78716c", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4" }} />
                <Bar dataKey="steps" fill="hsl(199 89% 48%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl bg-white border border-stone-200 p-5">
          <div className="text-xs uppercase tracking-[0.15em] text-stone-500 mb-2">Heart rate (avg)</div>
          <div className="h-60">
            <ResponsiveContainer>
              <LineChart data={data.weekly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="day" tick={{ fill: "#78716c", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#78716c", fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4" }} />
                <Line type="monotone" dataKey="heart_rate" stroke="hsl(20 80% 55%)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="rounded-3xl bg-amber-50 border border-amber-200 p-5 sm:p-6" data-testid="wearable-insights">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-700">
          <Sparkles className="w-3.5 h-3.5" /> AI Insights
        </div>
        <h3 className="font-heading text-xl font-medium mt-2">Today's personalized pointers</h3>
        <ul className="mt-4 space-y-2">
          {data.insights.map((i, idx) => (
            <li
              key={idx}
              className={`text-sm flex gap-3 items-start rounded-xl p-3 border ${
                i.level === "warn" ? "bg-orange-50 border-orange-200 text-orange-800"
                : i.level === "good" ? "bg-lime-50 border-lime-200 text-lime-800"
                : "bg-white border-stone-200 text-stone-700"
              }`}
              data-testid={`insight-${idx}`}
            >
              <span className="font-semibold uppercase text-[10px] tracking-[0.15em] shrink-0 mt-0.5">{i.level}</span>
              {i.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
