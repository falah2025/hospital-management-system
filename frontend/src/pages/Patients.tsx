import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Search, UserPlus, User } from "lucide-react";
import { Link } from "react-router-dom";

const genderLabel: Record<string, string> = {
  MALE: "ذكر",
  FEMALE: "أنثى",
  OTHER: "آخر",
};

export default function Patients() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["patients", page, search],
    queryFn: () =>
      api.get("/patients", { params: { page, limit: 20, ...(search ? { search } : {}) } }),
  });

  const patients = data?.data?.data || [];
  const meta = data?.data?.meta || { totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المرضى</h1>
          <p className="text-gray-500 dark:text-gray-400">قائمة المرضى المسجلين في النظام</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن مريض..."
              className="pr-9 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white w-56 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <UserPlus size={16} />
            إضافة مريض
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-10 text-center border border-gray-100 dark:border-gray-700">
          <User size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {search ? "لا توجد نتائج مطابقة للبحث" : "لا يوجد مرضى مسجلين بعد"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient: any) => (
              <Link
                key={patient.id}
                to={`/patients/${patient.id}`}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {patient.firstName?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-xs text-gray-500">رقم الملف: {patient.patientNumber}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${patient.gender === "FEMALE" ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600"}`}>
                    {genderLabel[patient.gender] || patient.gender}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  {patient.phoneNumber && <p>هاتف: {patient.phoneNumber}</p>}
                  {patient.bloodGroup && <p>فصيلة الدم: {patient.bloodGroup}</p>}
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 disabled:opacity-40 bg-white dark:bg-gray-800"
            >
              السابق
            </button>
            <span className="text-sm text-gray-500">
              صفحة {page} من {meta.totalPages || 1}
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 disabled:opacity-40 bg-white dark:bg-gray-800"
            >
              التالي
            </button>
          </div>
        </>
      )}
    </div>
  );
}
