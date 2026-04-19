import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, MessagesSquare, Calculator, Hospital, ShieldCheck,
  Siren, FileHeart, ImagePlus, Leaf, Tractor, Globe, Heart, Dog,
  Map as MapIcon, Activity, LogIn, LogOut, User,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "./ui/dropdown-menu";

const NAV = [
  { to: "/", icon: LayoutDashboard, key: "dashboard" },
  { to: "/chat", icon: MessagesSquare, key: "chat" },
  { to: "/cost", icon: Calculator, key: "cost" },
  { to: "/hospitals", icon: Hospital, key: "hospitals" },
  { to: "/map", icon: MapIcon, key: "map" },
  { to: "/schemes", icon: ShieldCheck, key: "schemes" },
  { to: "/emergency", icon: Siren, key: "emergency" },
  { to: "/records", icon: FileHeart, key: "history" },
  { to: "/diagnose", icon: ImagePlus, key: "diagnose" },
  { to: "/wearable", icon: Activity, key: "wearable" },
  { to: "/ayurveda", icon: Leaf, key: "ayurveda" },
  { to: "/farmer", icon: Tractor, key: "farmer" },
];

const LABELS = { map: "Map", wearable: "Wearable" };

export default function Layout({ children }) {
  const { mode, changeMode, language, changeLanguage, t, LANG_LABELS } = useApp();
  const { user, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const accent = mode === "human" ? "sky" : "lime";
  const labelOf = (k) => LABELS[k] || t(k);

  return (
    <div className={`App mode-${mode} min-h-screen bg-stone-50 text-stone-900`}>
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-stone-50/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2.5" data-testid="logo-home-link">
            <div className={`w-9 h-9 rounded-2xl bg-${accent}-600 text-white grid place-items-center font-heading font-semibold shadow-sm`}>
              <Heart className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div className="leading-tight">
              <div className="font-heading font-semibold text-lg tracking-tight">HealAI</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Universal · India</div>
            </div>
          </NavLink>

          <div className="hidden md:flex items-center gap-1.5">
            <div className="flex items-center rounded-full bg-stone-100 p-1" data-testid="mode-switch">
              <button
                onClick={() => changeMode("human")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all ${mode === "human" ? "bg-white text-sky-700 shadow-sm" : "text-stone-500 hover:text-stone-800"}`}
                data-testid="mode-human-btn"
              >
                <Heart className="w-3.5 h-3.5" /> {t("humanMode")}
              </button>
              <button
                onClick={() => changeMode("animal")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all ${mode === "animal" ? "bg-white text-lime-700 shadow-sm" : "text-stone-500 hover:text-stone-800"}`}
                data-testid="mode-animal-btn"
              >
                <Dog className="w-3.5 h-3.5" /> {t("animalMode")}
              </button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full" data-testid="language-switch-btn">
                  <Globe className="w-4 h-4 mr-1.5" /> {LANG_LABELS[language].code}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(LANG_LABELS).map(([k, v]) => (
                  <DropdownMenuItem key={k} onClick={() => changeLanguage(k)} data-testid={`lang-${k}-option`}>
                    {v.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <NavLink to="/emergency" className="ml-1">
              <Button size="sm" className="rounded-full bg-orange-600 hover:bg-orange-700 text-white pulse-emergency" data-testid="emergency-btn">
                <Siren className="w-4 h-4 mr-1.5" /> 108
              </Button>
            </NavLink>

            {/* Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-2 flex items-center gap-2 rounded-full p-0.5 pl-0.5 pr-3 bg-stone-100 hover:bg-stone-200 transition-colors" data-testid="user-menu-btn">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 grid place-items-center text-xs font-semibold">
                        {(user.name || user.email || "U").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-stone-800 hidden xl:inline">{(user.name || user.email).split(" ")[0]}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs">
                    <div className="font-normal text-stone-500">Signed in as</div>
                    <div className="truncate font-medium text-stone-800">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/records")} data-testid="menu-records">
                    <FileHeart className="w-4 h-4 mr-2" /> My records
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => { await logout(); navigate("/"); }} data-testid="logout-btn">
                    <LogOut className="w-4 h-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={login} variant="outline" size="sm" className="ml-1 rounded-full border-stone-300" data-testid="header-login-btn">
                <LogIn className="w-4 h-4 mr-1.5" /> Sign in
              </Button>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => changeMode(mode === "human" ? "animal" : "human")}
              className={`text-xs rounded-full px-3 py-1.5 font-medium ${mode === "human" ? "bg-sky-600 text-white" : "bg-lime-600 text-white"}`}
              data-testid="mobile-mode-toggle-btn"
            >
              {mode === "human" ? "Human" : "Animal"}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full px-2" data-testid="mobile-lang-btn">
                  <Globe className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(LANG_LABELS).map(([k, v]) => (
                  <DropdownMenuItem key={k} onClick={() => changeLanguage(k)}>{v.name}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {user ? (
              <button onClick={logout} className="rounded-full p-0.5" data-testid="mobile-user-btn">
                {user.picture ? <img src={user.picture} alt="" className="w-7 h-7 rounded-full" /> : <User className="w-5 h-5 text-stone-600" />}
              </button>
            ) : (
              <Button onClick={login} size="sm" variant="ghost" className="rounded-full px-2" data-testid="mobile-login-btn">
                <LogIn className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start" data-testid="sidebar-nav">
          <nav className="flex flex-col gap-0.5">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = location.pathname === n.to;
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  data-testid={`nav-${n.key}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? `bg-${accent}-50 text-${accent}-700 border border-${accent}-100`
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.7} />
                  {labelOf(n.key)}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-4">
            <div className="text-[10px] font-heading uppercase tracking-[0.18em] text-amber-700 mb-1">Wellness Tip</div>
            <p className="text-sm text-stone-700 leading-relaxed">
              Small daily habits matter — hydrate, move, and rest. HealAI helps you navigate, not replace your doctor.
            </p>
          </div>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-stone-200" data-testid="mobile-bottom-nav">
        <div className="grid grid-cols-5 px-1">
          {NAV.slice(0, 5).map((n) => {
            const Icon = n.icon;
            const active = location.pathname === n.to;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center py-2.5 text-[10px] gap-0.5 ${active ? `text-${accent}-700` : "text-stone-500"}`}
                data-testid={`mobile-nav-${n.key}`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.7} />
                {labelOf(n.key)}
              </NavLink>
            );
          })}
        </div>
      </nav>
      <div className="h-16 lg:hidden" />
    </div>
  );
}
