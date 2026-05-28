"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ALL_AVATARS } from "@/lib/avatars";

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar: string;
  createdAt: number;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setUsername("");
      setEmail("");
      setSelectedAvatar("");
      setError("");
      setVerificationCode("");
      setIsCodeSent(false);
      setIsVerifying(false);
      setIsSending(false);
      setCountdown(0);
      setIsEmailVerified(false);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const getUsers = (): UserData[] => {
    const stored = localStorage.getItem("hmc_users");
    return stored ? JSON.parse(stored) : [];
  };

  const saveUsers = (users: UserData[]) => {
    localStorage.setItem("hmc_users", JSON.stringify(users));
  };

  const handleSendCode = async () => {
    setError("");
    
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send verification code");
        return;
      }

      setIsCodeSent(true);
      setCountdown(60);
      setError("");
    } catch (err) {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    setError("");

    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: verificationCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid verification code");
        return;
      }

      setIsEmailVerified(true);
      setError("");
    } catch (err) {
      setError("Failed to verify code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogin = () => {
    setError("");
    
    if (!username.trim() && !email.trim()) {
      setError("Please enter your username or email");
      return;
    }

    const users = getUsers();
    const input = username.trim() || email.trim().toLowerCase();
    
    const user = users.find(u => 
      u.username.toLowerCase() === input.toLowerCase() || 
      u.email.toLowerCase() === input.toLowerCase()
    );
    
    if (!user) {
      setError("User not found. Please register first.");
      return;
    }

    localStorage.setItem("hmc_current_user", JSON.stringify(user));
    onClose();
    // Use setTimeout to allow the modal to close first, then refresh
    setTimeout(() => {
      router.refresh();
      window.location.reload();
    }, 100);
  };

  const handleRegister = () => {
    setError("");

    if (!username.trim() || username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!isEmailVerified) {
      setError("Please verify your email first");
      return;
    }

    if (!selectedAvatar) {
      setError("Please select an avatar");
      return;
    }

    const users = getUsers();
    
    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      setError("Username already taken");
      return;
    }

    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setError("Email already registered");
      return;
    }

    const newUser: UserData = {
      id: Date.now().toString(),
      username: username.trim(),
      email: email.trim(),
      avatar: selectedAvatar,
      createdAt: Date.now(),
    };

    users.push(newUser);
    saveUsers(users);
    localStorage.setItem("hmc_current_user", JSON.stringify(newUser));
    onClose();
    // Use setTimeout to allow the modal to close first, then refresh
    setTimeout(() => {
      router.refresh();
      window.location.reload();
    }, 100);
  };

  const renderAvatar = (avatar: typeof ALL_AVATARS[0], isSelected: boolean) => {
    const borderClass = isSelected
      ? "border-2 border-[#D96A32] bg-[#D96A32]/10 ring-2 ring-[#D96A32] ring-offset-1"
      : "border-2 border-gray-200 hover:border-gray-400";

    return (
      <div
        className={`flex aspect-square w-full items-center justify-center rounded-md ${borderClass}`}
        style={{ backgroundColor: avatar.color + "20" }}
        title={avatar.label}
      >
        <span className="text-2xl">{avatar.emoji}</span>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div ref={modalRef} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {mode === "login" ? (
          <>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Welcome Back</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-600">Username or Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-[#D96A32] focus:outline-none focus:ring-1 focus:ring-[#D96A32]"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleLogin}
                className="w-full rounded-md bg-[#D96A32] py-2 font-medium text-white transition hover:bg-[#c45a28]"
              >
                Sign In
              </button>
              <p className="text-center text-sm text-gray-500">
                New user?{" "}
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  className="text-[#D96A32] hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Join Our Community</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-600">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Create your username"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-[#D96A32] focus:outline-none focus:ring-1 focus:ring-[#D96A32]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsCodeSent(false);
                      setIsEmailVerified(false);
                    }}
                    placeholder="Enter your email"
                    className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-[#D96A32] focus:outline-none focus:ring-1 focus:ring-[#D96A32]"
                    disabled={isCodeSent && !isEmailVerified}
                  />
                  {!isCodeSent ? (
                    <button
                      onClick={handleSendCode}
                      disabled={isSending || !email.trim()}
                      className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                    >
                      {isSending ? "Sending..." : "Send Code"}
                    </button>
                  ) : !isEmailVerified ? (
                    <button
                      onClick={handleSendCode}
                      disabled={isSending || countdown > 0}
                      className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                    >
                      {countdown > 0 ? `${countdown}s` : "Resend"}
                    </button>
                  ) : (
                    <span className="flex items-center rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-700">
                      Verified
                    </span>
                  )}
                </div>
              </div>
              {isCodeSent && !isEmailVerified && (
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Verification Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-[#D96A32] focus:outline-none focus:ring-1 focus:ring-[#D96A32]"
                      maxLength={6}
                    />
                    <button
                      onClick={handleVerifyCode}
                      disabled={isVerifying || verificationCode.length !== 6}
                      className="rounded-md bg-[#D96A32] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#c45a28] disabled:opacity-50"
                    >
                      {isVerifying ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Check your email for the verification code
                  </p>
                </div>
              )}
              {isEmailVerified && (
                <div>
                  <label className="mb-2 block text-sm text-gray-600">Select Avatar</label>
                  <div className="grid grid-cols-5 gap-2">
                    {ALL_AVATARS.slice(0, 5).map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => setSelectedAvatar(avatar.id)}
                        className="aspect-square w-full cursor-pointer overflow-hidden rounded-md border-2 p-0 transition hover:border-gray-300"
                      >
                        {renderAvatar(avatar, selectedAvatar === avatar.id)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {ALL_AVATARS.slice(5, 10).map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => setSelectedAvatar(avatar.id)}
                        className="aspect-square w-full cursor-pointer overflow-hidden rounded-md border-2 p-0 transition hover:border-gray-300"
                      >
                        {renderAvatar(avatar, selectedAvatar === avatar.id)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {ALL_AVATARS.slice(10).map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => setSelectedAvatar(avatar.id)}
                        className="aspect-square w-full cursor-pointer overflow-hidden rounded-md border-2 p-0 transition hover:border-gray-300"
                      >
                        {renderAvatar(avatar, selectedAvatar === avatar.id)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleRegister}
                disabled={!isEmailVerified}
                className="w-full rounded-md bg-[#D96A32] py-2 font-medium text-white transition hover:bg-[#c45a28] disabled:bg-gray-300"
              >
                Create Account
              </button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className="text-[#D96A32] hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
