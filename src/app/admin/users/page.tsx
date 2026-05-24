"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import type { Id } from "@/types/convex";

type User = {
  _id: Id<"users">;
  email: string;
  username: string;
  avatar: string;
  role: "user" | "admin";
  isBanned: boolean;
  createdAt: number;
};

export default function UsersPage() {
  // Queries and mutations
  const allUsers = useQuery(api.admin.listAllUsers) ?? [];
  const updateRole = useMutation(api.admin.updateUserRole);
  const banUser = useMutation(api.admin.banUser);
  const unbanUser = useMutation(api.admin.unbanUser);

  // Local state
  const [filter, setFilter] = useState<"all" | "active" | "banned" | "admins">("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter users
  const filteredUsers = allUsers.filter((u: User) => {
    if (filter === "active") return !u.isBanned;
    if (filter === "banned") return u.isBanned;
    if (filter === "admins") return u.role === "admin";
    return true;
  });

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Update role
  const handleRoleChange = async (userId: Id<"users">, newRole: "user" | "admin") => {
    setLoading(true);
    try {
      await updateRole({ userId, newRole });
      showMessage("success", `User role updated to ${newRole}`);
    } catch (err: any) {
      showMessage("error", err.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  // Ban user
  const handleBan = async (userId: Id<"users">) => {
    if (!confirm("Ban this user? They will not be able to log in.")) return;

    setLoading(true);
    try {
      await banUser({ userId });
      showMessage("success", "User banned");
    } catch (err: any) {
      showMessage("error", err.message || "Failed to ban user");
    } finally {
      setLoading(false);
    }
  };

  // Unban user
  const handleUnban = async (userId: Id<"users">) => {
    setLoading(true);
    try {
      await unbanUser({ userId });
      showMessage("success", "User unbanned");
    } catch (err: any) {
      showMessage("error", err.message || "Failed to unban user");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u: User) => !u.isBanned).length;
  const bannedUsers = allUsers.filter((u: User) => u.isBanned).length;
  const adminCount = allUsers.filter((u: User) => u.role === "admin").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts, roles, and permissions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
          <div className="text-sm text-gray-500">Active</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-red-600">{bannedUsers}</div>
          <div className="text-sm text-gray-500">Banned</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-blue-600">{adminCount}</div>
          <div className="text-sm text-gray-500">Admins</div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center justify-end">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">All Users</option>
          <option value="active">Active Only</option>
          <option value="banned">Banned Only</option>
          <option value="admins">Admins Only</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user: User) => (
                <tr key={user._id} className={user.isBanned ? "bg-red-50" : ""}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{user.avatar}</span>
                      <span className="font-medium text-gray-900">{user.username}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value as "user" | "admin")}
                      disabled={loading}
                      className="rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {user.isBanned ? (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
                        Banned
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {user.isBanned ? (
                      <button
                        onClick={() => handleUnban(user._id)}
                        disabled={loading}
                        className="rounded bg-green-500 px-3 py-1 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBan(user._id)}
                        disabled={loading}
                        className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                      >
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
