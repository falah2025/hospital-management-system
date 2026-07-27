import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";
import { CreditCard, Search, DollarSign, Clock } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
  PAID: { label: "مدفوع", color: "bg-green-50 text-green-600" },
  PARTIALLY_PAID: { label: "مدفوع جزئياً", color: "bg-yellow-50 text-yellow-600" },
  UNPAID: { label: "غير مدفوع", color: "bg-red-50 text-red-600" },
  OVERDUE: { label: "متأخر", color: "bg-red-100 text-red-700" },
};

export default function Billing() {
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", status],
    queryFn: () => api.get(`/billing/invoices?status=${status}`),
  });

  const invoices = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المحاسبة والفواتير</h1>
          <p className="text-gray-500 dark:text-gray-400">إدارة الفواتير والمدفوعات</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition">
          <CreditCard size={18} />
          <span>فاتورة جديدة</span>
        </button>
      </div>

      <div className="flex gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">جميع الحالات</option>
          <option value="PAID">مدفوع</option>
          <option value="PARTIALLY_PAID">مدفوع جزئياً</option>
          <option value="UNPAID">غير مدفوع</option>
          <option value="OVERDUE">متأخر</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">رقم الفاتورة</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">المريض</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">المبلغ</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">المدفوع</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">المتبقي</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">جاري التحميل...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">لا يوجد فواتير</td></tr>
              ) : (
                invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-300">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{inv.patient?.firstName} {inv.patient?.lastName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${inv.totalAmount}</td>
                    <td className="px-6 py-4 text-sm text-green-600">${inv.paidAmount}</td>
                    <td className="px-6 py-4 text-sm text-red-600">${inv.dueAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig[inv.status]?.color}`}>
                        {statusConfig[inv.status]?.label}
                      </span>
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
