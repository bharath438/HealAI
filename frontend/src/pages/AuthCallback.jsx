import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const { exchangeSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = location.hash || window.location.hash;
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) { navigate("/", { replace: true }); return; }
    const sessionId = decodeURIComponent(m[1]);
    exchangeSession(sessionId)
      .then((user) => navigate("/", { replace: true, state: { user } }))
      .catch(() => navigate("/login", { replace: true }));
  }, [exchangeSession, location.hash, navigate]);

  return (
    <div className="min-h-[70vh] grid place-items-center text-stone-500">
      <div className="text-center">
        <Loader2 className="w-7 h-7 mx-auto animate-spin text-stone-400" />
        <p className="mt-3 text-sm">Signing you in…</p>
      </div>
    </div>
  );
}
