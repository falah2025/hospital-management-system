import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { to: "/", label: "الرئيسية", short: "الرئيسية", icon: LayoutDashboard },
  { to: "/patients", label: "المرضى", short: "المرضى", icon: Users },
  { to: "/appointments", label: "المواعيد", short: "المواعيد", icon: CalendarDays },
  { to: "/rooms", label: "الغرف والأسرة", short: "الغرف", icon: BedDouble },
  { to: "/pharmacy", label: "الصيدلية", short: "الصيدلية", icon: Pill },
  { to: "/lab", label: "المختبر", short: "المختبر", icon: FlaskConical },
  { to: "/billing", label: "الفواتير", short: "الفواتير", icon: CreditCard },
  { to: "/emergency", label: "الطوارئ", short: "الطوارئ", icon: AlertTriangle },
  { to: "/settings", label: "الإعدادات", short: "الإعدادات", icon: Settings },
];

// Compact bottom bar on mobile (max 5 items)
const bottomBarItems = [
  { to: "/", label: "الرئيسية", icon: LayoutDashboard },
  { to: "/patients", label: "المرضى", icon: Users },
  { to: "/appointments", label: "المواعيد", icon: CalendarDays },
  { to: "/rooms", label: "الغرف", icon: BedDouble },
  { to: "/pharmacy", label: "الصيدلية", icon: Pill },
];

export default function Layout() {
  const { user, logout, isOfflineMode } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast("تم تسجيل الخروج");
    navigate("/login");
  };

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
      isActive
        ? "bg-gradient-to-l from-blue-600 to-blue-700 text-white font-medium shadow"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
    }`;

  const bottomLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 text-[11px] transition-colors ${
      isActive
        ? "text-blue-600 dark:text-blue-400 font-bold"
        : "text-gray-500 dark:text-gray-400"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex" dir="rtl">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        } flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 bg-gradient-to-l from-blue-600 to-indigo-700 rounded-b-2xl shadow-sm">
          <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur">
            <Stethoscope size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-white text-sm">نظام إدارة المستشفى</h2>
            <p className="text-[11px] text-blue-100">Hospital Management</p>
          </div>
          <button
            className="lg:hidden text-white/80 p-1"
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

        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40">
          {isOfflineMode && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 mb-2 mx-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[11px] font-medium rounded-lg border border-amber-200 dark:border-amber-800">
              <Activity size={12} /> الوضع المحلي — بيانات تجريبية
            </div>
          )}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
              {user?.firstName?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user ? `${user.firstName} ${user.lastName}` : "مستخدم"}
              </p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
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
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/85 dark:bg-gray-800/85 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <h1 className="font-semibold text-gray-800 dark:text-white">
            {navItems.find((n) => location.pathname.startsWith(n.to === "/" ? "" : n.to))?.label ||
              "نظام إدارة المستشفى"}
          </h1>
          {isOfflineMode && (
            <span className="lg:hidden mr-auto flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[11px] font-medium rounded-full border border-amber-200 dark:border-amber-800">
              <Activity size={11} /> محلي
            </span>
          )}
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>

        {/* Mobile bottom navigation */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/90 dark:bg-gray-800/95 backdrop-blur border-t border-gray-200 dark:border-gray-700 safe-bottom">
          <div className="flex">
            {bottomBarItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className={bottomLinkClass}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <NavLink to="/emergency" className={bottomLinkClass}>
              <AlertTriangle size={20} />
              <span>المزيد</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </div>
  );
}
