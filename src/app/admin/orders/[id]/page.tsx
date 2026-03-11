"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, CheckCircle2, Clock } from "lucide-react";
import { ORDER_STATUSES, STATUS_COLORS, formatDate, formatFileSize, cn } from "@/lib/utils";
import { MATERIAL_RATES, SETUP_FEE, calcEstimatedPrice } from "@/lib/pricing";

interface Order {
  id: string;
  fileName: string;
  fileSize: number;
  status: string;
  notes?: string;
  trackingNumber?: string;
  estimatedPrice?: number;
  finalPrice?: number;
  createdAt: string;
  user: { email: string; name?: string };
  settings?: {
    printerModel: string;
    material: string;
    nozzleSize: string;
    layerHeight: string;
    infillPercent: number;
    color: string;
    quantity: number;
  };
  statusHistory: { id: string; status: string; note?: string; createdAt: string }[];
}

export default function AdminOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [printWeightG, setPrintWeightG] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setNewStatus(data.status);
        setTrackingNumber(data.trackingNumber ?? "");
        setEstimatedPrice(data.estimatedPrice?.toString() ?? "");
        setFinalPrice(data.finalPrice?.toString() ?? "");
        setLoading(false);
      });
  }, [params.id]);

  async function handleSave() {
    setSaving(true);
    setSuccess("");
    const body: Record<string, unknown> = {};
    if (newStatus !== order?.status) { body.status = newStatus; body.note = statusNote; }
    if (trackingNumber !== (order?.trackingNumber ?? "")) body.trackingNumber = trackingNumber;
    if (estimatedPrice) body.estimatedPrice = parseFloat(estimatedPrice);
    if (finalPrice) body.finalPrice = parseFloat(finalPrice);

    const res = await fetch(`/api/orders/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const updated = await res.json();
      setOrder(updated);
      setStatusNote("");
      setSuccess("Order updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    }
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  if (!order) return <div className="text-center py-24 text-gray-500">Order not found</div>;

  const currentIndex = ORDER_STATUSES.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-1">{order.fileName}</h1>
            <p className="text-sm text-gray-400">{formatFileSize(order.fileSize)} · {formatDate(order.createdAt)}</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Customer: <span className="text-gray-800 font-medium">{order.user.name || order.user.email}</span></p>
              <p className="text-sm text-gray-400">{order.user.email}</p>
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Customer Notes</p>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Print settings */}
          {order.settings && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Print Settings</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  ["Printer", order.settings.printerModel],
                  ["Material", order.settings.material],
                  ["Color", order.settings.color],
                  ["Nozzle", order.settings.nozzleSize],
                  ["Layer Height", order.settings.layerHeight],
                  ["Infill", `${order.settings.infillPercent}%`],
                  ["Quantity", `${order.settings.quantity}×`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="font-semibold text-gray-800 text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status History */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Status History</h2>
            <div className="space-y-3">
              {order.statusHistory.map((h) => (
                <div key={h.id} className="flex items-start gap-3">
                  <span className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_COLORS[h.status] ?? "bg-gray-300"}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {ORDER_STATUSES.find((s) => s.key === h.status)?.label ?? h.status}
                      <span className="text-xs text-gray-400 font-normal ml-2">{formatDate(h.createdAt)}</span>
                    </p>
                    {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="space-y-6">
          {/* Status update */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Update Status</h2>
            <div className="space-y-2 mb-4">
              {ORDER_STATUSES.map((s, i) => {
                const isDone = i <= currentIndex;
                const isCurrent = s.key === order.status;
                const isSelected = s.key === newStatus;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setNewStatus(s.key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all text-sm",
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? STATUS_COLORS[s.key] : isDone ? "bg-green-400" : "bg-gray-100"}`}>
                      {isDone && !isCurrent ? <CheckCircle2 className="w-3 h-3 text-white" /> :
                       isCurrent ? <Clock className="w-3 h-3 text-white" /> :
                       <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />}
                    </div>
                    <span className={isSelected ? "font-semibold text-blue-700" : isDone ? "text-gray-700" : "text-gray-400"}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {newStatus !== order.status && (
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                placeholder="Note for customer (optional)"
              />
            )}
          </div>

          {/* Pricing & Tracking */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Details</h2>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Tracking Number</label>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 1Z999AA10123456784"
              />
            </div>

            {/* Weight-based price calculator */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Price Calculator</p>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Print weight (g) <span className="text-gray-400 font-normal">— from slicer</span>
                </label>
                <input
                  type="number"
                  value={printWeightG}
                  onChange={(e) => {
                    const w = e.target.value;
                    setPrintWeightG(w);
                    const grams = parseFloat(w);
                    if (!isNaN(grams) && grams > 0 && order?.settings) {
                      const price = calcEstimatedPrice(
                        order.settings.material,
                        grams,
                        order.settings.quantity
                      );
                      setEstimatedPrice(price.toFixed(2));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="e.g. 45"
                  step="0.1"
                  min="0"
                />
              </div>
              {order?.settings && (
                <p className="text-xs text-gray-400">
                  Rate: <span className="font-medium text-gray-600">
                    ${(MATERIAL_RATES[order.settings.material] ?? MATERIAL_RATES["PLA"]).toFixed(2)}/g
                  </span> ({order.settings.material}) · min ${SETUP_FEE.toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Estimated Price ($)</label>
              <input
                type="number"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Final Price ($)</label>
              <input
                type="number"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {success && (
            <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
