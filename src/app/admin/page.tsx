import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Users, Clock, CheckCircle } from "lucide-react";
import { ORDER_STATUSES, STATUS_COLORS, formatDate, formatFileSize } from "@/lib/utils";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/");

  const orders = await prisma.order.findMany({
    include: { user: { select: { email: true, name: true } }, settings: true },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => !["delivered", "printed"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    customers: new Set(orders.map((o) => o.userId)).size,
  };

  const statusLabel = (key: string) => ORDER_STATUSES.find((s) => s.key === key)?.label ?? key;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage all orders and update their status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: stats.total, icon: Package, color: "text-blue-600 bg-blue-50" },
          { label: "In Progress", value: stats.pending, icon: Clock, color: "text-orange-600 bg-orange-50" },
          { label: "Delivered", value: stats.delivered, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          { label: "Customers", value: stats.customers, icon: Users, color: "text-purple-600 bg-purple-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`inline-flex p-2.5 rounded-xl ${color} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Settings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No orders yet</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm max-w-xs truncate">{order.fileName}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(order.fileSize)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{order.user.name || "—"}</p>
                      <p className="text-xs text-gray-400">{order.user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-600">{order.settings?.printerModel}</p>
                      <p className="text-xs text-gray-400">{order.settings?.material} · {order.settings?.nozzleSize}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${STATUS_COLORS[order.status] ?? "bg-gray-400"}`}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
