import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { analyzeImage } from "../lib/api";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { ImagePlus, Upload, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function DiagnosePage() {
  const { mode, language } = useApp();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onPick = (f) => {
    setFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl(null);
  };

  const analyze = async () => {
    if (!file) return toast.error("Pick an image first");
    setLoading(true);
    try {
      const res = await analyzeImage(file, mode, context, language);
      setResult(res);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Analysis failed");
    } finally { setLoading(false); }
  };

  const accent = mode === "human" ? "sky" : "lime";

  return (
    <div className="space-y-6" data-testid="diagnose-page">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">Image check</h1>
        <p className="text-stone-500 text-sm mt-1">
          {mode === "animal" ? "Upload a photo of your animal's symptom or skin condition." : "Skin issue? Report? Prescription? Let AI take a look."}
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className={`rounded-3xl border-2 border-dashed border-stone-300 bg-white p-8 text-center card-lift`} data-testid="image-dropzone">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="max-h-64 mx-auto rounded-xl" />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl bg-${accent}-50 text-${accent}-700 grid place-items-center`}>
                  <ImagePlus className="w-7 h-7" />
                </div>
                <p className="text-sm text-stone-500">PNG · JPEG · WEBP up to 8 MB</p>
              </div>
            )}
            <label className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 bg-stone-100 border border-stone-200 cursor-pointer hover:bg-stone-200">
              <Upload className="w-4 h-4" /> <span className="text-sm">{file ? "Change image" : "Choose image"}</span>
              <input
                data-testid="diagnose-file-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => onPick(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div className="rounded-3xl bg-white border border-stone-200 p-5">
            <label className="text-xs uppercase tracking-[0.15em] text-stone-500">Context (optional)</label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={mode === "animal" ? "e.g. 3-year-old cow, symptom since 2 days" : "e.g. Itchy since 3 days, mostly at night"}
              className="mt-2 bg-stone-50 border-stone-200 rounded-xl min-h-[90px]"
              data-testid="diagnose-context-input"
            />
            <Button
              onClick={analyze}
              disabled={loading || !file}
              className={`mt-4 w-full h-11 rounded-full bg-${accent}-600 hover:bg-${accent}-700 text-white`}
              data-testid="analyze-btn"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Analyze image
            </Button>
          </div>
        </div>

        <div className="lg:col-span-3 rounded-3xl bg-white border border-stone-200 p-5 sm:p-6 min-h-[400px]" data-testid="diagnose-result">
          {!result && !loading && (
            <div className="h-full grid place-items-center text-stone-500 text-center">
              <div>
                <ImagePlus className="w-10 h-10 mx-auto text-stone-300" />
                <p className="mt-3 text-sm">AI analysis will appear here.</p>
                <p className="text-xs mt-1 max-w-sm">This is guidance, not diagnosis — please consult a licensed professional.</p>
              </div>
            </div>
          )}
          {loading && (
            <div className="h-full grid place-items-center text-stone-500">
              <div className="text-center">
                <Loader2 className="w-7 h-7 animate-spin mx-auto text-stone-400" />
                <p className="mt-3 text-sm">Analyzing image…</p>
              </div>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-stone-500">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> AI Reference · Non-diagnostic
              </div>
              <pre className="whitespace-pre-wrap text-sm text-stone-800 leading-relaxed font-body bg-stone-50 border border-stone-200 rounded-xl p-4">{result.analysis}</pre>
              <div className="text-xs text-stone-500 border-t border-stone-100 pt-3">{result.disclaimer}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
