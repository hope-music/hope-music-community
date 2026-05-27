"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthModal } from "@/components/auth/AuthModal";

export default function LoginPage() {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-500">Sign in to join the Hope Music Community</p>
      </div>
      
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} initialMode="login" />
      
      <p className="mt-8 text-center text-sm text-gray-500">
        New to Hope Music Community?{" "}
        <Link href="/registration" className="text-[#D96A32] hover:underline font-medium">
          Create an account
        </Link>
      </p>
    </div>
  );
}
