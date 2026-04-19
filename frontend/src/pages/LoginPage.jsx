import React from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { LogIn, Heart, ShieldCheck, CloudUpload } from "lucide-react";

const HERO = "https://images.pexels.com/photos/14558557/pexels-photo-14558557.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2 gap-8 items-center" data-testid="login-page">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600">
          <Heart className="w-3.5 h-3.5 text-sky-600" /> HealAI Account
        </div>
        <h1 className="mt-5 font-heading text-4xl sm:text-5xl font-semibold tracking-tight">
          Sign in to save your health journey.
        </h1>
        <p className="mt-4 text-stone-600 text-lg leading-relaxed max-w-lg">
          Secure, one-click sign-in with Google. Your chats and reports stay private and accessible across devices.
        </p>

        <div className="mt-8 space-y-3">
          {[
            { icon: CloudUpload, text: "Keep your reports & timeline safe" },
            { icon: ShieldCheck, text: "Private, encrypted session — 7-day login" },
            { icon: Heart, text: "Personalized insights & health score" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-stone-700">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 grid place-items-center">
                <f.icon className="w-4 h-4" />
              </div>
              <span className="text-sm">{f.text}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={login}
          className="mt-8 h-12 px-8 rounded-full bg-stone-900 text-white hover:bg-stone-800"
          data-testid="google-login-btn"
        >
          <LogIn className="w-4 h-4 mr-2" /> Continue with Google
        </Button>
        <p className="mt-4 text-xs text-stone-500">
          You can still use HealAI anonymously — sign in only to save your records.
        </p>
      </div>

      <div className="relative rounded-3xl overflow-hidden border border-stone-200 aspect-[5/4] hidden lg:block">
        <img src={HERO} alt="doctor" className="w-full h-full object-cover" />
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 backdrop-blur p-4 border border-stone-200">
          <div className="text-xs uppercase tracking-[0.18em] text-stone-500">One-click Google</div>
          <div className="mt-1 font-heading font-medium">We never store your password.</div>
        </div>
      </div>
    </div>
  );
}
