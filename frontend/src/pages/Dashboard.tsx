import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";
import {
  Users,
  CalendarDays,
  Stethoscope,
  BedDouble,
  Banknote,
  FlaskConical,
  AlertTriangle,
  Pill,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function Dashboard() {
  const isOfflineMode = useAuthStore((s) => s.isOfflineMode);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => api.get("/dashboard/stats"),
    refetchInterval: 60000,
    enabled: !isOfflineMode,
  });

  const stats = data?.data?.data?.overview || {};

  const cards = [
    {
      label: "إجمالي المرضى",
      value: stats.totalPatients ?? "-",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      link: "/patients",
    },
    {
      label: "مواعيد اليوم",
      value: stats.todayAppointments ?? "-",
      icon: CalendarDays,
      color: "bg-green-50 text-green-600",
      link: "/appointments",
    },
    {
      label: "الأطباء المتاحين",
      value: stats.activeDoctors ?? "-",
      icon: Stethoscope,
      color: "bg-purple-50 text-purple-600",
      link: "/patients",
    },
    {
      label: "إشغال الأسرة",
      value:
        stats.bedOccupancy !== undefined
          ? `${stats.bedOccupancy.occupied ?? 0}/${stats.bedOccupancy.total ?? 0} (${stats.bedOccupancy.rate ?? 0}%)`
          : "-",
      icon: BedDouble,
      color: "bg-orange-50 text-orange-600",
      link: "/rooms",
    },
    {
      label: "إيرادات اليوم",
      value: stats.todayRevenue !== undefined ? `${Number(stats.todayRevenue).toLocaleString("ar-EG")} ر.س` : "-",
      icon: Banknote,
      color: "bg-emerald-50 text-emerald-600",
      link: "/billing",
    },
    {
      label: "فحوصات معلقة",
      value: stats.pendingLabTests ?? "-",
      icon: FlaskConical,
      color: "bg-cyan-50 text-cyan-600",
      link: "/lab",
    },
    {
      label: "حالات الطوارئ",
      value: stats.emergencyVisits ?? "-",
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600",
      link: "/emergency",
    },
    {
      label: "أدوية منخفضة المخزون",
      value: stats.lowStockMedicines ?? "-",
      icon: Pill,
      color: "bg-yellow-50 text-yellow-600",
      link: "/pharmacy",
    },
  ];

  if (isLoading && !isOfflineMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isOfflineMode || isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          {isOfflineMode ? "أنت في الوضع المحلي (غير متصل بالسيرفر)" : "تعذر الاتصال بالسيرفر"}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          بيانات لوحة التحكم متاحة فقط عند الاتصال بسيرفر النظام. يمكنك المتابعة عبر الصفحات الأخرى.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">لوحة التحكم</h1>
        <p className="text-gray-500 dark:text-gray-400">نظرة عامة على أداء المستشفى</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-2">مرحباً بك في نظام إدارة المستشفى</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          يمكنك إدارة المرضى والمواعيد والغرف والصيدلية والمختبر والفواتير وحالات الطوارئ من خلال القائمة الجانبية.
          {stats.pendingRadiology !== undefined
            ? ` توجد ${stats.pendingRadiology} صورة أشعة معلقة للمراجعة.`
            : ""}
        </p>
      </div>
    </div>
  );
}
