import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { chatApi } from "../lib/api";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Send, Loader2, AlertTriangle, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import VoiceRecorder from "../components/VoiceRecorder";
import SpeakButton from "../components/SpeakButton";

const QUICK_PROMPTS = {
  human: [
    "I have a fever and body aches for 2 days — what should I do?",
    "How much does angioplasty cost in Bangalore?",
    "Am I eligible for Ayushman Bharat?",
    "Best Ayurvedic remedy for acidity?",
  ],
  animal: [
    "My cow stopped eating since yesterday. What could it be?",
    "Vaccination schedule for 2-month-old puppy?",
    "Which government scheme helps dairy farmers?",
    "My goat has diarrhea — what should I do?",
  ],
};

export default function ChatPage() {
  const { mode, language, t } = useApp();
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem("healai_chat") || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(() => localStorage.getItem("healai_session") || null);
  const [loading, setLoading] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    localStorage.setItem("healai_chat", JSON.stringify(messages.slice(-40)));
  }, [messages]);

  const accent = mode === "human" ? "sky" : "lime";

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg, ts: Date.now() }]);
    setLoading(true);
    try {
      const res = await chatApi({ session_id: sessionId, message: msg, mode, language });
      if (!sessionId) {
        setSessionId(res.session_id);
        localStorage.setItem("healai_session", res.session_id);
      }
      setEmergency(res.emergency);
      setMessages((prev) => [...prev, {
        role: "bot", text: res.reply, emergency: res.emergency,
        disclaimer: res.disclaimer, suggestions: res.suggestions, ts: Date.now(),
      }]);
    } catch (e) {
      toast.error("Couldn't reach AI. Check your connection.");
      setMessages((prev) => [...prev, { role: "bot", text: "⚠️ AI service had an issue. Please retry.", ts: Date.now() }]);
    } finally { setLoading(false); }
  };

  const onTranscript = (t) => {
    setInput(t);
    // Auto-send after 200ms to feel natural
    setTimeout(() => send(t), 150);
  };

  const clear = () => {
    setMessages([]); setSessionId(null);
    localStorage.removeItem("healai_chat"); localStorage.removeItem("healai_session");
    setEmergency(false);
    toast.success("Conversation cleared");
  };

  return (
    <div className="space-y-4" data-testid="chat-page">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">{t("chat")}</h1>
          <p className="text-stone-500 mt-1 text-sm">
            Ask symptoms, costs, schemes · {mode === "human" ? "Human Health" : "Animal Health"} · {language.toUpperCase()} · 🎙 Voice ready
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clear} data-testid="clear-chat-btn" className="rounded-full text-stone-500">
          <Trash2 className="w-4 h-4 mr-1.5" /> Clear
        </Button>
      </div>

      {emergency && (
        <div className="rounded-2xl border border-orange-300 bg-orange-50 p-4 flex items-start gap-3 animate-fade-up" data-testid="emergency-banner">
          <AlertTriangle className="w-5 h-5 text-orange-700 shrink-0 mt-0.5" />
          <div className="text-sm text-stone-800">
            <b>Possible emergency detected.</b> Call <a href="tel:108" className="underline font-semibold">108</a> or head to the nearest ER immediately.
          </div>
        </div>
      )}

      <div className="rounded-3xl bg-white border border-stone-200 min-h-[55vh] max-h-[68vh] overflow-y-auto p-4 sm:p-6 space-y-4" data-testid="chat-messages-area">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-10">
            <div className={`w-14 h-14 rounded-2xl bg-${accent}-50 text-${accent}-700 grid place-items-center mb-4`}>
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-heading text-xl font-medium">How can I help today?</h3>
            <p className="text-stone-500 text-sm mt-1 max-w-md">I'm HealAI — try one of these or ask anything.</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-2 max-w-2xl w-full">
              {QUICK_PROMPTS[mode].map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  data-testid={`quick-prompt-${i}`}
                  className={`text-left text-sm p-3 rounded-xl bg-stone-50 hover:bg-${accent}-50 border border-stone-200 hover:border-${accent}-200 transition-all text-stone-700`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}>
            <div
              className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bubble-user bg-stone-900 text-white"
                  : `bubble-bot ${mode === "human" ? "bg-sky-50" : "bg-lime-50"} text-stone-800 border border-stone-200`
              }`}
              data-testid={`message-${m.role}-${i}`}
            >
              {m.text}
              {m.role === "bot" && (
                <div className="mt-3 pt-3 border-t border-stone-200/60 flex items-center gap-3">
                  <SpeakButton text={m.text} />
                  {m.disclaimer && <div className="text-[11px] text-stone-500">{m.disclaimer}</div>}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className={`bubble-bot px-4 py-3 ${mode === "human" ? "bg-sky-50" : "bg-lime-50"} border border-stone-200 text-stone-600 flex items-center gap-2`}>
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-3 sm:p-4 flex items-end gap-2" data-testid="chat-input-area">
        <VoiceRecorder language={language} onTranscript={onTranscript} accent={accent} />
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={t("askSomething")}
          className="min-h-[48px] max-h-40 border-0 focus-visible:ring-0 resize-none bg-transparent"
          data-testid="chat-input"
        />
        <Button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className={`rounded-full bg-${accent}-600 hover:bg-${accent}-700 text-white h-11 px-5`}
          data-testid="chat-send-btn"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
