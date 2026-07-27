import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { Moon, Sun, Bell, Shield, Database, Smartphone } from "lucide-react";

export default function Settings() {
  const { user } = useAuthStore();
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));
  const [notifications, setNotifications] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الإعدادات</h1>
        <p className="text-gray-500 dark:text-gray-400">تخصيص إعدادات التطبيق</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Smartphone size={20} />
            إعدادات المظهر
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <SettingRow
            icon={darkMode ? Moon : Sun}
            title="الوضع الداكن"
            description="تفعيل الوضع الداكن للتطبيق"
            action={
              <button
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full transition-colors ${darkMode ? "bg-primary-600" : "bg-gray-300"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            }
          />
          <SettingRow
            icon={Bell}
            title="الإشعارات"
            description="تفعيل إشعارات التطبيق"
            action={
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors ${notifications ? "bg-primary-600" : "bg-gray-300"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            }
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield size={20} />
            معلومات الحساب
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">الاسم</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">البريد الإلكتروني</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">الأدوار</span>
            <div className="flex gap-1">
              {user?.roles.map((role: string) => (
                <span key={role} className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-xs">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Database size={20} />
            عن التطبيق
          </h2>
        </div>
        <div className="p-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>نظام إدارة المستشفى (HMS)</p>
          <p>الإصدار: 1.0.0</p>
          <p>© 2024 جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, title, description, action }: any) {
  return (
    <div className="flex items-center justify-between p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
          <Icon size={20} className="text-gray-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
