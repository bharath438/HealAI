import React, { useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { transcribeAudio } from "../lib/api";
import { toast } from "sonner";

export default function VoiceRecorder({ language, onTranscript, accent = "sky" }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const chunksRef = useRef([]);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Microphone not supported in this browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        setRecording(false);
        setProcessing(true);
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          if (blob.size < 1000) { toast("Too short — hold to record"); return; }
          const r = await transcribeAudio(blob, language);
          if (r.text) onTranscript(r.text);
          else toast("Couldn't understand — please try again");
        } catch (e) {
          toast.error("Transcription failed");
        } finally {
          setProcessing(false);
          streamRef.current?.getTracks().forEach((t) => t.stop());
        }
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      toast.error("Microphone permission denied");
    }
  };

  const stop = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  };

  const handleClick = () => (recording ? stop() : start());

  return (
    <button
      onClick={handleClick}
      type="button"
      aria-label="Voice input"
      data-testid="voice-record-btn"
      disabled={processing}
      className={`h-11 w-11 rounded-full grid place-items-center transition-colors ${
        recording
          ? "bg-orange-600 text-white pulse-emergency"
          : processing
            ? "bg-stone-200 text-stone-500"
            : `bg-${accent}-50 text-${accent}-700 hover:bg-${accent}-100`
      }`}
    >
      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}
