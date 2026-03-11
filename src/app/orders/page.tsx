import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ChevronRight, Upload } from "lucide-react";
import { ORDER_STATUSES, STATUS_COLORS, formatDate, formatFileSize } from "@/lib/utils";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { settings: true },
    orderBy: { createdAt: "desc" },
  });

  const statusLabel = (key: string) => ORDER_STATUSES.find((s) => s.key === key)?.label ?? key;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link href="/upload" className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
          <Upload className="w-4 h-4" />
          New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
          <div className="inline-flex p-4 bg-gray-100 rounded-2xl mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-400 mb-6">Upload your first 3D model to get started</p>
          <Link href="/upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
            <Upload className="w-4 h-4" />
            Upload a Model
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-blue-50 transition-colors">
                  <Package className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 truncate">{order.fileName}</p>
                    <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${STATUS_COLORS[order.status] ?? "bg-gray-400"}`}>
                      {statusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {formatFileSize(order.fileSize)} · {order.settings?.printerModel} · {order.settings?.material} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
