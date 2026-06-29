"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";

interface Employee {
  _id: string;
  email: string;
  username: string;
  avatar: string;
  role: "super_admin" | "operator" | "member";
  status: "active" | "disabled";
  createdAt: number;
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-red-100 text-red-700",
  operator: "bg-blue-100 text-blue-700",
  member: "bg-gray-100 text-gray-700",
};

export default function EmployeesPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [newRole, setNewRole] = useState<"super_admin" | "operator" | "member">("member");

  // Client-side check
  useEffect(() => {
    setIsClient(true);
    // Check admin login status from sessionStorage
    const loggedIn = sessionStorage.getItem("adminLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    // Also get user email from localStorage
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserEmail(user.email);
      } catch (e) {
        // ignore parse errors
      }
    }
  }, []);

  // Query employees
  const employeesResult = useQuery(
    api.admin.listEmployees,
    isClient && isLoggedIn && currentUserEmail ? { callerEmail: currentUserEmail } : "skip"
  );

  // Mutations
  const createEmployeeFn = useMutation(api.admin.createEmployee);
  const toggleUserStatusFn = useMutation(api.admin.toggleUserStatus);
  const updateUserRoleFn = useMutation(api.admin.updateUserRole);
  const deleteUserFn = useMutation(api.admin.deleteUser);// Listen for messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Redirect if not logged in
  useEffect(() => {
    if (isClient && !isLoggedIn) {
      router.push("/admin/login");
    }
  }, [isClient, isLoggedIn, router]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newUsername) {
      setMessage({ type: "error", text: "Please fill in email and username" });
      return;
    }

    try {
      const result = await createEmployeeFn({
        callerEmail: currentUserEmail,
        email: newEmail,
        username: newUsername,
        avatar: newAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUsername}`,
        role: newRole,
      });
      setMessage({ type: "success", text: result.message });
      setShowCreateModal(false);
      setNewEmail("");
      setNewUsername("");
      setNewAvatar("");
      setNewRole("member");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create" });
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const result = await toggleUserStatusFn({
        callerEmail: currentUserEmail,
        userId: userId as any,
      });
      setMessage({ type: "success", text: result.message });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Operation failed" });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: "super_admin" | "operator" | "member") => {
    try {
      const result = await updateUserRoleFn({
        callerEmail: currentUserEmail,
        userId: userId as any,
        newRole,
      });
      setMessage({ type: "success", text: result.message });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Operation failed" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      const result = await deleteUserFn({
        callerEmail: currentUserEmail,
        userId: userId as any,
      });
      setMessage({ type: "success", text: result.message });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Delete failed" });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Show loading if not client-side yet
  if (!isClient || !isLoggedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle Convex query result
  if (employeesResult === undefined || employeesResult === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if it's an error object
  if (typeof employeesResult === "object" && !Array.isArray(employeesResult)) {
    const errorObj = employeesResult as { message?: string };
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{errorObj.message || "You do not have permission to access this page"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const employees: Employee[] = Array.isArray(employeesResult) ? employeesResult : [];
  const activeCount = employees.filter(e => e.status === "active").length;
  const disabledCount = employees.filter(e => e.status === "disabled").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-500 mt-1">
              Manage employees ({employees.length} total)
              <span className="text-green-600"> | Active {activeCount}</span>
              <span className="text-red-500"> | Disabled {disabledCount}</span>
            </p>
          </div>
          <div className="flex items-center gap-2"><button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <span>+</span> New Employee
          </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message.text}
          </div>
        )}

        {/* Employee List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={employee.avatar}
                        alt={employee.username}
                        className="w-10 h-10 rounded-full bg-gray-200"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{employee.username}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={employee.role}
                      onChange={(e) => handleUpdateRole(employee._id, e.target.value as any)}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 ${ROLE_COLORS[employee.role] || ROLE_COLORS.member}`}
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="operator">Operator</option>
                      <option value="member">Member</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      employee.status === "active" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {employee.status === "active" ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(employee.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(employee._id)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          employee.status === "active"
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {employee.status === "active" ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(employee._id)}
                        className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {employees.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No employees found
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Employee</h2>
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="employee@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL (optional)</label>
                <input
                  type="url"
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as "super_admin" | "operator" | "member")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="member">Member</option>
                  <option value="operator">Operator</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
