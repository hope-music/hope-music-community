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
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setUsername("");
      setEmail("");
      setSelectedAvatar("");
      setError("");
    }
  }, [isOpen, initialMode]);

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

  const handleLogin = () => {
    setError("");
    
    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }

    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    
    if (!user) {
      setError("User not found. Please register first.");
      return;
    }

    localStorage.setItem("hmc_current_user", JSON.stringify(user));
    onClose();
    router.refresh();
    window.location.reload();
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

    if (!selectedAvatar) {
      setError("Please select an avatar");
      return;
    }

    const users = getUsers();
    
    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      setError("Username already taken");
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
    router.refresh();
    window.location.reload();
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
                <label className="mb-1 block text-sm text-gray-600">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
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
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-[#D96A32] focus:outline-none focus:ring-1 focus:ring-[#D96A32]"
                />
              </div>
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
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleRegister}
                className="w-full rounded-md bg-[#D96A32] py-2 font-medium text-white transition hover:bg-[#c45a28]"
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
