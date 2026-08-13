import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { api } from "../utils/api";
import { useMockData } from "../hooks/useMockData";
import { AlertTriangle, Clock, Activity, UserPlus } from "lucide-react";

const triageConfig: Record<string, { label: string; color: string; priority: number }> = {
  LEVEL_1: { label: "إنعاش - فوري", color: "bg-red-600 text-white", priority: 1 },
  LEVEL_2: { label: "طارئ - 10 دق", color: "bg-orange-500 text-white", priority: 2 },
  LEVEL_3: { label: "عاجل - 30 دق", color: "bg-yellow-500 text-white", priority: 3 },
  LEVEL_4: { label: "أقل عجلة - 60 دق", color: "bg-green-500 text-white", priority: 4 },
  LEVEL_5: { label: "غير طارئ - 120 دق", color: "bg-blue-500 text-white", priority: 5 },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  WAITING: { label: "في الانتظار", color: "bg-yellow-50 text-yellow-600" },
  IN_TREATMENT: { label: "قيد العلاج", color: "bg-blue-50 text-blue-600" },
  UNDER_OBSERVATION: { label: "تحت المراقبة", color: "bg-purple-50 text-purple-600" },
  ADMITTED: { label: "تم الإدخال", color: "bg-green-50 text-green-600" },
  DISCHARGED: { label: "تم الخروج", color: "bg-gray-50 text-gray-600" },
};

export default function Emergency() {
  const [status, setStatus] = useState("");

    const isOfflineMode = useAuthStore((s) => s.isOfflineMode);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["emergency", status],
    queryFn: () => api.get(`/emergency?status=${status}`),
    enabled: !isOfflineMode,
    });

  const mock = useMockData();
  const isOnline = !isOfflineMode && data?.data?.data;
  const visits = isOnline ? (data?.data?.data || []) : mock.emergencyVisits;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            قسم الطوارئ
          </h1>
          <p className="text-gray-500 dark:text-gray-400">إدارة حالات الطوارئ والتصنيف</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
          <UserPlus size={18} />
          <span>حالة طارئة جديدة</span>
        </button>
      </div>

      <div className="flex gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">جميع الحالات</option>
          <option value="WAITING">في الانتظار</option>
          <option value="IN_TREATMENT">قيد العلاج</option>
          <option value="UNDER_OBSERVATION">تحت المراقبة</option>
          <option value="ADMITTED">تم الإدخال</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading && !isOfflineMode ? (
          <div className="col-span-2 flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : visits.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-500">
            لا يوجد حالات طوارئ نشطة
          </div>
        ) : (
          visits.map((visit: any) => (
            <div key={visit.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${triageConfig[visit.triageLevel]?.color}`}>
                      {triageConfig[visit.triageLevel]?.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${statusConfig[visit.status]?.color}`}>
                      {statusConfig[visit.status]?.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mt-2">
                    {visit.patientName || visit.patient ? `${visit.patientName || `${visit.patient.firstName} ${visit.patient.lastName}`}` : "مريض مجهول"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{visit.chiefComplaint}</p>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    {new Date(visit.arrivalTime).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>

              {visit.vitalSigns && (
                <div className="grid grid-cols-3 gap-2 mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {visit.vitalSigns.temperature && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500">حرارة</p>
                      <p className="font-semibold text-sm">{visit.vitalSigns.temperature}°C</p>
                    </div>
                  )}
                  {visit.vitalSigns.bloodPressure && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500">ضغط</p>
                      <p className="font-semibold text-sm">{visit.vitalSigns.bloodPressure}</p>
                    </div>
                  )}
                  {visit.vitalSigns.heartRate && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500">نبض</p>
                      <p className="font-semibold text-sm">{visit.vitalSigns.heartRate}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition">
                  تحديث الحالة
                </button>
                <button className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition">
                  إدخال المريض
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
