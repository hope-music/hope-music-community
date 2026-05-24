"use client";

import { useState, useEffect, useRef } from "react";
import { CHARACTER_AVATARS, INSTRUMENT_AVATARS, type AvatarConfig } from "@/lib/avatars";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (email: string) => void;
  onRegister?: (data: { email: string; username: string; avatar: string }) => void;
}

export function AuthModal({ isOpen, onClose, onLogin, onRegister }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [error, setError] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode("login");
      setEmail("");
      setUsername("");
      setSelectedAvatar("");
      setError("");
    }
  }, [isOpen]);

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

  const handleLogin = () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    if (onLogin) {
      onLogin(email);
    }
    onClose();
  };

  const handleRegister = () => {
    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!email) {
      setError("Please enter your email");
      return;
    }
    if (!selectedAvatar) {
      setError("Please select an avatar");
      return;
    }
    if (onRegister) {
      onRegister({ email, username, avatar: selectedAvatar });
    }
    onClose();
  };

  const renderAvatar = (avatar: AvatarConfig, isSelected: boolean) => {
    const borderClass = isSelected
      ? "border-2 border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-offset-1"
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
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      >
        {mode === "login" ? (
          <>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Sign In
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleLogin}
                className="w-full rounded-md bg-blue-500 py-2 font-medium text-white transition hover:bg-blue-600"
              >
                Sign In
              </button>
              <p className="text-center text-sm text-gray-500">
                New user?{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="text-blue-500 hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Sign Up</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-600">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Create your username"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-600">Select Avatar</label>
                <div className="grid grid-cols-5 gap-2">
                  {CHARACTER_AVATARS.slice(0, 5).map((avatar) => (
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
                  {CHARACTER_AVATARS.slice(5, 10).map((avatar) => (
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
                  {INSTRUMENT_AVATARS.map((avatar) => (
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
                className="w-full rounded-md bg-green-500 py-2 font-medium text-white transition hover:bg-green-600"
              >
                Create Account
              </button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-blue-500 hover:underline"
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
