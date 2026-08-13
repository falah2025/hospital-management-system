import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { api } from "../utils/api";
import { ArrowRight, User, Calendar, FileText, Pill } from "lucide-react";
import { Link } from "react-router-dom";

export default function PatientDetail() {
  const { id } = useParams();
  const isOfflineMode = useAuthStore((s) => s.isOfflineMode);
  const { data } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => api.get(`/patients/${id}`),
    enabled: !isOfflineMode,
    });

  const patient = data?.data;

  if (!patient) {
    if (isOfflineMode) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">أنت في الوضع المحلي (غير متصل بالسيرفر)</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">تفاصيل المريض متاحة فقط عند الاتصال بسيرفر النظام.</p>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/patients" className="hover:text-primary-600">المرضى</Link>
        <ArrowRight size={14} />
        <span>{patient.firstName} {patient.lastName}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <User size={32} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-gray-500">{patient.patientNumber}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              {patient.bloodGroup && (
                <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">
                  {patient.bloodGroup}
                </span>
              )}
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                {patient.gender === "MALE" ? "ذكر" : "أنثى"}
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} سنة
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard title="معلومات الاتصال" icon={User}>
          <InfoRow label="الهاتف" value={patient.phoneNumber || "-"} />
          <InfoRow label="البريد" value={patient.email || "-"} />
          <InfoRow label="العنوان" value={patient.address || "-"} />
          <InfoRow label="جهة الاتصال الطارئة" value={patient.emergencyContactName || "-"} />
          <InfoRow label="هاتف الطوارئ" value={patient.emergencyContactPhone || "-"} />
        </InfoCard>

        <InfoCard title="معلومات طبية" icon={FileText}>
          <InfoRow label="الحساسية" value={patient.allergies || "لا يوجد"} />
          <InfoRow label="الأمراض المزمنة" value={patient.chronicDiseases || "لا يوجد"} />
          <InfoRow label="شركة التأمين" value={patient.insuranceProvider || "-"} />
          <InfoRow label="رقم البوليصة" value={patient.insurancePolicyNumber || "-"} />
        </InfoCard>
      </div>

      <InfoCard title="المواعيد الأخيرة" icon={Calendar}>
        {patient.appointments?.length === 0 ? (
          <p className="text-gray-500 text-sm">لا يوجد مواعيد</p>
        ) : (
          <div className="space-y-2">
            {patient.appointments?.map((apt: any) => (
              <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{apt.type === "CONSULTATION" ? "استشارة" : "متابعة"}</p>
                  <p className="text-xs text-gray-500">
                    د. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  apt.status === "COMPLETED" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                }`}>
                  {apt.status === "COMPLETED" ? "مكتمل" : apt.status === "SCHEDULED" ? "مجدول" : apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </InfoCard>
    </div>
  );
}

function InfoCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-primary-600" />
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{value}</span>
    </div>
  );
}
