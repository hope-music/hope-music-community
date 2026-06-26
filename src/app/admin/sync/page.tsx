"use client";

import { useState, useEffect } from "react";

const CATEGORIES = [
  { key: "opera", label: "Opera", icon: "🎭", sources: "Opera performances" },
  { key: "musical", label: "Musical", icon: "🎬", sources: "Broadway, Theater" },
  { key: "classical", label: "Classical", icon: "🎻", sources: "Classical music" },
  { key: "music", label: "Music", icon: "🎵", sources: "Music events" },
  { key: "dance", label: "Dance", icon: "💃", sources: "Dance performances" },
  { key: "electronic", label: "Electronic", icon: "🎛️", sources: "Dance/Electronic" },
  { key: "pop-rock", label: "Pop & Rock", icon: "🎸", sources: "Pop, Rock" },
  { key: "performance-art", label: "Performance Art", icon: "🎪", sources: "Performance Art, Variety" },
  { key: "other", label: "Other", icon: "🌟", sources: "Other events" },
];

type SyncState = "idle" | "syncing" | "done" | "error";

interface CategoryStatus {
  state: SyncState;
  usResult: { upserted: number; errors: number } | null;
  intlResult: { upserted: number; errors: number } | null;
  error: string | null;
}

export default function SyncPage() {
  const [statuses, setStatuses] = useState<Record<string, CategoryStatus>>({});
  const [syncingAll, setSyncingAll] = useState(false);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [progress, setProgress] = useState("");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lastSyncTime");
    if (saved) setLastSyncTime(saved);
  }, []);

  const runSync = async (categoryKey: string, countryScope: "US" | "International") => {
    setStatuses((prev) => ({
      ...prev,
      [categoryKey]: {
        state: "syncing",
        usResult: countryScope === "US" ? null : (prev[categoryKey]?.usResult ?? null),
        intlResult: countryScope === "International" ? null : (prev[categoryKey]?.intlResult ?? null),
        error: null,
      },
    }));
    setProgress(`Syncing ${categoryKey} (${countryScope})...`);

    try {
      const res = await fetch("/api/sync-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: categoryKey, countryScope }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setStatuses((prev) => ({
        ...prev,
        [categoryKey]: {
          state: "done",
          usResult: countryScope === "US" ? data : (prev[categoryKey]?.usResult ?? null),
          intlResult: countryScope === "International" ? data : (prev[categoryKey]?.intlResult ?? null),
          error: null,
        },
      }));
      setProgress(`Completed ${categoryKey} (${countryScope}): ${data.upserted} events upserted`);
    } catch (err: any) {
      setStatuses((prev) => ({
        ...prev,
        [categoryKey]: {
          state: "error",
          usResult: countryScope === "US" ? null : (prev[categoryKey]?.usResult ?? null),
          intlResult: countryScope === "International" ? null : (prev[categoryKey]?.intlResult ?? null),
          error: err.message,
        },
      }));
      setProgress(`Error: ${err.message}`);
    }
  };

  const runSyncAll = async () => {
    setSyncingAll(true);
    setAllResults([]);
    setProgress("Starting sync all categories...");

    try {
      const res = await fetch("/api/sync-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "syncAll" }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setAllResults(data.results || []);
      const totalUpserted = (data.results || []).reduce((sum: number, r: any) => sum + (r.upserted || 0), 0);
      setProgress(`Sync all completed! Total: ${totalUpserted} events upserted`);

      const now = new Date().toLocaleString();
      setLastSyncTime(now);
      localStorage.setItem("lastSyncTime", now);
    } catch (err: any) {
      setProgress(`Error: ${err.message}`);
    } finally {
      setSyncingAll(false);
    }
  };

  const getTotalUpserted = () => {
    let total = 0;
    Object.values(statuses).forEach((s) => {
      if (s.usResult) total += s.usResult.upserted;
      if (s.intlResult) total += s.intlResult.upserted;
    });
    return total;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Sync</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sync events from Ticketmaster to Supabase for all categories
          </p>
          {lastSyncTime && (
            <p className="mt-1 text-xs text-gray-400">
              Last sync: {lastSyncTime}
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Quick Sync</h2>
            <p className="text-sm text-gray-600 mt-1">
              Sync all 18 category-region combinations (9 categories × 2 regions)
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={runSyncAll}
              disabled={syncingAll}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {syncingAll ? "Syncing All..." : "Sync All Categories"}
            </button>
            {syncingAll && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span>Running in background...</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        {progress && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            progress.includes("Error") ? "bg-red-50 text-red-700" : "bg-white text-gray-700"
          }`}>
            {progress}
          </div>
        )}

        {/* Summary */}
        {allResults.length > 0 && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
            <h3 className="font-medium text-gray-900 mb-2">Sync Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {allResults.map((r, i) => (
                <div key={i} className={`p-2 rounded text-xs ${
                  r.error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                }`}>
                  <span className="font-medium">{r.category}</span> ({r.scope})
                  <br />
                  {r.error ? `Error: ${r.error.slice(0, 20)}...` : `${r.upserted} upserted`}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 text-sm font-medium">
              Total upserted: {allResults.reduce((sum, r) => sum + (r.upserted || 0), 0).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Individual Category Sync */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sync by Category</h2>
          <p className="text-sm text-gray-500 mt-1">
            Click buttons to sync individual category for US or International region
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {CATEGORIES.map((cat) => {
            const s = statuses[cat.key];
            const isRunning = s?.state === "syncing";

            return (
              <div key={cat.key} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{cat.icon}</div>
                    <div>
                      <div className="font-medium text-gray-900">{cat.label}</div>
                      <div className="text-xs text-gray-400">{cat.sources}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* US Sync */}
                    <div className="text-center">
                      <button
                        onClick={() => runSync(cat.key, "US")}
                        disabled={isRunning || syncingAll}
                        className="px-4 py-2 rounded border border-blue-300 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {isRunning && s?.usResult === null ? "..." : "Sync US"}
                      </button>
                      {s?.usResult && !isRunning && (
                        <div className="mt-1 text-xs text-green-600 font-medium">
                          +{s.usResult.upserted}
                        </div>
                      )}
                      {s?.error && s.intlResult === null && (
                        <div className="mt-1 text-xs text-red-500">{s.error.slice(0, 30)}</div>
                      )}
                    </div>

                    {/* International Sync */}
                    <div className="text-center">
                      <button
                        onClick={() => runSync(cat.key, "International")}
                        disabled={isRunning || syncingAll}
                        className="px-4 py-2 rounded border border-purple-300 bg-white text-purple-700 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {isRunning && s?.intlResult === null ? "..." : "Sync Int'l"}
                      </button>
                      {s?.intlResult && !isRunning && (
                        <div className="mt-1 text-xs text-green-600 font-medium">
                          +{s.intlResult.upserted}
                        </div>
                      )}
                      {s?.error && s.usResult === null && (
                        <div className="mt-1 text-xs text-red-500">{s.error.slice(0, 30)}</div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="w-32 text-right">
                      {s?.state === "done" && !s.error && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Complete
                        </span>
                      )}
                      {s?.state === "error" && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Error
                        </span>
                      )}
                      {(!s || s.state === "idle") && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-status row */}
                {(s?.usResult || s?.intlResult) && (
                  <div className="mt-2 ml-14 flex gap-4 text-xs text-gray-500">
                    {s.usResult && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        US: {s.usResult.upserted} upserted{s.usResult.errors > 0 && `, ${s.usResult.errors} errors`}
                      </span>
                    )}
                    {s.intlResult && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        Int&apos;l: {s.intlResult.upserted} upserted{s.intlResult.errors > 0 && `, ${s.intlResult.errors} errors`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="font-medium text-gray-700 mb-2">How it works</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click &quot;Sync All Categories&quot; to sync all 18 category-region combinations at once</li>
          <li>• Or sync individual categories using the &quot;Sync US&quot; and &quot;Sync Int&apos;l&quot; buttons</li>
          <li>• Events are fetched from Ticketmaster API and upserted into Supabase</li>
          <li>• Duplicate events (same ticketmaster_id) are updated, not duplicated</li>
          <li>• After syncing, refresh the frontend pages to see the updated events</li>
        </ul>
      </div>

      {/* Stats */}
      {getTotalUpserted() > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="text-sm text-green-800">
            <strong>Total events synced this session:</strong> {getTotalUpserted().toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
