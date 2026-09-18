"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DhikrData, APP_NAME } from "@/lib/constants";

interface DhikrEntry {
  id: number;
  title: string;
  arabic: string;
  startAyah?: number;
}

export default function AdminPage() {
  const [dhikrList, setDhikrList] = useState<DhikrEntry[]>([]);
  const [filtered, setFiltered] = useState<DhikrEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [visitorStats, setVisitorStats] = useState<{ uniqueUsers: number; onlineUsers: number; online: { ip: string; lastSeen: string; visits: number }[]; allVisitors: { ip: string; lastVisit: string; lastSeen: string; visits: number }[] }>({ uniqueUsers: 0, onlineUsers: 0, online: [], allVisitors: [] });

  // Add form
  const [newTitle, setNewTitle] = useState("");
  const [newArabic, setNewArabic] = useState("");
  const [newStartAyah, setNewStartAyah] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArabic, setEditArabic] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchDhikr = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const url = q ? `/api/dhikr?q=${encodeURIComponent(q)}` : "/api/dhikr";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDhikrList(data);
      setFiltered(data);
    } catch (e) {
      console.error("Failed to fetch dhikr:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDhikr();
    const fetchStats = () => {
      fetch("/api/visitors")
        .then((r) => r.json())
        .then(setVisitorStats)
        .catch(() => {});
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [fetchDhikr]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (search.trim()) {
        fetchDhikr(search.trim());
      } else {
        fetchDhikr();
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, fetchDhikr]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((d) => d.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected entries?`)) return;
    try {
      const res = await fetch("/api/dhikr/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (!res.ok) throw new Error("Bulk delete failed");
      setSelected(new Set());
      fetchDhikr();
    } catch (e) {
      console.error("Bulk delete failed:", e);
      alert("Failed to bulk delete");
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim() || !newArabic.trim()) {
      alert("Title and Arabic text are required");
      return;
    }
    setAdding(true);
    try {
      const payload: Record<string, unknown> = {
        title: newTitle.trim(),
        arabic: newArabic.trim(),
      };
      if (newStartAyah.trim()) {
        payload.startAyah = parseInt(newStartAyah.trim(), 10);
      }
      const res = await fetch("/api/dhikr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Add failed");
      setNewTitle("");
      setNewArabic("");
      setNewStartAyah("");
      fetchDhikr();
    } catch (e) {
      console.error("Add failed:", e);
      alert("Failed to add entry");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (entry: DhikrEntry) => {
    setEditingId(entry.id);
    setEditTitle(entry.title);
    setEditArabic(entry.arabic);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditArabic("");
  };

  const saveEdit = async (id: number) => {
    if (!editTitle.trim() || !editArabic.trim()) {
      alert("Title and Arabic text are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/dhikr/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim(), arabic: editArabic.trim() }),
      });
      if (!res.ok) throw new Error("Save failed");
      setEditingId(null);
      setEditTitle("");
      setEditArabic("");
      fetchDhikr();
    } catch (e) {
      console.error("Save failed:", e);
      alert("Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this entry?")) return;
    try {
      const res = await fetch(`/api/dhikr/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchDhikr();
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Failed to delete entry");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const arr = [...dhikrList];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= arr.length) return;
    [arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]];
    setDhikrList(arr);
    setFiltered(arr);
    try {
      const res = await fetch("/api/dhikr/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: arr.map((d) => d.id) }),
      });
      if (!res.ok) throw new Error("Reorder failed");
    } catch (e) {
      console.error("Reorder failed:", e);
      fetchDhikr();
    }
  };

  const handleExport = () => {
    const json = JSON.stringify(dhikrList, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dhikr-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data)) {
          alert("Invalid JSON format. Expected an array.");
          return;
        }
        if (!confirm(`Import ${data.length} entries? This will replace existing data.`)) return;
        const res = await fetch("/api/dhikr/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dhikrList: data, replace: true }),
        });
        if (!res.ok) throw new Error("Import failed");
        fetchDhikr();
        alert("Import successful!");
      } catch (e) {
        console.error("Import failed:", e);
        alert("Failed to import: Invalid file or server error");
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{APP_NAME} - Admin Panel</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage dhikr entries &middot; {dhikrList.length} total &middot; {visitorStats.onlineUsers} online
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            &larr; Back to Reader
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Visitor Stats */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">User Statistics</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{visitorStats.uniqueUsers}</div>
              <div className="text-xs text-gray-500 mt-1">Total Users Visited</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{visitorStats.onlineUsers}</div>
              <div className="text-xs text-gray-500 mt-1">Currently Online</div>
            </div>
          </div>

          {visitorStats.online.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Currently Online ({visitorStats.onlineUsers})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-700">
                      <th className="pb-2 font-medium">IP Address</th>
                      <th className="pb-2 font-medium">Using Since</th>
                      <th className="pb-2 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {visitorStats.online.map((v) => {
                      const since = new Date(v.lastSeen);
                      const mins = Math.floor((Date.now() - since.getTime()) / 60000);
                      const durText = mins < 1 ? 'just now' : mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
                      return (
                        <tr key={v.ip} className="text-gray-300">
                          <td className="py-2 font-mono text-xs">{v.ip}</td>
                          <td className="py-2 text-xs">{since.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="py-2">
                            <span className="bg-emerald-900 text-emerald-300 text-xs px-2 py-0.5 rounded-full">{durText}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {visitorStats.online.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No users currently online</p>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                &times;
              </button>
            )}
          </div>

          <button
            onClick={handleExport}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={handleImport}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Import JSON
          </button>
          <Link
            href="/admin/add-quran"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Add from Quran
          </Link>
        </div>

        {/* Bulk Actions */}
        {selected.size > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 flex items-center gap-4">
            <span className="text-sm text-gray-300">{selected.size} selected</span>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Add New Entry Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Add New Dhikr Entry</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Arabic text"
              value={newArabic}
              onChange={(e) => setNewArabic(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
              dir="rtl"
            />
            <input
              type="number"
              placeholder="Start Ayah (optional)"
              value={newStartAyah}
              onChange={(e) => setNewStartAyah(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={adding}
            className="mt-4 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            {adding ? "Adding..." : "Add Entry"}
          </button>
        </div>

        {/* Dhikr List */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-750 border-b border-gray-700 flex items-center gap-3">
            <input
              type="checkbox"
              checked={filtered.length > 0 && selected.size === filtered.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-400">
              Select All ({filtered.length} entries)
            </span>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              {search ? "No entries match your search" : "No dhikr entries found"}
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filtered.map((entry, index) => (
                <div
                  key={entry.id}
                  className="px-4 py-3 flex items-start gap-3 hover:bg-gray-750 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(entry.id)}
                    onChange={() => toggleSelect(entry.id)}
                    className="w-4 h-4 mt-1 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 cursor-pointer"
                  />

                  <div className="flex-1 min-w-0">
                    {editingId === entry.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                          value={editArabic}
                          onChange={(e) => setEditArabic(e.target.value)}
                          rows={2}
                          dir="rtl"
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic resize-y"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(entry.id)}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-600 hover:bg-gray-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-sm font-semibold text-white truncate">
                          {entry.title}
                        </h3>
                        <p
                          className="text-sm text-gray-400 mt-0.5 line-clamp-2 font-arabic"
                          dir="rtl"
                        >
                          {entry.arabic}
                        </p>
                        {entry.startAyah !== undefined && entry.startAyah !== null && (
                          <span className="inline-block mt-1 text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">
                            Ayah {entry.startAyah}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {editingId !== entry.id && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                        title="Move up"
                        className="text-gray-500 hover:text-white disabled:text-gray-700 disabled:cursor-not-allowed p-1.5 rounded transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleMove(index, "down")}
                        disabled={index === dhikrList.length - 1}
                        title="Move down"
                        className="text-gray-500 hover:text-white disabled:text-gray-700 disabled:cursor-not-allowed p-1.5 rounded transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => startEdit(entry)}
                        title="Edit"
                        className="text-gray-500 hover:text-yellow-400 p-1.5 rounded transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        title="Delete"
                        className="text-gray-500 hover:text-red-400 p-1.5 rounded transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
