import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";
import { BedDouble, Users, CheckCircle, AlertCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  AVAILABLE: { label: "متاح", color: "bg-green-50 text-green-600", icon: CheckCircle },
  OCCUPIED: { label: "مشغول", color: "bg-red-50 text-red-600", icon: Users },
  CLEANING: { label: "تنظيف", color: "bg-yellow-50 text-yellow-600", icon: AlertCircle },
  MAINTENANCE: { label: "صيانة", color: "bg-gray-50 text-gray-600", icon: AlertCircle },
};

export default function Rooms() {
  const { data, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => api.get("/rooms"),
  });

  const rooms = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الغرف والأسرة</h1>
        <p className="text-gray-500 dark:text-gray-400">حالة الغرف والأسرة في الوقت الفعلي</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["AVAILABLE", "OCCUPIED", "CLEANING", "MAINTENANCE"].map((status) => {
          const count = rooms.reduce((acc: number, room: any) =>
            acc + room.beds.filter((b: any) => b.status === status).length, 0
          );
          const config = statusConfig[status];
          return (
            <div key={status} className={`p-4 rounded-xl ${config.color}`}>
              <div className="flex items-center gap-2">
                <config.icon size={20} />
                <span className="font-bold text-2xl">{count}</span>
              </div>
              <p className="text-sm mt-1">{config.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room: any) => (
          <div key={room.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">غرفة {room.roomNumber}</h3>
                <p className="text-xs text-gray-500">{room.department?.name || "بدون قسم"}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                room.status === "AVAILABLE" ? "bg-green-50 text-green-600" :
                room.status === "OCCUPIED" ? "bg-red-50 text-red-600" :
                "bg-yellow-50 text-yellow-600"
              }`}>
                {room.status === "AVAILABLE" ? "متاحة" :
                 room.status === "OCCUPIED" ? "مشغولة" :
                 room.status === "CLEANING" ? "تنظيف" : "صيانة"}
              </span>
            </div>
            <div className="space-y-2">
              {room.beds.map((bed: any) => (
                <div key={bed.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BedDouble size={16} className={
                      bed.status === "AVAILABLE" ? "text-green-500" :
                      bed.status === "OCCUPIED" ? "text-red-500" : "text-yellow-500"
                    } />
                    <span className="text-sm">سرير {bed.bedNumber}</span>
                  </div>
                  {bed.occupancies?.[0]?.patient && (
                    <span className="text-xs text-gray-500">
                      {bed.occupancies[0].patient.firstName} {bed.occupancies[0].patient.lastName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
