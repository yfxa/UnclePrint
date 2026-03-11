"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Upload, ChevronDown, ChevronUp, Loader2, FileBox, X } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

const PRINTERS = ["Bambu Lab X1C", "Prusa MK4", "Elegoo Saturn 4 Ultra", "Bambu Lab A1 Mini"];
const MATERIALS: Record<string, string[]> = {
  "Bambu Lab X1C": ["PLA", "PETG", "ABS", "TPU", "ASA", "PA"],
  "Prusa MK4": ["PLA", "PETG", "ASA", "Flex", "PETG-CF"],
  "Elegoo Saturn 4 Ultra": ["Standard Resin", "ABS-like Resin", "Water-washable Resin"],
  "Bambu Lab A1 Mini": ["PLA", "PETG", "TPU"],
};
const NOZZLE_SIZES = ["0.2mm", "0.4mm", "0.6mm", "0.8mm"];
const LAYER_HEIGHTS = ["0.05mm", "0.1mm", "0.15mm", "0.2mm", "0.3mm"];
const COLORS = ["White", "Black", "Grey", "Red", "Blue", "Green", "Yellow", "Orange", "Transparent", "Custom"];
const ALLOWED_EXTS = [".stl", ".obj", ".3mf", ".step", ".stp", ".ply"];

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [notes, setNotes] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [settings, setSettings] = useState({
    printerModel: "Bambu Lab X1C",
    material: "PLA",
    nozzleSize: "0.4mm",
    layerHeight: "0.2mm",
    infillPercent: 15,
    color: "White",
    quantity: 1,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function updateSettings(key: string, value: string | number) {
    setSettings((s) => {
      const next = { ...s, [key]: value };
      if (key === "printerModel") {
        next.material = MATERIALS[value as string]?.[0] ?? "PLA";
      }
      return next;
    });
  }

  const handleFile = useCallback((f: File) => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      setError(`Unsupported format. Allowed: ${ALLOWED_EXTS.join(", ")}`);
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      setError("File too large (max 100MB)");
      return;
    }
    setError("");
    setFile(f);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a file"); return; }
    if (!session) { router.push("/login"); return; }

    setUploading(true);
    setError("");

    try {
      // 1. Upload file
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const d = await uploadRes.json();
        throw new Error(d.error || "Upload failed");
      }
      const { fileName, fileUrl, fileSize } = await uploadRes.json();

      // 2. Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileUrl, fileSize, notes, settings }),
      });
      if (!orderRes.ok) throw new Error("Failed to create order");
      const order = await orderRes.json();

      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setUploading(false);
    }
  }

  if (status === "loading") return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New 3D Print Order</h1>
        <p className="text-gray-500 mt-1">Upload your model and we'll take care of the rest</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Drop Zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer",
            dragOver ? "border-blue-400 bg-blue-50" : file ? "border-green-300 bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !file && document.getElementById("file-input")?.click()}
        >
          {file ? (
            <div className="flex items-center justify-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FileBox className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="ml-auto p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="inline-flex p-4 bg-gray-100 rounded-2xl mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-700 mb-1">Drop your 3D model here</p>
              <p className="text-sm text-gray-400 mb-4">or click to browse</p>
              <p className="text-xs text-gray-400">STL · OBJ · 3MF · STEP · PLY · up to 100MB</p>
            </>
          )}
          <input
            id="file-input"
            type="file"
            accept=".stl,.obj,.3mf,.step,.stp,.ply"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Any special requirements, color preferences, or notes for our team..."
          />
        </div>

        {/* Advanced Settings */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <span className="font-semibold text-gray-900">Advanced Settings</span>
              <span className="text-sm text-gray-400 ml-2">
                {settings.printerModel} · {settings.material} · {settings.nozzleSize} nozzle
              </span>
            </div>
            {showAdvanced ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {showAdvanced && (
            <div className="px-6 pb-6 border-t border-gray-100 pt-5 grid grid-cols-2 gap-4">
              {/* Printer */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Printer Model</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRINTERS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateSettings("printerModel", p)}
                      className={cn(
                        "px-3 py-2.5 text-sm rounded-lg border text-left transition-all",
                        settings.printerModel === p
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Material */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Material</label>
                <select
                  value={settings.material}
                  onChange={(e) => updateSettings("material", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(MATERIALS[settings.printerModel] ?? ["PLA"]).map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Color</label>
                <select
                  value={settings.color}
                  onChange={(e) => updateSettings("color", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {COLORS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Nozzle */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Nozzle Size <span className="text-gray-400 font-normal normal-case">(smaller = more detail)</span>
                </label>
                <div className="flex gap-2">
                  {NOZZLE_SIZES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => updateSettings("nozzleSize", n)}
                      className={cn(
                        "flex-1 py-2 text-sm rounded-lg border transition-all",
                        settings.nozzleSize === n
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layer Height */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Layer Height <span className="text-gray-400 font-normal normal-case">(finer = slower)</span>
                </label>
                <div className="flex gap-2">
                  {LAYER_HEIGHTS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => updateSettings("layerHeight", l)}
                      className={cn(
                        "flex-1 py-2 text-xs rounded-lg border transition-all",
                        settings.layerHeight === l
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Infill */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Infill — <span className="text-blue-600 font-semibold">{settings.infillPercent}%</span>
                  <span className="text-gray-400 font-normal ml-2">
                    {settings.infillPercent <= 15 ? "(Lightweight)" : settings.infillPercent <= 40 ? "(Standard)" : settings.infillPercent <= 70 ? "(Strong)" : "(Solid)"}
                  </span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={settings.infillPercent}
                  onChange={(e) => updateSettings("infillPercent", parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5% Light</span><span>50% Standard</span><span>100% Solid</span>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => updateSettings("quantity", Math.max(1, settings.quantity - 1))} className="w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center text-lg">−</button>
                  <span className="text-lg font-semibold text-gray-900 w-8 text-center">{settings.quantity}</span>
                  <button type="button" onClick={() => updateSettings("quantity", settings.quantity + 1)} className="w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center text-lg">+</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
        >
          {uploading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="w-5 h-5" /> Place Order</>
          )}
        </button>
      </form>
    </div>
  );
}
