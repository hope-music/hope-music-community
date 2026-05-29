"use client";

import { useState } from "react";

interface ViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ViolationAction) => void;
  targetType: "post" | "comment";
  targetTitle: string;
  targetAuthor: string;
  targetAuthorEmail?: string;
  loading?: boolean;
}

export interface ViolationAction {
  action: "delete" | "hide";
  banUser: boolean;
  banDuration: "1day" | "7days" | "permanent" | null;
  reason: "spam" | "harassment" | "advertising" | "other";
  reasonDetail?: string;
  managedBy: string;
}

const REASON_OPTIONS = [
  { value: "spam", label: "Spam", description: "Flooding, repetitive posts" },
  { value: "harassment", label: "Harassment", description: "Personal attacks, abuse" },
  { value: "advertising", label: "Advertising", description: "Spam ads, promotion links" },
  { value: "other", label: "Other", description: "Other violations" },
];

const BAN_DURATIONS = [
  { value: "1day", label: "1 Day" },
  { value: "7days", label: "7 Days" },
  { value: "permanent", label: "Permanent" },
];

export function ViolationModal({
  isOpen,
  onClose,
  onConfirm,
  targetType,
  targetTitle,
  targetAuthor,
  targetAuthorEmail,
  loading = false,
}: ViolationModalProps) {
  const [action, setAction] = useState<"delete" | "hide">("delete");
  const [reason, setReason] = useState<"spam" | "harassment" | "advertising" | "other">("spam");
  const [reasonDetail, setReasonDetail] = useState("");
  const [banUser, setBanUser] = useState(false);
  const [banDuration, setBanDuration] = useState<"1day" | "7days" | "permanent">("7days");
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    const adminEmail = localStorage.getItem("user_email") || "unknown";
    onConfirm({
      action,
      banUser,
      banDuration: banUser ? banDuration : null,
      reason,
      reasonDetail: reasonDetail.trim() || undefined,
      managedBy: adminEmail,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Handle Violation
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3 space-y-4 overflow-y-auto flex-1">
          {/* Target Info */}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Target {targetType}
            </div>
            <div className="font-medium text-gray-900 text-sm truncate">{targetTitle}</div>
            <div className="text-xs text-gray-500 mt-1">
              by {targetAuthor}
              {targetAuthorEmail && <span className="ml-1">({targetAuthorEmail})</span>}
            </div>
          </div>

          {/* Content Handling */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Action</label>
            <div className="space-y-1">
              <label className="flex items-start gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="action"
                  value="delete"
                  checked={action === "delete"}
                  onChange={() => setAction("delete")}
                  className="mt-0.5 h-4 w-4 text-red-600"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">Delete</div>
                  <div className="text-xs text-gray-500">Permanently remove</div>
                </div>
              </label>
              <label className="flex items-start gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="action"
                  value="hide"
                  checked={action === "hide"}
                  onChange={() => setAction("hide")}
                  className="mt-0.5 h-4 w-4 text-yellow-600"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">Hide</div>
                  <div className="text-xs text-gray-500">Only visible to admins</div>
                </div>
              </label>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Violation Reason</label>
            <div className="grid grid-cols-2 gap-1">
              {REASON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReason(opt.value as any)}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    reason === opt.value
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className={`text-xs font-medium ${
                    reason === opt.value ? "text-red-700" : "text-gray-900"
                  }`}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-tight">{opt.description}</div>
                </button>
              ))}
            </div>
            {(reason === "other" || reasonDetail) && (
              <textarea
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                placeholder="Specify reason..."
                rows={2}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            )}
          </div>

          {/* User Punishment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Punishment</label>
            <div className="rounded-lg border border-gray-200 p-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={banUser}
                  onChange={(e) => setBanUser(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600"
                />
                <div className="text-sm text-gray-900">Ban this user</div>
              </label>

              {banUser && (
                <div className="mt-2 pl-6">
                  <div className="text-xs text-gray-500 mb-1">Duration</div>
                  <div className="flex gap-1">
                    {BAN_DURATIONS.map((dur) => (
                      <button
                        key={dur.value}
                        type="button"
                        onClick={() => setBanDuration(dur.value as any)}
                        className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                          banDuration === dur.value
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-gray-200 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confirm Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-600">CONFIRM</span> to proceed
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="CONFIRM"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-3 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || confirmText !== "CONFIRM"}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : action === "delete" ? "Delete" : "Hide"}
          </button>
        </div>
      </div>
    </div>
  );
}
