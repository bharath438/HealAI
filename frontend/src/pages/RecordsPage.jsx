import React, { useCallback, useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { uploadReport, listReports, deleteReport } from "../lib/api";
import { Button } from "../components/ui/button";
import { FileHeart, Upload, Loader2, Trash2, Calendar, Sparkles, LogIn } from "lucide-react";
import { toast } from "sonner";
import WhatsAppShareButton from "../components/WhatsAppShareButton";

export default function RecordsPage() {
  const { language } = useApp();
  const { user, login } = useAuth();
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const refresh = useCallback(() => { listReports().then((r) => setItems(r.reports || [])); }, []);
  useEffect(refresh, [refresh, user]);

  const upload = async () => {
    if (!file) { toast.error("Pick a file first"); return; }
    setUploading(true);
    try {
      await uploadReport(file, language);
      toast.success("Report analyzed and saved");
      setFile(null);
      refresh();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Upload failed");
    } finally { setUploading(false); }
  };

  const removeItem = async (id) => {
    await deleteReport(id);
    toast.success("Deleted");
    refresh();
  };

  return (
    <div className="space-y-6" data-testid="records-page">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">Health records</h1>
          <p className="text-stone-500 text-sm mt-1">Upload prescriptions or reports (PDF / image) · AI extracts medicines, diagnosis &amp; summary</p>
        </div>
        {!user && (
          <Button onClick={login} className="rounded-full bg-stone-900 hover:bg-stone-800 text-white" data-testid="records-signin-btn">
            <LogIn className="w-4 h-4 mr-2" /> Sign in to save
          </Button>
        )}
      </div>

      {!user && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" data-testid="records-guest-notice">
          You're browsing as <b>guest</b>. Records below are shared with all guests on this browser. <button onClick={login} className="underline font-medium">Sign in</button> to keep them private and available across devices.
        </div>
      )}

      {/* Upload */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-6" data-testid="upload-area">
        <div className="w-24 h-24 rounded-3xl bg-sky-50 text-sky-700 grid place-items-center shrink-0">
          <FileHeart className="w-10 h-10" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-xl font-medium">Upload a prescription / report</h3>
          <p className="text-sm text-stone-500 mt-1">PDF, PNG, JPEG, WEBP · max 10 MB</p>
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <label className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-stone-100 border border-stone-200 cursor-pointer hover:bg-stone-200">
              <Upload className="w-4 h-4" />
              <span className="text-sm">{file ? file.name : "Choose file"}</span>
              <input
                data-testid="report-file-input"
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <Button onClick={upload} disabled={!file || uploading} className="rounded-full bg-sky-600 hover:bg-sky-700 text-white h-10 px-5" data-testid="upload-report-btn">
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />} Analyze &amp; Save
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative" data-testid="timeline">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center text-stone-500">
            No records yet. Upload one to get started.
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-10 space-y-6">
            <div className="absolute top-0 bottom-0 left-2 sm:left-4 w-0.5 bg-stone-200" />
            {items.map((r) => (
              <div key={r.id} className="relative" data-testid={`record-${r.id}`}>
                <div className="absolute -left-[1px] sm:-left-[11px] top-5 w-5 h-5 rounded-full bg-sky-600 border-4 border-stone-50" />
                <div className="rounded-2xl bg-white border border-stone-200 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-heading font-medium">{r.filename}</div>
                      <div className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" /> {new Date(r.uploaded_at).toLocaleString()}
                        {r.file_type && <span className="ml-2 uppercase tracking-[0.15em] bg-stone-100 px-1.5 py-0.5 rounded">{r.file_type}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(r.id)} data-testid={`delete-record-${r.id}`}>
                      <Trash2 className="w-4 h-4 text-stone-500" />
                    </Button>
                  </div>
                  <pre className="mt-4 whitespace-pre-wrap text-sm text-stone-700 leading-relaxed font-body bg-stone-50 border border-stone-200 rounded-xl p-4">
{r.extracted}
                  </pre>
                  <div className="mt-3 flex justify-end">
                    <WhatsAppShareButton
                      text={`My HealAI medical summary:\n\n${r.extracted.slice(0, 900)}\n\n— Shared from HealAI`}
                      label="Share to WhatsApp"
                      testid={`share-record-${r.id}`}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
