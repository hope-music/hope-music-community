"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ALL_AVATARS } from "@/lib/avatars";

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("hmc_current_user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("hmc_current_user");
    setCurrentUser(null);
    setIsOpen(false);
    router.refresh();
    window.location.reload();
  };

  if (!currentUser) {
    return (
      <Link
        href="/login"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
        title="Sign In"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </Link>
    );
  }

  const avatar = ALL_AVATARS.find(a => a.id === currentUser.avatar) || ALL_AVATARS[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 transition hover:bg-white/20"
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full text-sm"
          style={{ backgroundColor: avatar.color }}
        >
          <span>{avatar.emoji}</span>
        </div>
        <span className="max-w-[80px] truncate text-xs font-medium text-white">
          {currentUser.username}
        </span>
        <svg
          className={`h-3 w-3 text-white transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg bg-white py-1 shadow-lg">
          <div className="border-b border-gray-100 px-4 py-2">
            <p className="text-sm font-medium text-gray-900 truncate">{currentUser.username}</p>
            <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
          </div>
          <Link
            href="/community"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            My Profile
          </Link>
          <Link
            href="/community"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
          <hr className="my-1" />
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
