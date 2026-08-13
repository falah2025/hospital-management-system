import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { api } from "../utils/api";
import { useMockData, useMutateMockData } from "../hooks/useMockData";
import { Link } from "react-router-dom";
import { Search, UserPlus, User, X, Plus } from "lucide-react";

type PatientStatus = "INPATIENT" | "OUTPATIENT" | "EMERGENCY";

const statusConfig: Record<PatientStatus, { label: string; color: string; dot: string }> = {
  INPATIENT: { label: "مقيم", color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300", dot: "bg-indigo-500" },
  OUTPATIENT: { label: "مراجع", color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300", dot: "bg-green-500" },
  EMERGENCY: { label: "طوارئ", color: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300", dot: "bg-red-500" },
};

const genderLabel: Record<string, string> = { MALE: "ذكر", FEMALE: "أنثى" };

const emptyForm = {
  firstName: "", lastName: "", gender: "MALE" as const, dateOfBirth: "1990-01-01",
  bloodGroup: "A+", phoneNumber: "", email: "", address: "",
  emergencyContactName: "", emergencyContactPhone: "",
  allergies: "", chronicDiseases: "", insuranceProvider: "", insurancePolicyNumber: "",
  status: "OUTPATIENT" as PatientStatus,
};

export default function Patients() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const isOfflineMode = useAuthStore((s) => s.isOfflineMode);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["patients", page, search],
    queryFn: () =>
      api.get("/patients", { params: { page, limit: 20, ...(search ? { search } : {}) } }),
    enabled: !isOfflineMode,
  });

  const mock = useMockData();
  const { addPatient } = useMutateMockData();

  // Offline patients with search + filter
  const offlinePatients = mock.patients.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const matchesSearch = !search || fullName.includes(search.toLowerCase()) || p.patientNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isOnline = !isOfflineMode && data?.data?.data;
  const onlinePatients: any[] = data?.data?.data || [];
  const meta: any = data?.data?.meta || { totalPages: 1 };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      addPatient(form);
      setModalOpen(false);
      setForm(emptyForm);
      setSaving(false);
    }, 300);
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المرضى</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isOnline ? `${meta.totalRecords ?? onlinePatients.length} مريض مسجل` : `${offlinePatients.length} مريض (${mock.patients.length} إجمالي) — ${isOfflineMode ? "وضع تجريبي محلي" : "غير متصل"}`}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <UserPlus size={16} />
          إضافة مريض
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="بحث بالاسم أو رقم الملف..."
            className="w-full pr-9 pl-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 outline-none"
        >
          <option value="">جميع الحالات</option>
          <option value="INPATIENT">مقيم</option>
          <option value="OUTPATIENT">مراجع</option>
          <option value="EMERGENCY">طوارئ</option>
        </select>
      </div>

      {/* Loading / error / offline state */}
      {isLoading && !isOfflineMode ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : isOfflineMode || isError ? (
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{isOfflineMode ? "أنت في الوضع المحلي (غير متصل بالسيرفر)" : "تعذر الاتصال بالسيرفر"}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">بيانات المرضى متاحة فقط عند الاتصال بسيرفر النظام.</p>
        </div>
      ) : (
        <>
          {isOnline ? (
            /* Online list */
            onlinePatients.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-700">
                <User size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{search ? "لا توجد نتائج مطابقة للبحث" : "لا يوجد مرضى مسجلين بعد"}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {onlinePatients.map((patient: any) => (
                    <PatientCard key={patient.id} patient={patient} />
                  ))}
                </div>
                <Pagination page={page} totalPages={meta.totalPages || 1} setPage={setPage} />
              </>
            )
          ) : (
            /* Offline list (rich mock) */
            offlinePatients.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-700">
                <User size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{search ? "لا توجد نتائج مطابقة للبحث" : "لا يوجد مرضى"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offlinePatients.map((patient) => (
                  <Link
                    key={patient.id}
                    to={`/patients/${patient.id}`}
                    className="group bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shadow ${patient.gender === "FEMALE" ? "bg-gradient-to-br from-pink-400 to-rose-500" : "bg-gradient-to-br from-blue-400 to-blue-600"}`}>
                          {patient.firstName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{patient.firstName} {patient.lastName}</h3>
                          <p className="text-xs text-gray-500 font-mono">{patient.patientNumber}</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[patient.status].color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[patient.status].dot}`} />
                        {statusConfig[patient.status].label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-2">
                      {patient.phoneNumber && <p className="flex items-center gap-1">📞 {patient.phoneNumber}</p>}
                      {patient.bloodGroup && (
                        <span className="inline-flex px-2 py-0.5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 rounded text-[10px] font-bold">
                          {patient.bloodGroup}
                        </span>
                      )}
                      {patient.chronicDiseases && patient.chronicDiseases !== "لا يوجد" && (
                        <p className="truncate">⚕️ {patient.chronicDiseases}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Add patient modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4" onClick={() => setModalOpen(false)}>
          <div
            className="bg-white dark:bg-gray-800 w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">إضافة مريض جديد</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="الاسم الأول *" value={form.firstName} onChange={set("firstName")} required />
              <Input label="اسم العائلة *" value={form.lastName} onChange={set("lastName")} required />
              <Select label="الجنس" value={form.gender} onChange={set("gender")} options={[["MALE", "ذكر"], ["FEMALE", "أنثى"]]} />
              <Select label="فصيلة الدم" value={form.bloodGroup} onChange={set("bloodGroup")} options={[["A+", "A+"], ["A-", "A-"], ["B+", "B+"], ["B-", "B-"], ["AB+", "AB+"], ["AB-", "AB-"], ["O+", "O+"], ["O-", "O-"]]} />
              <Input label="تاريخ الميلاد" type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
              <Input label="الهاتف" value={form.phoneNumber} onChange={set("phoneNumber")} />
              <Input label="البريد الإلكتروني" value={form.email} onChange={set("email")} />
              <Select label="الحالة" value={form.status} onChange={set("status")} options={Object.entries(statusConfig).map(([k, v]) => [k, v.label])} />
              <Input label="اسم جهة الاتصال الطارئة" value={form.emergencyContactName} onChange={set("emergencyContactName")} />
              <Input label="هاتف الطوارئ" value={form.emergencyContactPhone} onChange={set("emergencyContactPhone")} />
              <Input label="العنوان" value={form.address} onChange={set("address")} className="sm:col-span-2" />
              <Input label="الحساسية" value={form.allergies} onChange={set("allergies")} placeholder="لا يوجد" />
              <Input label="الأمراض المزمنة" value={form.chronicDiseases} onChange={set("chronicDiseases")} placeholder="لا يوجد" />
              <Input label="شركة التأمين" value={form.insuranceProvider} onChange={set("insuranceProvider")} />
              <Input label="رقم البوليصة" value={form.insurancePolicyNumber} onChange={set("insurancePolicyNumber")} />
              <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                  إلغاء
                </button>
                <button type="submit" disabled={saving || !form.firstName || !form.lastName} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-md">
                  <Plus size={16} /> {saving ? "جاري الحفظ..." : "حفظ المريض"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder, className = "" }: any) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</span>
      <input
        type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</span>
      <select value={value} onChange={onChange} className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
        {options.map(([v, lbl]: string[]) => <option key={v} value={v}>{lbl}</option>)}
      </select>
    </label>
  );
}

function PatientCard({ patient }: { patient: any }) {
  const cfg = statusConfig[patient.status as PatientStatus] || statusConfig.OUTPATIENT;
  return (
    <Link to={`/patients/${patient.id}`} className="group bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shadow ${patient.gender === "FEMALE" ? "bg-gradient-to-br from-pink-400 to-rose-500" : "bg-gradient-to-br from-blue-400 to-blue-600"}`}>
            {patient.firstName?.charAt(0) || "?"}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{patient.firstName} {patient.lastName}</h3>
            <p className="text-xs text-gray-500 font-mono">{patient.patientNumber}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
        </span>
      </div>
      <div className="text-xs text-gray-500 space-y-1 mt-2">
        {patient.phoneNumber && <p>{genderLabel[patient.gender] || patient.gender} • هاتف: {patient.phoneNumber}</p>}
        {patient.bloodGroup && <span className="inline-flex px-2 py-0.5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 rounded text-[10px] font-bold">{patient.bloodGroup}</span>}
      </div>
    </Link>
  );
}

function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3">
      <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 disabled:opacity-40 bg-white dark:bg-gray-800">السابق</button>
      <span className="text-sm text-gray-500">صفحة {page} من {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 disabled:opacity-40 bg-white dark:bg-gray-800">التالي</button>
    </div>
  );
}
