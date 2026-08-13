import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { api } from "../utils/api";
import { useQuery } from "@tanstack/react-query";
import { useMockData } from "../hooks/useMockData";
import {
  Users,
  CalendarDays,
  Stethoscope,
  BedDouble,
  Banknote,
  FlaskConical,
  AlertTriangle,
  Pill,
  Activity,
  ArrowLeft,
} from "lucide-react";

export default function Dashboard() {
  const isOfflineMode = useAuthStore((s) => s.isOfflineMode);
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => api.get("/dashboard/stats"),
    refetchInterval: 60000,
    enabled: !isOfflineMode,
  });

  const mock = useMockData();
  const isOnline = !isOfflineMode && data?.data?.data?.overview;

  // ---------- Online stats ----------
  const stats = data?.data?.data?.overview || {};
  const onlineCards = [
    { label: "إجمالي المرضى", value: stats.totalPatients ?? "-", icon: Users, color: "from-blue-500 to-blue-600", link: "/patients" },
    { label: "مواعيد اليوم", value: stats.todayAppointments ?? "-", icon: CalendarDays, color: "from-emerald-500 to-emerald-600", link: "/appointments" },
    { label: "الأطباء المتاحين", value: stats.activeDoctors ?? "-", icon: Stethoscope, color: "from-violet-500 to-violet-600", link: "/patients" },
    { label: "إشغال الأسرة", value: stats.bedOccupancy !== undefined ? `${stats.bedOccupancy.occupied ?? 0}/${stats.bedOccupancy.total ?? 0}` : "-", icon: BedDouble, color: "from-orange-500 to-orange-600", link: "/rooms" },
    { label: "إيرادات اليوم", value: stats.todayRevenue !== undefined ? `${Number(stats.todayRevenue).toLocaleString("ar-EG")} ر.س` : "-", icon: Banknote, color: "from-teal-500 to-teal-600", link: "/billing" },
    { label: "فحوصات معلقة", value: stats.pendingLabTests ?? "-", icon: FlaskConical, color: "from-cyan-500 to-cyan-600", link: "/lab" },
    { label: "حالات الطوارئ", value: stats.emergencyVisits ?? "-", icon: AlertTriangle, color: "from-red-500 to-red-600", link: "/emergency" },
    { label: "أدوية منخفضة المخزون", value: stats.lowStockMedicines ?? "-", icon: Pill, color: "from-amber-500 to-amber-600", link: "/pharmacy" },
  ];

  // ---------- Offline stats (rich mock) ----------
  const todayISO = new Date().toISOString().slice(0, 10);
  const todaysAppointments = mock.appointments.filter((a) => a.date.slice(0, 10) === todayISO).length;
  const totalBeds = mock.rooms.reduce((s, r) => s + r.beds, 0);
  const occupiedBeds = mock.rooms.reduce((s, r) => s + r.occupied, 0);
  const occupancyRate = totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const activeEmergency = mock.emergencyVisits.filter((v) => v.status === "ACTIVE").length;
  const lowStock = mock.medicines.filter((m) => m.stockQuantity <= m.reorderLevel).length;
  const pendingLabs = mock.labTests.filter((t) => t.status !== "COMPLETED").length;
  const availableDoctors = mock.doctors.filter((d) => d.status === "AVAILABLE").length;
  const todayRevenue = mock.invoices.reduce((s, i) => s + i.paidAmount, 0);

  const offlineCards = [
    { label: "إجمالي المرضى", value: mock.patients.length, icon: Users, color: "from-blue-500 to-blue-600", link: "/patients" },
    { label: "مواعيد اليوم", value: todaysAppointments, icon: CalendarDays, color: "from-emerald-500 to-emerald-600", link: "/appointments" },
    { label: "الأطباء المتاحين", value: availableDoctors, icon: Stethoscope, color: "from-violet-500 to-violet-600", link: "/patients" },
    { label: "إشغال الأسرة", value: `${occupiedBeds}/${totalBeds}`, sub: `${occupancyRate}%`, icon: BedDouble, color: "from-orange-500 to-orange-600", link: "/rooms" },
    { label: "المحصول اليوم", value: `${todayRevenue.toLocaleString("ar-EG")} ر.س`, icon: Banknote, color: "from-teal-500 to-teal-600", link: "/billing" },
    { label: "فحوصات معلقة", value: pendingLabs, icon: FlaskConical, color: "from-cyan-500 to-cyan-600", link: "/lab" },
    { label: "حالات الطوارئ", value: activeEmergency, icon: AlertTriangle, color: "from-red-500 to-red-600", link: "/emergency" },
    { label: "مخزون منخفض", value: lowStock, icon: Pill, color: "from-amber-500 to-amber-600", link: "/pharmacy" },
  ];

  const cards = isOnline ? onlineCards : offlineCards;

  if (!isOfflineMode && isLoading && !isError && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            مرحباً، {user?.firstName || "المستخدم"} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">نظرة عامة على أداء المستشفى — {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          {isOfflineMode && (
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-medium rounded-full border border-amber-200 dark:border-amber-800">
              <Activity size={12} /> الوضع المحلي — البيانات تجريبية محفوظة على الجهاز
            </span>
          )}
        </div>
        {!isOfflineMode && isError && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">تعذر الاتصال بالسيرفر</span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.color}`} />
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${card.color} text-white shadow-md`}>
              <card.icon size={21} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">{String(card.value)}</p>
            {"sub" in card && card.sub ? <p className="text-xs text-gray-400 mt-0.5">{String(card.sub)}</p> : null}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
            <ArrowLeft size={14} className="absolute top-4 left-4 text-gray-300 group-hover:text-blue-500 group-hover:-translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      {/* Quick info card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="font-bold text-lg mb-1">نظام إدارة المستشفى</h2>
        <p className="text-blue-100 text-sm leading-relaxed">
          يمكنك إدارة المرضى والمواعيد والغرف والصيدلية والمختبر والفواتير وحالات الطوارئ من خلال القائمة الجانبية.
          {isOfflineMode
            ? " أنت حالياً في الوضع التجريبي المحلي: بيانات غنية محفوظة على جهازك، ويمكن إضافة مرضى وحجز مواعيد فوراً."
            : " جميع البيانات المعروضة هنا حية من سيرفر النظام."}
        </p>
      </div>

      {/* Today's appointments preview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">مواعيد اليوم</h2>
          <Link to="/appointments" className="text-sm text-blue-600 hover:text-blue-700 font-medium">عرض الكل ←</Link>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
          {mock.appointments
            .filter((a) => a.date.slice(0, 10) === todayISO)
            .slice(0, 3)
            .map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{a.patientName}</p>
                  <p className="text-xs text-gray-500">{a.doctorName} — {a.doctorSpecialty}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  a.status === "SCHEDULED" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300" :
                  a.status === "COMPLETED" ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300" :
                  "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                }`}>
                  {a.status === "SCHEDULED" ? "مجدول" : a.status === "COMPLETED" ? "مكتمل" : "ملغي"}
                </span>
              </div>
            ))}
          {mock.appointments.filter((a) => a.date.slice(0, 10) === todayISO).length === 0 && (
            <p className="px-5 py-6 text-center text-sm text-gray-400">لا توجد مواعيد اليوم</p>
          )}
        </div>
      </div>
    </div>
  );
}
