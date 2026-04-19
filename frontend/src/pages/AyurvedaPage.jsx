import React, { useEffect, useState } from "react";
import { ayurvedaAll } from "../lib/api";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "../components/ui/tabs";
import { Leaf, Sparkles } from "lucide-react";

const AYURVEDA_IMG = "https://images.pexels.com/photos/20689437/pexels-photo-20689437.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const LABELS = {
  cold_cough: "Cold & Cough", fever: "Fever", digestion: "Digestion",
  skin: "Skin", diabetes: "Diabetes", joint_pain: "Joint Pain", stress_sleep: "Stress & Sleep",
};

export default function AyurvedaPage() {
  const [data, setData] = useState(null);

  useEffect(() => { ayurvedaAll().then(setData); }, []);

  if (!data) return <div className="text-stone-500" data-testid="ayurveda-loading">Loading…</div>;

  return (
    <div className="space-y-6" data-testid="ayurveda-page">
      <div className="relative rounded-3xl overflow-hidden border border-amber-200 bg-amber-50 p-8 sm:p-12">
        <img src={AYURVEDA_IMG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-700"><Leaf className="w-3.5 h-3.5" /> Ayurveda · Time-tested wisdom</div>
          <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight mt-3">Natural remedies, modern guidance.</h1>
          <p className="mt-3 text-stone-700 max-w-xl">
            Safe, everyday home-remedies rooted in Ayurveda. Always pair with your doctor's advice for chronic issues.
          </p>
        </div>
      </div>

      <Tabs defaultValue={data.categories[0]} className="w-full">
        <TabsList className="w-full flex flex-wrap gap-2 h-auto bg-stone-100 rounded-2xl p-1.5" data-testid="ayurveda-tabs">
          {data.categories.map((c) => (
            <TabsTrigger
              key={c}
              value={c}
              className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm"
              data-testid={`ayurveda-tab-${c}`}
            >
              {LABELS[c] || c}
            </TabsTrigger>
          ))}
        </TabsList>

        {data.categories.map((c) => {
          const r = data.data[c];
          return (
            <TabsContent key={c} value={c} className="mt-5 animate-fade-up">
              <div className="grid md:grid-cols-3 gap-5">
                <Block title="Remedies" items={r.remedies} color="amber" />
                <Block title="Herbs" items={r.herbs} color="lime" />
                <Block title="Lifestyle" items={r.lifestyle} color="sky" />
              </div>
              <div className="mt-4 text-xs text-stone-500 leading-relaxed">
                ⚕️ Ayurveda complements — not replaces — medical care. Consult a qualified Ayurvedic or allopathic doctor for diagnosis.
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

const Block = ({ title, items, color }) => (
  <div className={`rounded-2xl bg-${color}-50 border border-${color}-200 p-5`}>
    <div className={`text-xs uppercase tracking-[0.18em] text-${color}-700 flex items-center gap-1.5`}>
      <Sparkles className="w-3.5 h-3.5" /> {title}
    </div>
    <ul className="mt-3 space-y-2">
      {items.map((it, i) => (
        <li key={i} className="text-sm text-stone-700 flex gap-2 leading-relaxed">
          <span className={`text-${color}-600 font-bold`}>·</span>{it}
        </li>
      ))}
    </ul>
  </div>
);
