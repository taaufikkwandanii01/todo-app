"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "@/lib/todos";
import TodoCard from "@/components/TodoCard";
import TodoForm from "@/components/TodoForm";
import DeleteModal from "@/components/DeleteModal";
import {
  Plus,
  Search,
  Loader2,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  CalendarClock,
  CheckCircle2,
  Clock,
  XCircle,
  LayoutList,
} from "lucide-react";
import type { Todo, TodoStatus } from "@/types/todo";
import type { User } from "@supabase/supabase-js";

interface TodosClientProps {
  user: User;
}

// ── Types ──────────────────────────────────────────────────────────────────
type FilterStatus = "Semua" | TodoStatus;
type SortBy = "newest" | "oldest" | "deadline_asc" | "deadline_desc";
type DeadlineRange = "semua" | "hari_ini" | "minggu_ini" | "bulan_ini" | "terlewat";

interface FilterState {
  status: FilterStatus;
  sortBy: SortBy;
  deadlineRange: DeadlineRange;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function isToday(date: Date) {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function isThisWeek(date: Date) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return date >= startOfWeek && date <= endOfWeek;
}

function isThisMonth(date: Date) {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function applyFiltersAndSort(
  todos: Todo[],
  filters: FilterState,
  search: string
): Todo[] {
  let result = [...todos];

  // 1. Search
  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }

  // 2. Status filter
  if (filters.status !== "Semua") {
    result = result.filter((t) => t.status === filters.status);
  }

  // 3. Deadline range filter
  if (filters.deadlineRange !== "semua") {
    result = result.filter((t) => {
      const dl = new Date(t.deadline);
      switch (filters.deadlineRange) {
        case "hari_ini":   return isToday(dl);
        case "minggu_ini": return isThisWeek(dl);
        case "bulan_ini":  return isThisMonth(dl);
        case "terlewat":   return dl < new Date() && t.status === "Pending";
        default: return true;
      }
    });
  }

  // 4. Sort
  result.sort((a, b) => {
    switch (filters.sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "deadline_asc":
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case "deadline_desc":
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      default:
        return 0;
    }
  });

  return result;
}

// ── Sub-components ──────────────────────────────────────────────────────────

const STATUS_TABS: { value: FilterStatus; label: string; icon: React.ReactNode; color: string; activeColor: string }[] = [
  { value: "Semua",     label: "Semua",     icon: <LayoutList size={12} />,    color: "text-white/40",   activeColor: "text-white border-white/40" },
  { value: "Pending",   label: "Pending",   icon: <Clock size={12} />,         color: "text-amber-400/60", activeColor: "text-amber-400 border-amber-400/60" },
  { value: "Completed", label: "Selesai",   icon: <CheckCircle2 size={12} />,  color: "text-emerald-400/60", activeColor: "text-emerald-400 border-emerald-400/60" },
  { value: "Failed",    label: "Gagal",     icon: <XCircle size={12} />,       color: "text-red-400/60",  activeColor: "text-red-400 border-red-400/60" },
];

interface FilterPanelProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
  activeCount: number;
}

function FilterPanel({ filters, onChange, onClose, activeCount }: FilterPanelProps) {
  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filters, [key]: val });

  function resetAll() {
    onChange({ status: "Semua", sortBy: "newest", deadlineRange: "semua" });
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#13131f] p-4 mb-4 space-y-4 shadow-xl shadow-black/40">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={13} className="text-violet-400" />
          <span className="text-xs font-semibold text-white/70">Filter & Urutkan</span>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-semibold">
              {activeCount} aktif
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={resetAll}
              className="text-[11px] text-white/30 hover:text-red-400 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2 flex items-center gap-1.5">
          <ArrowUpDown size={10} /> Urutan
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { value: "newest",       label: "Terbaru dibuat" },
            { value: "oldest",       label: "Terlama dibuat" },
            { value: "deadline_asc", label: "Deadline terdekat" },
            { value: "deadline_desc",label: "Deadline terjauh" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => set("sortBy", opt.value as SortBy)}
              className={`px-3 py-2 rounded-lg text-[11px] font-medium text-left transition-all cursor-pointer border ${
                filters.sortBy === opt.value
                  ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                  : "bg-white/[0.03] border-white/[0.05] text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deadline range */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2 flex items-center gap-1.5">
          <CalendarClock size={10} /> Rentang Deadline
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {[
            { value: "semua",     label: "Semua" },
            { value: "hari_ini",  label: "Hari ini" },
            { value: "minggu_ini",label: "Minggu ini" },
            { value: "bulan_ini", label: "Bulan ini" },
            { value: "terlewat",  label: "⚠ Terlewat" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => set("deadlineRange", opt.value as DeadlineRange)}
              className={`px-3 py-2 rounded-lg text-[11px] font-medium text-left transition-all cursor-pointer border ${
                filters.deadlineRange === opt.value
                  ? opt.value === "terlewat"
                    ? "bg-red-600/20 border-red-500/40 text-red-300"
                    : "bg-violet-600/20 border-violet-500/40 text-violet-300"
                  : "bg-white/[0.03] border-white/[0.05] text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function TodosClient({ user }: TodosClientProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: "Semua",
    sortBy: "newest",
    deadlineRange: "semua",
  });
  const [showForm, setShowForm] = useState(false);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // ── Fetch ───────────────────────────────────────────────
  const fetchTodos = useCallback(async () => {
    try {
      const data = await getTodos(user.id);
      setTodos(data);
    } catch (e) {
      console.error("Gagal fetch todos:", e);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  // Debounced search — hanya re-fetch jika search berubah
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchTodos(), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, fetchTodos]);

  // Auto-refresh setiap 30 detik
  useEffect(() => {
    const id = setInterval(() => fetchTodos(), 30_000);
    return () => clearInterval(id);
  }, [fetchTodos]);

  // ── CRUD ────────────────────────────────────────────────
  async function handleCreate(data: { title: string; description: string; deadline: string }) {
    const newTodo = await createTodo(user.id, data);
    setTodos((prev) => [newTodo, ...prev]);
  }

  async function handleUpdate(data: { title: string; description: string; deadline: string; status?: TodoStatus }) {
    if (!editTodo) return;
    const updated = await updateTodo(editTodo.id, user.id, data);
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function handleDelete() {
    if (!deletingTodo) return;
    await deleteTodo(deletingTodo.id, user.id);
    setTodos((prev) => prev.filter((t) => t.id !== deletingTodo.id));
  }

  async function handleToggleComplete(todo: Todo) {
    const newStatus: TodoStatus = todo.status === "Completed" ? "Pending" : "Completed";
    try {
      const updated = await updateTodo(todo.id, user.id, { status: newStatus });
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      console.error("Toggle gagal:", e);
    }
  }

  // ── Computed ────────────────────────────────────────────
  const filtered = applyFiltersAndSort(todos, filters, search);

  const counts: Record<FilterStatus, number> = {
    Semua:     todos.length,
    Pending:   todos.filter((t) => t.status === "Pending").length,
    Completed: todos.filter((t) => t.status === "Completed").length,
    Failed:    todos.filter((t) => t.status === "Failed").length,
  };

  // Berapa banyak filter non-default yang aktif
  const activeFilterCount = [
    filters.sortBy !== "newest",
    filters.deadlineRange !== "semua",
    filters.status !== "Semua",
  ].filter(Boolean).length;

  // ── Render ──────────────────────────────────────────────
  return (
    <>
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white/90 mb-0.5">
          ToDo Saya
        </h1>
        <p className="text-xs sm:text-sm text-white/30">
          Kelola dan pantau semua tugas Anda
        </p>
      </div>

      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="flex gap-2 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau deskripsi…"
            className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#111118] border border-white/[0.07] text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setShowFilterPanel((p) => !p)}
          className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm border transition-all cursor-pointer ${
            showFilterPanel || activeFilterCount > 0
              ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
              : "bg-[#111118] border-white/[0.07] text-white/50 hover:text-white/80 hover:border-white/[0.12]"
          }`}
          title="Filter & Urutkan"
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline text-xs font-medium">Filter</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Add button */}
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all shadow-lg shadow-violet-600/20 whitespace-nowrap cursor-pointer"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Tambah</span>
        </button>
      </div>

      {/* ── Filter Panel (expandable) ────────────────────── */}
      {showFilterPanel && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilterPanel(false)}
          activeCount={activeFilterCount}
        />
      )}

      {/* ── Status Tabs ──────────────────────────────────── */}
      <div className="flex border-b border-white/[0.06] mb-4 overflow-x-auto scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = filters.status === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setFilters((f) => ({ ...f, status: tab.value }))}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-all relative cursor-pointer flex-shrink-0 border-b-2 -mb-px ${
                isActive
                  ? `${tab.activeColor}`
                  : `${tab.color} border-transparent hover:text-white/60`
              }`}
            >
              {tab.icon}
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  isActive ? "bg-white/10" : "bg-white/[0.04]"
                }`}
              >
                {counts[tab.value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Info bar: hasil filter ───────────────────────── */}
      {(search || activeFilterCount > 0) && !loading && (
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[11px] text-white/30">
            {filtered.length} todo ditemukan
            {search && (
              <span className="text-white/20"> untuk &ldquo;{search}&rdquo;</span>
            )}
          </p>
          {(search || activeFilterCount > 0) && (
            <button
              onClick={() => {
                setSearch("");
                setFilters({ status: "Semua", sortBy: "newest", deadlineRange: "semua" });
              }}
              className="text-[11px] text-violet-400/70 hover:text-violet-400 transition-colors cursor-pointer"
            >
              Hapus semua filter
            </button>
          )}
        </div>
      )}

      {/* ── Content ──────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={26} className="text-violet-400 animate-spin" />
          <p className="text-sm text-white/25">Memuat todos…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <div className="text-4xl opacity-20">
            {search
              ? "🔍"
              : filters.deadlineRange === "terlewat"
              ? "⚠️"
              : filters.status !== "Semua"
              ? "📋"
              : "✅"}
          </div>
          <p className="text-sm text-white/25 max-w-xs">
            {search
              ? `Tidak ada hasil untuk "${search}"`
              : filters.deadlineRange !== "semua"
              ? "Tidak ada todo pada rentang deadline ini."
              : filters.status !== "Semua"
              ? `Tidak ada todo dengan status ${filters.status}.`
              : "Belum ada todo. Yuk buat satu sekarang!"}
          </p>
          {!search && filters.status === "Semua" && filters.deadlineRange === "semua" && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-1 px-4 py-2 rounded-lg text-xs text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-all cursor-pointer"
            >
              + Buat Todo Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onEdit={(t) => setEditTodo(t)}
              onDelete={(t) => setDeletingTodo(t)}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────── */}
      {showForm && (
        <TodoForm onSave={handleCreate} onClose={() => setShowForm(false)} />
      )}
      {editTodo && (
        <TodoForm
          todo={editTodo}
          onSave={handleUpdate}
          onClose={() => setEditTodo(null)}
        />
      )}
      {deletingTodo && (
        <DeleteModal
          todo={deletingTodo}
          onConfirm={handleDelete}
          onClose={() => setDeletingTodo(null)}
        />
      )}
    </>
  );
}
