import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { api } from "../utils/api";
import { CalendarDays, Clock, CheckCircle, XCircle, CalendarPlus } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  SCHEDULED: { label: "مجدول", color: "bg-blue-50 text-blue-600", icon: CalendarDays },
  COMPLETED: { label: "مكتمل", color: "bg-green-50 text-green-600", icon: CheckCircle },
  CANCELLED: { label: "ملغي", color: "bg-red-50 text-red-600", icon: XCircle },
  NO_SHOW: { label: "لم يحضر", color: "bg-gray-50 text-gray-600", icon: XCircle },
  IN_PROGRESS: { label: "قيد التنفيذ", color: "bg-yellow-50 text-yellow-600", icon: Clock },
};

export default function Appointments() {
  const [date, setDate] = useState<string>("");

    const isOfflineMode = useAuthStore((s) => s.isOfflineMode);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["appointments", date],
    queryFn: () => api.get("/appointments", { params: date ? { date } : {} }),
    enabled: !isOfflineMode,
  });

  const appointments = data?.data?.data || [];

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المواعيد</h1>
          <p className="text-gray-500 dark:text-gray-400">متابعة مواعيد المرضى اليومية</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            dir="ltr"
          />
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <CalendarPlus size={16} />
            موعد جديد
          </button>
        </div>
      </div>

      {isLoading && !isOfflineMode ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : isOfflineMode || isError ? (
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{isOfflineMode ? "أنت في الوضع المحلي (غير متصل بالسيرفر)" : "تعذر الاتصال بالسيرفر"}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">بيانات المواعيد متاحة فقط عند الاتصال بسيرفر النظام.</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-10 text-center border border-gray-100 dark:border-gray-700">
          <CalendarDays size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {date ? `لا توجد مواعيد في ${formatDate(date)}` : "لا توجد مواعيد"}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-right">
                <tr>
                  <th className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">المريض</th>
                  <th className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">الطبيب</th>
                  <th className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">التاريخ</th>
                  <th className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">النوع</th>
                  <th className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt: any) => {
                  const status = statusConfig[appt.status] || statusConfig.SCHEDULED;
                  return (
                    <tr key={appt.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        {appt.patient?.firstName} {appt.patient?.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {appt.doctor?.user
                          ? `${appt.doctor.user.firstName} ${appt.doctor.user.lastName}`
                          : "غير محدد"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(appt.appointmentDate)}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {appt.type === "CONSULTATION" ? "استشارة" : appt.type === "FOLLOW_UP" ? "متابعة" : appt.type}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${status.color}`}>
                          <status.icon size={12} />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
