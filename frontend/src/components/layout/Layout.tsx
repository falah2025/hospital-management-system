import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { showToast } from "../../utils/mobile";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BedDouble,
  Pill,
  FlaskConical,
  CreditCard,
  AlertTriangle,
  Settings,
  LogOut,
  Stethoscope,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/patients", label: "المرضى", icon: Users },
  { to: "/appointments", label: "المواعيد", icon: CalendarDays },
  { to: "/rooms", label: "الغرف والأسرة", icon: BedDouble },
  { to: "/pharmacy", label: "الصيدلية", icon: Pill },
  { to: "/lab", label: "المختبر", icon: FlaskConical },
  { to: "/billing", label: "الفواتير", icon: CreditCard },
  { to: "/emergency", label: "الطوارئ", icon: AlertTriangle },
  { to: "/settings", label: "الإعدادات", icon: Settings },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast("تم تسجيل الخروج");
    navigate("/login");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
      isActive
        ? "bg-blue-600 text-white font-medium"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex" dir="rtl">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        } flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Stethoscope size={22} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">نظام إدارة المستشفى</h2>
            <p className="text-xs text-gray-500">Hospital Management</p>
          </div>
          <button
            className="lg:hidden mr-auto text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={navLinkClass}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
              {user?.firstName?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user ? `${user.firstName} ${user.lastName}` : "مستخدم"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <button
            className="lg:hidden text-gray-600 dark:text-gray-300"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <h1 className="font-semibold text-gray-800 dark:text-white">
            {navItems.find((n) => window.location.pathname.startsWith(n.to === "/" ? "" : n.to))?.label ||
              "نظام إدارة المستشفى"}
          </h1>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
