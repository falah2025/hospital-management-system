import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { api } from "../utils/api";
import { useMockData, useMutateMockData } from "../hooks/useMockData";
import { CalendarDays, CalendarPlus, X, Plus, CheckCircle2, Clock, XCircle } from "lucide-react";

type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  SCHEDULED: { label: "مجدول", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300", icon: Clock },
  COMPLETED: { label: "مكتمل", color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle2 },
  CANCELLED: { label: "ملغي", color: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300", icon: XCircle },
};

const emptyForm = {
  patientName: "",
  doctorId: "",
  roomId: "",
  type: "CONSULTATION" as "CONSULTATION" | "FOLLOWUP",
  date: "",
  notes: "",
};

export default function Appointments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const isOfflineMode = useAuthStore((s) => s.isOfflineMode);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => api.get("/appointments"),
    refetchInterval: 60000,
    enabled: !isOfflineMode,
  });

  const mock = useMockData();
  const { addAppointment } = useMutateMockData();

  const isOnline = !isOfflineMode && data?.data?.data;
  const onlineAppointments: any[] = data?.data?.data || [];
  const offlineAppointments = mock.appointments.filter((a) => {
    const matchesSearch = !search || a.patientName.includes(search) || a.doctorName.includes(search);
    const matchesStatus = !statusFilter || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const appointments = isOnline ? onlineAppointments : offlineAppointments;

  const doctors = mock.doctors;
  const rooms = mock.rooms;
  const patients = mock.patients;

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doctor = doctors.find((d) => d.id === form.doctorId);
    if (!doctor || !form.patientName || !form.date) return;
    setSaving(true);
    setTimeout(() => {
      addAppointment({
        patientName: form.patientName,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        doctorSpecialty: doctor.specialty,
        type: form.type,
        date: new Date(form.date).toISOString(),
        status: "SCHEDULED",
        notes: form.notes || undefined,
      });
      setModalOpen(false);
      setForm(emptyForm);
      setSaving(false);
    }, 300);
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المواعيد</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isOnline ? `${onlineAppointments.length} موعد مسجل` : `${appointments.length} موعد — ${isOfflineMode ? "وضع تجريبي محلي" : "غير متصل"}`}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <CalendarPlus size={16} />
          حجز موعد
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <CalendarDays size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم المريض أو الطبيب..."
            className="w-full pr-9 pl-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 outline-none">
          <option value="">جميع الحالات</option>
          <option value="SCHEDULED">مجدول</option>
          <option value="COMPLETED">مكتمل</option>
          <option value="CANCELLED">ملغي</option>
        </select>
      </div>

      {isLoading && !isOfflineMode ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      ) : isOfflineMode || isError ? (
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{isOfflineMode ? "أنت في الوضع المحلي" : "تعذر الاتصال بالسيرفر"}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">يمكنك عرض مواعيد تجريبية وحجز مواعيد جديدة دون الاتصال بالسيرفر.</p>
        </div>
      ) : (
        <>
          {appointments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-700">
              <CalendarDays size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">{search ? "لا توجد نتائج مطابقة" : "لا توجد مواعيد — احجز موعدك الأول"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((a: any) => {
                const cfg = statusConfig[a.status as AppointmentStatus] || statusConfig.SCHEDULED;
                return (
                  <div key={a.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-3 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <span className="text-lg font-extrabold leading-none">{new Date(a.date).getDate()}</span>
                      <span className="text-[10px] font-medium">{new Date(a.date).toLocaleDateString("ar-EG", { month: "short" })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{a.patientName || `${a.patient?.firstName || ""} ${a.patient?.lastName || ""}`}</h3>
                        <span className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${cfg.color}`}>
                          <cfg.icon size={11} />{cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {a.doctorName || `${a.doctor?.user?.firstName || ""} ${a.doctor?.user?.lastName || "غير محدد"}`}
                        {a.doctorSpecialty ? ` — ${a.doctorSpecialty}` : ""}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {a.type === "FOLLOWUP" || a.type === "FOLLOW_UP" ? "متابعة" : "استشارة"} • {formatDate(a.date || a.appointmentDate)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Booking modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">حجز موعد جديد</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <label className="block">
                <span className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">المريض *</span>
                <select value={form.patientName} onChange={set("patientName")} required
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">اختر المريض...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={`${p.firstName} ${p.lastName}`}>{`${p.firstName} ${p.lastName} — ${p.patientNumber}`}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">الطبيب *</span>
                <select value={form.doctorId} onChange={set("doctorId")} required
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">اختر الطبيب...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{`${d.firstName} ${d.lastName} — ${d.specialty} ${d.status === "AVAILABLE" ? "(متاح)" : d.status === "BUSY" ? "(مشغول)" : "(خارج الدوام)"}`}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">الغرفة (اختياري)</span>
                <select value={form.roomId} onChange={set("roomId")}
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">بدون غرفة</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>غرفة {r.roomNumber} — {r.type === "PRIVATE" ? "خاصة" : r.type === "SHARED" ? "مشتركة" : r.type === "ICU" ? "عناية مركزة" : "طوارئ"} {r.status === "AVAILABLE" ? "(متاحة)" : ""}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">النوع</span>
                  <select value={form.type} onChange={set("type")}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="CONSULTATION">استشارة</option>
                    <option value="FOLLOWUP">متابعة</option>
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">التاريخ والوقت *</span>
                  <input type="datetime-local" value={form.date} onChange={set("date")} required
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </label>
              </div>
              <label className="block">
                <span className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">ملاحظات</span>
                <textarea value={form.notes} onChange={set("notes")} rows={2} placeholder="ملاحظات إضافية..."
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
              </label>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">إلغاء</button>
                <button type="submit" disabled={saving || !form.patientName || !form.doctorId || !form.date}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-medium disabled:opacity-50 shadow-md">
                  <Plus size={16} /> {saving ? "جاري الحجز..." : "تأكيد الحجز"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
