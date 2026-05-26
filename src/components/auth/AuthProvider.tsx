"use client";

import { useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useRouter } from "next/navigation";

interface User {
  email: string;
  username: string;
  avatar: string;
  role: string;
  status: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Get stored user email
  const userEmail = typeof window !== "undefined" 
    ? localStorage.getItem("user_email") 
    : null;

  // Query current user from Convex
  const currentUser = useQuery(
    api.admin.getCurrentUser,
    userEmail ? { email: userEmail } : "skip"
  ) as User | null | undefined;

  // Handle logout
  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_data");
      localStorage.removeItem("isLoggedIn");
    }
    router.push("/");
    router.refresh();
  }, [router]);

  // Watch for user status changes - auto logout if disabled
  useEffect(() => {
    if (currentUser === undefined) return; // Still loading

    if (currentUser && currentUser.status === "disabled") {
      console.log("User account has been disabled, logging out...");
      handleLogout();
    }
  }, [currentUser, handleLogout]);

  return <>{children}</>;
}
