import React, { useCallback, useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { uploadReport, listReports, deleteReport } from "../lib/api";
import { Button } from "../components/ui/button";
import { FileHeart, Upload, Loader2, Trash2, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function RecordsPage() {
  const { language } = useApp();
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const refresh = useCallback(() => { listReports().then((r) => setItems(r.reports || [])); }, []);
  useEffect(refresh, [refresh]);

  const upload = async () => {
    if (!file) { toast.error("Pick an image first"); return; }
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
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">Health records</h1>
        <p className="text-stone-500 text-sm mt-1">Upload prescriptions or reports · AI extracts medicines, diagnosis &amp; summary</p>
      </div>

      {/* Upload */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-6" data-testid="upload-area">
        <div className="w-24 h-24 rounded-3xl bg-sky-50 text-sky-700 grid place-items-center shrink-0">
          <FileHeart className="w-10 h-10" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-xl font-medium">Upload a prescription / report</h3>
          <p className="text-sm text-stone-500 mt-1">Image only for MVP (PNG/JPEG/WEBP · max 8 MB)</p>
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <label className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-stone-100 border border-stone-200 cursor-pointer hover:bg-stone-200">
              <Upload className="w-4 h-4" />
              <span className="text-sm">{file ? file.name : "Choose file"}</span>
              <input
                data-testid="report-file-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
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
            {items.map((r, i) => (
              <div key={r.id} className="relative" data-testid={`record-${r.id}`}>
                <div className="absolute -left-[1px] sm:-left-[11px] top-5 w-5 h-5 rounded-full bg-sky-600 border-4 border-stone-50" />
                <div className="rounded-2xl bg-white border border-stone-200 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-heading font-medium">{r.filename}</div>
                      <div className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" /> {new Date(r.uploaded_at).toLocaleString()}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(r.id)} data-testid={`delete-record-${r.id}`}>
                      <Trash2 className="w-4 h-4 text-stone-500" />
                    </Button>
                  </div>
                  <pre className="mt-4 whitespace-pre-wrap text-sm text-stone-700 leading-relaxed font-body bg-stone-50 border border-stone-200 rounded-xl p-4">
{r.extracted}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
