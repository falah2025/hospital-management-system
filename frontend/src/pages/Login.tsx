import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api } from "../utils/api";
import { useAuthStore } from "../stores/authStore";
import { Loader2, Stethoscope } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post("/auth/login", credentials);
      return data;
    },
    onSuccess: (data) => {
      const roles = data.data.user.roles?.map((r: any) =>
        typeof r.role === "string" ? r.role : r.role?.name
      ) || [];
      setAuth(
        {
          id: data.data.user.id,
          email: data.data.user.email,
          firstName: data.data.user.firstName,
          lastName: data.data.user.lastName,
          roles,
        },
        data.data.token
      );
      navigate("/");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "فشل تسجيل الدخول، تحقق من البيانات");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/40 rounded-full mb-4">
            <Stethoscope size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">نظام إدارة المستشفى</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Hospital Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="admin@hospital.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loginMutation.isPending && <Loader2 size={18} className="animate-spin" />}
            تسجيل الدخول
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          نظام متكامل لإدارة المستشفى — الإصدار 1.0
        </p>
      </div>
    </div>
  );
}
