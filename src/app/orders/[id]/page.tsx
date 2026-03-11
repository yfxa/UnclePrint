import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, FileBox } from "lucide-react";
import { ORDER_STATUSES, STATUS_COLORS, formatDate, formatFileSize } from "@/lib/utils";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      settings: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();
  if (session.user.role !== "admin" && order.userId !== session.user.id) redirect("/orders");

  const currentIndex = ORDER_STATUSES.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <FileBox className="w-7 h-7 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 mb-1">{order.fileName}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-gray-400">
              <span>{formatFileSize(order.fileSize)}</span>
              <span>·</span>
              <span>Ordered {formatDate(order.createdAt)}</span>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${STATUS_COLORS[order.status] ?? "bg-gray-400"}`}>
            {ORDER_STATUSES.find((s) => s.key === order.status)?.label ?? order.status}
          </span>
        </div>

        {order.trackingNumber && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Tracking: <span className="font-mono font-semibold text-gray-700">{order.trackingNumber}</span></span>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-6">Order Progress</h2>
        <div className="space-y-0">
          {ORDER_STATUSES.map((step, i) => {
            const isDone = i <= currentIndex;
            const isCurrent = i === currentIndex;
            const historyEntry = order.statusHistory.find((h) => h.status === step.key);

            return (
              <div key={step.key} className="flex gap-4">
                {/* Connector */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCurrent ? `${STATUS_COLORS[step.key]} shadow-lg` :
                    isDone ? "bg-green-500" : "bg-gray-100"
                  }`}>
                    {isDone && !isCurrent ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 text-white" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    )}
                  </div>
                  {i < ORDER_STATUSES.length - 1 && (
                    <div className={`w-0.5 flex-1 my-1 ${isDone && i < currentIndex ? "bg-green-300" : "bg-gray-100"}`} style={{ minHeight: "2rem" }} />
                  )}
                </div>

                {/* Content */}
                <div className={`pb-6 flex-1 ${i === ORDER_STATUSES.length - 1 ? "pb-0" : ""}`}>
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <p className={`font-semibold ${isDone ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                    {historyEntry && (
                      <span className="text-xs text-gray-400">{formatDate(historyEntry.createdAt)}</span>
                    )}
                  </div>
                  <p className={`text-sm ${isDone ? "text-gray-500" : "text-gray-300"}`}>
                    {historyEntry?.note || step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Print Settings */}
      {order.settings && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Print Settings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Printer", value: order.settings.printerModel },
              { label: "Material", value: order.settings.material },
              { label: "Color", value: order.settings.color },
              { label: "Nozzle Size", value: order.settings.nozzleSize },
              { label: "Layer Height", value: order.settings.layerHeight },
              { label: "Infill", value: `${order.settings.infillPercent}%` },
              { label: "Quantity", value: `${order.settings.quantity}×` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="font-semibold text-gray-800 text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
          <p className="text-gray-600 text-sm">{order.notes}</p>
        </div>
      )}

      {/* Pricing */}
      {(order.estimatedPrice || order.finalPrice) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Pricing</h2>
          <div className="space-y-2 text-sm">
            {order.estimatedPrice && (
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated price</span>
                <span className="font-semibold">${order.estimatedPrice.toFixed(2)}</span>
              </div>
            )}
            {order.finalPrice && (
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-900 font-semibold">Final price</span>
                <span className="font-bold text-blue-600">${order.finalPrice.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
