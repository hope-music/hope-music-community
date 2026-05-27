"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";

const BASE_NAV_ITEMS = [
  { label: "Performance", href: "/admin/productions" },
  { label: "Stage Production", href: "/admin/stage-production" },
  { label: "Hope Studio", href: "/admin/hope-studio" },
  { label: "Interaction", href: "/admin/interaction" },
  { label: "News", href: "/admin/news" },
  { label: "Community", href: "/admin/community" },
  { label: "Users", href: "/admin/users" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Get current user
  const currentUser = useQuery(
    api.admin.getCurrentUser,
    userEmail ? { email: userEmail } : "skip"
  ) as { email: string; username: string; role: string; status: string } | null | undefined;

  useEffect(() => {
    setMounted(true);
    const email = localStorage.getItem("user_email");
    setUserEmail(email);
  }, []);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!mounted) return;
    if (isLoginPage) return;
    
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("adminLoggedIn") === "true";
    if (!isLoggedIn) {
      router.push("/admin/login");
    }
  }, [mounted, isLoginPage, router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_data");
    sessionStorage.removeItem("adminLoggedIn");
    router.push("/admin/login");
  };

  if (!mounted) {
    return null;
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("adminLoggedIn") === "true";
  const isSuperAdmin = currentUser && typeof currentUser === "object" && currentUser.role === "super_admin";

  // Build navigation items based on role
  const navItems = [...BASE_NAV_ITEMS];
  if (isSuperAdmin) {
    navItems.push({ label: "员工管理", href: "/admin/employees" });
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin/dashboard" className="text-xl font-bold text-gray-900">
                Admin Panel
              </Link>
              <nav className="flex gap-1">
                {BASE_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === item.href
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {/* Only show Employee Management for Super Admin */}
                {isSuperAdmin && (
                  <Link
                    href="/admin/employees"
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === "/admin/employees"
                        ? "bg-red-100 text-red-700"
                        : "text-red-600 hover:text-red-700 hover:bg-red-50"
                    }`}
                  >
                    员工管理
                  </Link>
                )}
                <Link
                  href="/admin/dashboard"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === "/admin/dashboard"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Dashboard
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {currentUser && currentUser !== null && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-full bg-gray-200"
                  />
                  <span>{currentUser.username}</span>
                  {isSuperAdmin && (
                    <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">管理员</span>
                  )}
                </div>
              )}
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
