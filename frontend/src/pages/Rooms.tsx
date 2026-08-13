import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { api } from "../utils/api";
import { useMockData } from "../hooks/useMockData";
import { BedDouble, Users, CheckCircle, AlertCircle, Wrench } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  AVAILABLE: { label: "متاحة", color: "text-green-600 dark:text-green-300", bg: "bg-green-50 dark:bg-green-900/30", icon: CheckCircle },
  OCCUPIED: { label: "مشغولة", color: "text-red-600 dark:text-red-300", bg: "bg-red-50 dark:bg-red-900/30", icon: Users },
  CLEANING: { label: "تنظيف", color: "text-amber-600 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-900/30", icon: AlertCircle },
  MAINTENANCE: { label: "صيانة", color: "text-gray-600 dark:text-gray-300", bg: "bg-gray-100 dark:bg-gray-700", icon: Wrench },
};

const typeLabels: Record<string, string> = {
  PRIVATE: "خاصة", SHARED: "مشتركة", ICU: "عناية مركزة", EMERGENCY: "طوارئ",
};

export default function Rooms() {
  const isOfflineMode = useAuthStore((s) => s.isOfflineMode);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => api.get("/rooms"),
    enabled: !isOfflineMode,
  });

  const mock = useMockData();
  const isOnline = !isOfflineMode && data?.data?.data;

  const onlineRooms: any[] = data?.data?.data || [];
  const offlineRooms = mock.rooms;
  const rooms = isOnline ? onlineRooms : offlineRooms;

  const totalBeds = rooms.reduce((s: number, r: any) => s + (r.beds || 1), 0);
  const occupiedBeds = isOnline
    ? rooms.reduce((s: number, r: any) => s + r.beds.filter((b: any) => b.status === "OCCUPIED").length, 0)
    : rooms.reduce((s: number, r: any) => s + (r.occupied || 0), 0);
  const occupancyRate = totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الغرف والأسرة</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {rooms.length} غرفة • نسبة الإشغال {occupancyRate}% — {isOfflineMode ? "وضع تجريبي محلي" : "بيانات حية من النظام"}
        </p>
      </div>

      {/* Occupancy bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">إشغال الأسرة</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{occupiedBeds} / {totalBeds}</p>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-orange-500 to-rose-500 rounded-full transition-all"
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>

      {isLoading && !isOfflineMode ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-700">
          <BedDouble size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">لا توجد غرف مسجلة بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room: any) => {
            const cfg = statusConfig[room.status] || statusConfig.AVAILABLE;
            const beds = isOnline ? room.beds?.length || 0 : room.beds || 0;
            const occupied = isOnline
              ? room.beds?.filter((b: any) => b.status === "OCCUPIED").length || 0
              : room.occupied || 0;
            return (
              <div key={room.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">غرفة {room.roomNumber}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{typeLabels[room.type] || room.type || ""} {room.floor ? `• الطابق ${room.floor}` : ""}</p>
                  </div>
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                    <cfg.icon size={13} />{cfg.label}
                  </span>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: beds || 1 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BedDouble size={15} className={i < occupied ? "text-red-500" : "text-green-500"} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">سرير {i + 1}</span>
                      </div>
                      <span className={`text-[11px] font-medium ${i < occupied ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                        {i < occupied ? "مشغول" : "متاح"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
