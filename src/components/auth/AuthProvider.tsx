"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Handle logout
  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_data");
      localStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("adminLoggedIn");
    }
    router.push("/");
    router.refresh();
  }, [router]);

  return <>{children}</>;
}
