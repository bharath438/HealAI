import React, { useRef, useState } from "react";
import { Volume2, Loader2, StopCircle } from "lucide-react";
import { ttsAudioUrl } from "../lib/api";
import { toast } from "sonner";

export default function SpeakButton({ text, voice = "alloy" }) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const play = async () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    setLoading(true);
    try {
      const url = await ttsAudioUrl(text, voice);
      const a = new Audio(url);
      audioRef.current = a;
      a.onended = () => setPlaying(false);
      a.onpause = () => setPlaying(false);
      a.play();
      setPlaying(true);
    } catch {
      toast.error("Couldn't play audio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={play}
      type="button"
      data-testid="speak-btn"
      className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-800 transition-colors"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : playing ? <StopCircle className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
      {playing ? "Stop" : loading ? "Loading…" : "Listen"}
    </button>
  );
}
