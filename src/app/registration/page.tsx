"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthModal } from "@/components/auth/AuthModal";

export default function RegistrationPage() {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Our Community</h1>
        <p className="text-gray-500">Create an account to share and discuss music</p>
      </div>
      
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} initialMode="register" />
      
      <p className="mt-8 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-[#D96A32] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
