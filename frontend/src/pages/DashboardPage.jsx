import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { dashboardInsights, dailyTips } from "../lib/api";
import {
  Activity, HeartPulse, MessagesSquare, Calculator, Hospital, ShieldCheck,
  Leaf, Tractor, Siren, ArrowRight, Sparkles, Flame, ImagePlus, FileHeart,
} from "lucide-react";
import { Button } from "../components/ui/button";

const HERO_IMG = "https://images.unsplash.com/photo-1763587239043-47e583ac0cb1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMHNhbmQlMjB0ZXh0dXJlJTIwc29mdHxlbnwwfHx8fDE3NzY1NzcxNDh8MA&ixlib=rb-4.1.0&q=85";
const DOCTOR_IMG = "https://images.pexels.com/photos/14558557/pexels-photo-14558557.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const FARMER_IMG = "https://images.unsplash.com/photo-1707721690619-7658b6058fa6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBmYXJtZXIlMjBjb3d8ZW58MHx8fHwxNzc2NTc3MTQxfDA&ixlib=rb-4.1.0&q=85";
const AYURVEDA_IMG = "https://images.pexels.com/photos/20689437/pexels-photo-20689437.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const QuickTile = ({ to, icon: Icon, title, desc, color = "sky" }) => (
  <Link
    to={to}
    data-testid={`quicktile-${title.toLowerCase().replace(/\s+/g, "-")}`}
    className="group relative rounded-2xl bg-white border border-stone-200 p-5 card-lift hover:border-stone-300 overflow-hidden"
  >
    <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-700 grid place-items-center mb-3`}>
      <Icon className="w-5 h-5" strokeWidth={1.7} />
    </div>
    <div className="font-heading font-medium text-stone-900 text-base">{title}</div>
    <p className="text-sm text-stone-500 mt-1 leading-relaxed">{desc}</p>
    <ArrowRight className="w-4 h-4 absolute top-5 right-5 text-stone-300 group-hover:text-stone-600 transition-all group-hover:translate-x-0.5" />
  </Link>
);

export default function DashboardPage() {
  const { mode, t } = useApp();
  const [insights, setInsights] = useState(null);
  const [tips, setTips] = useState(null);

  useEffect(() => {
    dashboardInsights().then(setInsights).catch(() => {});
    dailyTips().then(setTips).catch(() => {});
  }, []);

  const accent = mode === "human" ? "sky" : "lime";

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* HERO */}
      <section
        className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white hero-dots animate-fade-up"
        data-testid="hero-section"
      >
        <img src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply" />
        <div className="relative grid lg:grid-cols-5 gap-0">
          <div className="lg:col-span-3 p-8 sm:p-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> AI-Powered · Multilingual · Humans + Animals
            </div>
            <h1 className="mt-5 font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              Navigate healthcare with <span className={`text-${accent}-700`}>confidence</span>.
            </h1>
            <p className="mt-4 text-stone-600 text-lg max-w-xl leading-relaxed">
              {t("tagline")} — symptom guidance, cost estimates, government schemes, Ayurveda &amp; modern medicine,
              and emergency help at your fingertips.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/chat">
                <Button className={`rounded-full bg-${accent}-600 hover:bg-${accent}-700 text-white px-6 h-11`} data-testid="hero-start-chat-btn">
                  <MessagesSquare className="w-4 h-4 mr-2" /> Start AI Chat
                </Button>
              </Link>
              <Link to="/cost">
                <Button variant="outline" className="rounded-full h-11 px-6 border-stone-300" data-testid="hero-estimate-btn">
                  <Calculator className="w-4 h-4 mr-2" /> Estimate Cost
                </Button>
              </Link>
              <Link to="/emergency">
                <Button className="rounded-full h-11 px-6 bg-orange-600 hover:bg-orange-700 text-white" data-testid="hero-emergency-btn">
                  <Siren className="w-4 h-4 mr-2" /> Emergency
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-5 text-sm text-stone-600">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> Human Health</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-lime-500" /> Animal &amp; Livestock</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Ayurveda</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500" /> Emergency 108</div>
            </div>
          </div>

          <div className="lg:col-span-2 relative min-h-[260px] lg:min-h-0">
            <img
              src={mode === "animal" ? FARMER_IMG : DOCTOR_IMG}
              alt="health"
              className="absolute inset-0 w-full h-full object-cover rounded-br-3xl rounded-bl-3xl lg:rounded-bl-none"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/85 backdrop-blur p-4 border border-stone-200">
              <div className="text-[10px] uppercase tracking-[0.15em] text-stone-500 mb-1">Health Score</div>
              <div className="flex items-end gap-3">
                <div className="font-heading text-4xl font-semibold text-stone-900">{insights?.health_score ?? 78}</div>
                <div className="text-xs text-stone-500 mb-1.5">
                  {insights?.trend === "improving" ? "↗ Improving" : "→ Stable"} · {insights?.streak_days ?? 7}-day streak
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-stone-100 overflow-hidden">
                <div className={`h-full bg-${accent}-500 shine`} style={{ width: `${insights?.health_score ?? 78}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions - Bento grid */}
      <section data-testid="quick-actions">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">Quick actions</h2>
          <div className="text-xs uppercase tracking-[0.15em] text-stone-500">Tap any card</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <QuickTile to="/chat" icon={MessagesSquare} color="sky" title="AI Chat" desc="Describe symptoms · Multilingual" />
          <QuickTile to="/cost" icon={Calculator} color="amber" title="Cost Estimator" desc="Min / Avg / Max by city" />
          <QuickTile to="/hospitals" icon={Hospital} color="sky" title="Hospitals" desc="Ratings · Distance · Schemes" />
          <QuickTile to="/schemes" icon={ShieldCheck} color="amber" title="Govt Schemes" desc="Ayushman Bharat eligibility" />
          <QuickTile to="/diagnose" icon={ImagePlus} color="lime" title="Image Check" desc="Skin · Animal · Reports" />
          <QuickTile to="/records" icon={FileHeart} color="sky" title="Health Records" desc="Upload &amp; AI summary" />
          <QuickTile to="/ayurveda" icon={Leaf} color="lime" title="Ayurveda" desc="Home remedies &amp; herbs" />
          <QuickTile to="/farmer" icon={Tractor} color="lime" title="Farmer Mode" desc="Livestock health &amp; schemes" />
        </div>
      </section>

      {/* Tips + Seasonal */}
      <section className="grid lg:grid-cols-3 gap-5" data-testid="tips-section">
        <div className="lg:col-span-2 rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 relative overflow-hidden">
          <img src={AYURVEDA_IMG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-700">
              <Flame className="w-3.5 h-3.5" /> Today's Wellness
            </div>
            <h3 className="font-heading text-2xl font-medium mt-2">Preventive care tips</h3>
            <ul className="mt-4 grid sm:grid-cols-2 gap-3">
              {(tips?.tips || [
                "Drink 2.5L water", "Walk 7,000+ steps", "Eat 1 seasonal fruit", "Sleep by 11 PM",
              ]).map((tip, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 grid place-items-center text-xs font-semibold">{i + 1}</div>
                  <p className="text-sm text-stone-700 leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-3xl bg-orange-50 border border-orange-200 p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-orange-700">
            <Activity className="w-3.5 h-3.5" /> Seasonal Alert
          </div>
          <h3 className="font-heading text-xl font-medium mt-2">Monsoon Watch</h3>
          <p className="mt-3 text-sm text-stone-700 leading-relaxed">
            Boil drinking water to prevent typhoid &amp; cholera. Watch for dengue — keep windows screened.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-stone-600">
            <li>• Mosquito nets at dusk</li>
            <li>• Keep electrolytes handy</li>
            <li>• Avoid street food</li>
          </ul>
        </div>
      </section>

      {/* Mode-aware insight */}
      <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 flex flex-col lg:flex-row gap-6 items-start" data-testid="mode-insight">
        <div className={`w-14 h-14 shrink-0 rounded-2xl bg-${accent}-50 text-${accent}-700 grid place-items-center`}>
          <HeartPulse className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-[0.18em] text-stone-500">{mode === "human" ? "Human Mode" : "Animal Mode"}</div>
          <h3 className="font-heading text-2xl font-medium mt-1">
            {mode === "human"
              ? "Your personalized care, balanced with tradition."
              : "Healthy livestock, happier farmers."}
          </h3>
          <p className="mt-3 text-stone-600 leading-relaxed max-w-2xl">
            {mode === "human"
              ? "HealAI blends modern diagnostics with Ayurveda-aware guidance. Ask about anything — from a cough to a cardiac check. Always consult a licensed doctor for final decisions."
              : "Describe your animal's symptoms — cow, dog, goat, poultry — and get care steps, vet referrals, and government schemes like Pashu Kisan Credit Card."}
          </p>
        </div>
      </section>
    </div>
  );
}
