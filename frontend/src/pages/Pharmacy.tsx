import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";
import { Pill, Search, AlertTriangle, Package } from "lucide-react";

export default function Pharmacy() {
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["medicines", search, showLowStock],
    queryFn: () => api.get(`/pharmacy/medicines?search=${search}&lowStock=${showLowStock}`),
  });

  const medicines = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الصيدلية</h1>
          <p className="text-gray-500 dark:text-gray-400">مخزون الأدوية والوصفات</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث عن دواء..."
            className="w-full pr-10 pl-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <button
          onClick={() => setShowLowStock(!showLowStock)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            showLowStock
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
          }`}
        >
          <AlertTriangle size={16} />
          <span>مخزون منخفض</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">الدواء</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">الكمية</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">الحد الأدنى</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">السعر</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">جاري التحميل...</td></tr>
              ) : medicines.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">لا يوجد أدوية</td></tr>
              ) : (
                medicines.map((med: any) => (
                  <tr key={med.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                          <Pill size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{med.name}</p>
                          <p className="text-xs text-gray-500">{med.genericName || med.category || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{med.stockQuantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{med.reorderLevel}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">${med.unitPrice}</td>
                    <td className="px-6 py-4">
                      {med.stockQuantity <= med.reorderLevel ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium">
                          <AlertTriangle size={12} />
                          منخفض
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-medium">
                          <Package size={12} />
                          متوفر
                        </span>
                      )}
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
