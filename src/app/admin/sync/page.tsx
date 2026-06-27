"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { value: "musical", label: "Musical", icon: "🎬" },
  { value: "opera", label: "Opera", icon: "🎭" },
  { value: "classical", label: "Classical", icon: "🎻" },
  { value: "music", label: "Music", icon: "🎵" },
  { value: "dance", label: "Dance", icon: "💃" },
  { value: "electronic", label: "Electronic", icon: "🎛️" },
  { value: "pop-rock", label: "Pop & Rock", icon: "🎸" },
  { value: "performance-art", label: "Performance Art", icon: "🎪" },
  { value: "other", label: "Other", icon: "🌟" },
];

type Region = "US" | "International";
type SyncStatus = "idle" | "running" | "done" | "error";

interface SyncProgress {
  category: string;
  scope: Region;
  status: SyncStatus;
  page: number;
  upserted: number;
  errors: number;
  message: string;
}

interface CategoryCount {
  US: number;
  International: number;
}

function getRowKey(category: string, scope: Region) {
  return `${category}-${scope}`;
}

export default function SyncPage() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, CategoryCount>>({});
  const [loading, setLoading] = useState(true);
  const [syncAllRunning, setSyncAllRunning] = useState(false);
  const [progress, setProgress] = useState<Record<string, SyncProgress>>({});
  const [syncAllResults, setSyncAllResults] = useState<any[] | null>(null);
  const [syncAllDone, setSyncAllDone] = useState(false);

  const fetchCounts = useCallback(async () => {
    const counts: Record<string, CategoryCount> = {};
    for (const cat of CATEGORIES) {
      const tableName = `${cat.value.replace(/-/g, "_")}_events`;
      const { count: usCount } = await supabase
        .from(tableName)
        .select("*", { count: "exact", head: true })
        .eq("region", "US");
      const { count: intlCount } = await supabase
        .from(tableName)
        .select("*", { count: "exact", head: true })
        .eq("region", "international");
      counts[cat.value] = { US: usCount || 0, International: intlCount || 0 };
    }
    setCategoryCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  function runSingleSync(categoryKey: string, scope: Region) {
    const key = getRowKey(categoryKey, scope);

    setProgress((prev) => ({
      ...prev,
      [key]: {
        category: categoryKey,
        scope,
        status: "running",
        page: 0,
        upserted: 0,
        errors: 0,
        message: "Starting…",
      },
    }));

    fetch("/api/sync-events/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: categoryKey, countryScope: scope }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        function read() {
          reader.read().then(({ done, value }) => {
            if (done) return;
            const text = decoder.decode(value);
            text.split("\n\n").forEach((block) => {
              const line = block.replace(/^data: /, "");
              if (!line) return;
              try {
                const data = JSON.parse(line);
                if (data.type === "start") {
                  setProgress((prev) => ({
                    ...prev,
                    [key]: {
                      ...prev[key],
                      status: "running",
                      message: data.message,
                    },
                  }));
                } else if (data.type === "progress") {
                  setProgress((prev) => ({
                    ...prev,
                    [key]: {
                      ...prev[key],
                      status: "running",
                      page: data.page,
                      upserted: data.upserted,
                      errors: data.errors,
                      message: data.message,
                    },
                  }));
                } else if (data.type === "done") {
                  setProgress((prev) => ({
                    ...prev,
                    [key]: {
                      ...prev[key],
                      status: "done",
                      upserted: data.upserted,
                      errors: data.errors,
                      message: data.message,
                    },
                  }));
                  fetchCounts();
                } else if (data.type === "error") {
                  setProgress((prev) => ({
                    ...prev,
                    [key]: {
                      ...prev[key],
                      status: "error",
                      message: data.message,
                    },
                  }));
                }
              } catch (_) {}
            });
            read();
          });
        }
        read();
      })
      .catch((err: any) => {
        setProgress((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            status: "error",
            message: err.message,
          },
        }));
      });
  }

  function runSyncAll() {
    setSyncAllRunning(true);
    setSyncAllResults(null);
    setSyncAllDone(false);
    setProgress({});

    // Mark all rows as running immediately
    const allProgress: Record<string, SyncProgress> = {};
    for (const cat of CATEGORIES) {
      for (const scope of getScopes(cat.value)) {
        const key = getRowKey(cat.value, scope);
        allProgress[key] = {
          category: cat.value,
          scope,
          status: "running",
          page: 0,
          upserted: 0,
          errors: 0,
          message: "Waiting…",
        };
      }
    }
    setProgress(allProgress);

    fetch("/api/sync-events/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "syncAll" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        const results: any[] = [];

        function read() {
          reader.read().then(({ done, value }) => {
            if (done) return;
            const text = decoder.decode(value);
            text.split("\n\n").forEach((block) => {
              const line = block.replace(/^data: /, "");
              if (!line) return;
              try {
                const data = JSON.parse(line);
                if (data.type === "start") {
                  const key = getRowKey(data.category, data.scope);
                  setProgress((prev) => ({
                    ...prev,
                    [key]: {
                      ...prev[key],
                      status: "running",
                      message: data.message,
                    },
                  }));
                } else if (data.type === "progress") {
                  const key = getRowKey(data.category, data.scope);
                  setProgress((prev) => ({
                    ...prev,
                    [key]: {
                      ...prev[key],
                      status: "running",
                      page: data.page,
                      upserted: data.upserted,
                      errors: data.errors,
                      message: data.message,
                    },
                  }));
                } else if (data.type === "done") {
                  const key = getRowKey(data.category, data.scope);
                  results.push(data);
                  setProgress((prev) => ({
                    ...prev,
                    [key]: {
                      ...prev[key],
                      status: "done",
                      upserted: data.upserted,
                      errors: data.errors,
                      message: data.message,
                    },
                  }));
                } else if (data.type === "error") {
                  const key = getRowKey(data.category, data.scope);
                  results.push({ category: data.category, scope: data.scope, error: data.message });
                  setProgress((prev) => ({
                    ...prev,
                    [key]: {
                      ...prev[key],
                      status: "error",
                      message: data.message,
                    },
                  }));
                } else if (data.type === "complete") {
                  setSyncAllResults(data.results);
                  setSyncAllDone(true);
                  setSyncAllRunning(false);
                  fetchCounts();
                }
              } catch (_) {}
            });
            read();
          });
        }
        read();
      })
      .catch((err: any) => {
        setSyncAllRunning(false);
        const allProgress: Record<string, SyncProgress> = {};
        for (const cat of CATEGORIES) {
          for (const scope of getScopes(cat.value)) {
            const key = getRowKey(cat.value, scope);
            allProgress[key] = {
              category: cat.value,
              scope,
              status: "error",
              page: 0,
              upserted: 0,
              errors: 0,
              message: err.message,
            };
          }
        }
        setProgress(allProgress);
      });
  }

  const getScopes = (categoryKey: string) =>
    categoryKey === "musical" ? (["US"] as Region[]) : (["US", "International"] as Region[]);

  const totalRecords = Object.values(categoryCounts).reduce(
    (sum, c) => sum + c.US + c.International,
    0
  );

  const runningCount = Object.values(progress).filter((p) => p.status === "running").length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticketmaster Sync</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading
              ? "Loading counts…"
              : `${totalRecords.toLocaleString()} records · ${CATEGORIES.length} categories · US + International`}
          </p>
        </div>
        <button
          onClick={runSyncAll}
          disabled={syncAllRunning}
          className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
            syncAllRunning
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {syncAllRunning ? `Running… (${runningCount} active)` : "Sync All"}
        </button>
      </div>

      {/* Category Grid */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium w-10">Icon</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium text-center">US Records</th>
              <th className="px-4 py-3 font-medium text-center">Int&apos;l Records</th>
              <th className="px-4 py-3 font-medium text-center w-52">US Sync</th>
              <th className="px-4 py-3 font-medium text-center w-52">Int&apos;l Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {CATEGORIES.map((cat) => {
              const scopes = getScopes(cat.value);
              const usKey = getRowKey(cat.value, "US");
              const intlKey = getRowKey(cat.value, "International");
              const usProgress = progress[usKey];
              const intlProgress = progress[intlKey];
              const counts = categoryCounts[cat.value] || { US: 0, International: 0 };

              return (
                <tr key={cat.value} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-base">{cat.icon}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.label}</td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {loading ? "—" : counts.US.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {loading ? "—" : counts.International.toLocaleString()}
                  </td>

                  {/* US Sync Cell */}
                  <td className="px-4 py-3">
                    {usProgress?.status === "running" ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-blue-600">
                          <span>{usProgress.message}</span>
                          <span>{usProgress.upserted} ↑</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-blue-100 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: "100%" }} />
                        </div>
                      </div>
                    ) : usProgress?.status === "done" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 font-medium">✓ {usProgress.upserted} upserted</span>
                        <button
                          onClick={() => runSingleSync(cat.value, "US")}
                          className="text-xs text-gray-400 hover:text-gray-600 underline"
                        >
                          redo
                        </button>
                      </div>
                    ) : usProgress?.status === "error" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-500">✗ {usProgress.message}</span>
                        <button
                          onClick={() => runSingleSync(cat.value, "US")}
                          className="text-xs text-gray-400 hover:text-gray-600 underline"
                        >
                          retry
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => runSingleSync(cat.value, "US")}
                        disabled={syncAllRunning}
                        className="w-full px-3 py-1.5 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40"
                      >
                        Sync US
                      </button>
                    )}
                  </td>

                  {/* Int'l Sync Cell — hidden for Musical (Broadway is US-only) */}
                  <td className="px-4 py-3">
                    {cat.value === "musical" ? (
                      <span className="text-xs text-gray-300 italic">N/A</span>
                    ) : intlProgress?.status === "running" ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-blue-600">
                          <span>{intlProgress.message}</span>
                          <span>{intlProgress.upserted} ↑</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-blue-100 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: "100%" }} />
                        </div>
                      </div>
                    ) : intlProgress?.status === "done" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 font-medium">✓ {intlProgress.upserted} upserted</span>
                        <button
                          onClick={() => runSingleSync(cat.value, "International")}
                          className="text-xs text-gray-400 hover:text-gray-600 underline"
                        >
                          redo
                        </button>
                      </div>
                    ) : intlProgress?.status === "error" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-500">✗ {intlProgress.message}</span>
                        <button
                          onClick={() => runSingleSync(cat.value, "International")}
                          className="text-xs text-gray-400 hover:text-gray-600 underline"
                        >
                          retry
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => runSingleSync(cat.value, "International")}
                        disabled={syncAllRunning}
                        className="w-full px-3 py-1.5 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40"
                      >
                        Sync Int&apos;l
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sync All Summary */}
      {syncAllDone && syncAllResults && (
        <div className="rounded-lg border border-green-200 bg-green-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-green-200">
            <h2 className="text-sm font-semibold text-green-800">
              Sync All Complete
            </h2>
            <span className="text-xs text-green-700">
              {syncAllResults.reduce((s, r) => s + (r.upserted || 0), 0).toLocaleString()} total upserted ·{" "}
              {syncAllResults.reduce((s, r) => s + (r.errors || 0), 0)} total errors
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-green-100">
                {syncAllResults.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-gray-700">
                      {CATEGORIES.find((c) => c.value === r.category)?.icon}{" "}
                      <span className="font-medium">{r.category}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{r.scope}</td>
                    <td className="px-4 py-2 text-center font-mono text-gray-700">
                      {r.error ? (
                        <span className="text-red-500">✗ {r.error}</span>
                      ) : (
                        r.upserted?.toLocaleString() ?? "—"
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {r.error ? (
                        <span className="text-red-400">—</span>
                      ) : r.errors > 0 ? (
                        <span className="text-orange-500">{r.errors}</span>
                      ) : (
                        <span className="text-gray-300">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
