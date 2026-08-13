import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { api } from "../utils/api";
import { FlaskConical, Search, Clock, CheckCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "قيد الانتظار", color: "bg-yellow-50 text-yellow-600" },
  IN_PROGRESS: { label: "قيد التنفيذ", color: "bg-blue-50 text-blue-600" },
  COMPLETED: { label: "مكتمل", color: "bg-green-50 text-green-600" },
  CANCELLED: { label: "ملغي", color: "bg-red-50 text-red-600" },
};

export default function Lab() {
  const [status, setStatus] = useState("");

    const isOfflineMode = useAuthStore((s) => s.isOfflineMode);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["lab-tests", status],
    queryFn: () => api.get(`/lab/tests?status=${status}`),
    enabled: !isOfflineMode,
    });

  const tests = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المختبر والأشعة</h1>
        <p className="text-gray-500 dark:text-gray-400">إدارة الفحوصات المخبرية والأشعة</p>
      </div>

      <div className="flex gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">جميع الحالات</option>
          <option value="PENDING">قيد الانتظار</option>
          <option value="IN_PROGRESS">قيد التنفيذ</option>
          <option value="COMPLETED">مكتمل</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">المريض</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">الفحص</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">الطبيب</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">تاريخ الطلب</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading && !isOfflineMode ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">جاري التحميل...</td></tr>
              ) : isOfflineMode || isError ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">{isOfflineMode ? "أنت في الوضع المحلي — البيانات متاحة فقط عند الاتصال بسيرفر النظام" : "تعذر الاتصال بالسيرفر"}</td></tr>
              ) : tests.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">لا يوجد فحوصات</td></tr>
              ) : (
                tests.map((test: any) => (
                  <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{test.patient?.firstName} {test.patient?.lastName}</p>
                      <p className="text-xs text-gray-500">{test.patient?.patientNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FlaskConical size={16} className="text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{test.testName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      د. {test.doctor?.user?.firstName} {test.doctor?.user?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(test.requestDate).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig[test.status]?.color}`}>
                        {statusConfig[test.status]?.label}
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
