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
    const email = localStorage.getItem("user_email");
    if (email) {
      setCurrentUserEmail(email);
    }
  }, []);

  // Query employees
  const employeesResult = useQuery(
    api.admin.listEmployees,
    isClient && currentUserEmail ? { callerEmail: currentUserEmail } : "skip"
  );

  // Mutations
  const createEmployeeFn = useMutation(api.admin.createEmployee);
  const toggleUserStatusFn = useMutation(api.admin.toggleUserStatus);
  const updateUserRoleFn = useMutation(api.admin.updateUserRole);
  const deleteUserFn = useMutation(api.admin.deleteUser);

  // Listen for messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newUsername) {
      setMessage({ type: "error", text: "请填写邮箱和用户名" });
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
      setMessage({ type: "error", text: err.message || "创建失败" });
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
      setMessage({ type: "error", text: err.message || "操作失败" });
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
      setMessage({ type: "error", text: err.message || "操作失败" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("确定要删除该用户吗？此操作不可恢复。")) return;
    try {
      const result = await deleteUserFn({
        callerEmail: currentUserEmail,
        userId: userId as any,
      });
      setMessage({ type: "success", text: result.message });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "删除失败" });
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
  if (!isClient || !currentUserEmail) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">加载中...</p>
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
          <p className="mt-4 text-gray-500">加载中...</p>
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
          <h2 className="text-xl font-bold text-red-600 mb-2">权限不足</h2>
          <p className="text-gray-600 mb-4">{errorObj.message || "您没有权限访问此页面"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // Ensure employees is always an array
  const employees: Employee[] = Array.isArray(employeesResult) ? employeesResult : [];
  const activeCount = employees.filter(e => e.status === "active").length;
  const disabledCount = employees.filter(e => e.status === "disabled").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">员工管理</h1>
            <p className="text-gray-500 mt-1">
              共 {employees.length} 人 | 
              <span className="text-green-600"> 启用 {activeCount}</span> | 
              <span className="text-red-500"> 禁用 {disabledCount}</span>
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <span>+</span> 添加员工
          </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
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
                      <option value="super_admin">超级管理员</option>
                      <option value="operator">运营人员</option>
                      <option value="member">普通会员</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      employee.status === "active" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {employee.status === "active" ? "启用" : "禁用"}
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
                        {employee.status === "active" ? "禁用" : "启用"}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(employee._id)}
                        className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {employees.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              暂无员工数据
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">添加新员工</h2>
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名 *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">头像 URL（可选）</label>
                <input
                  type="url"
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="member">普通会员</option>
                  <option value="operator">运营人员</option>
                  <option value="super_admin">超级管理员</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
