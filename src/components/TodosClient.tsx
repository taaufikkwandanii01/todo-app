"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "@/lib/todos";
import TodoCard from "@/components/TodoCard";
import TodoForm from "@/components/TodoForm";
import DeleteModal from "@/components/DeleteModal";
import { Plus, Search, Loader2 } from "lucide-react";
import type { Todo, TodoStatus } from "@/types/todo";
import type { User } from "@supabase/supabase-js";

interface TodosClientProps {
  user: User;
}

type FilterTab = "Semua" | "Pending" | "Completed" | "Failed";

export default function TodosClient({ user }: TodosClientProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("Semua");
  const [showForm, setShowForm] = useState(false);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // ─── Fetch todos ───────────────────────────────────────
  const fetchTodos = useCallback(
    async (searchTerm?: string) => {
      try {
        const data = await getTodos(user.id, searchTerm);
        setTodos(data);
      } catch (e) {
        console.error("Gagal fetch todos:", e);
      } finally {
        setLoading(false);
      }
    },
    [user.id],
  );

  // Initial fetch
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTodos(search || undefined);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchTodos]);

  // Auto-refresh setiap 30 detik untuk sinkronisasi failed status dari server
  useEffect(() => {
    const interval = setInterval(() => fetchTodos(search || undefined), 30_000);
    return () => clearInterval(interval);
  }, [fetchTodos, search]);

  // ─── CRUD handlers ─────────────────────────────────────
  async function handleCreate(data: {
    title: string;
    description: string;
    deadline: string;
  }) {
    const newTodo = await createTodo(user.id, {
      title: data.title,
      description: data.description,
      deadline: data.deadline,
    });
    setTodos((prev) => [newTodo, ...prev]);
  }

  async function handleUpdate(data: {
    title: string;
    description: string;
    deadline: string;
    status?: TodoStatus;
  }) {
    if (!editTodo) return;
    const updated = await updateTodo(editTodo.id, user.id, {
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      status: data.status,
    });
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function handleDelete() {
    if (!deletingTodo) return;
    await deleteTodo(deletingTodo.id, user.id);
    setTodos((prev) => prev.filter((t) => t.id !== deletingTodo.id));
  }

  async function handleToggleComplete(todo: Todo) {
    const newStatus: TodoStatus =
      todo.status === "Completed" ? "Pending" : "Completed";
    try {
      const updated = await updateTodo(todo.id, user.id, {
        status: newStatus,
      });
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      console.error("Toggle gagal:", e);
    }
  }

  // ─── Filter ────────────────────────────────────────────
  const filtered =
    activeFilter === "Semua"
      ? todos
      : todos.filter((t) => t.status === activeFilter);

  const counts = {
    Semua: todos.length,
    Pending: todos.filter((t) => t.status === "Pending").length,
    Completed: todos.filter((t) => t.status === "Completed").length,
    Failed: todos.filter((t) => t.status === "Failed").length,
  };

  const TABS: FilterTab[] = ["Semua", "Pending", "Completed", "Failed"];

  const TAB_COLORS: Record<FilterTab, string> = {
    Semua: "text-white border-white/30",
    Pending: "text-amber-400 border-amber-400/50",
    Completed: "text-emerald-400 border-emerald-400/50",
    Failed: "text-red-400 border-red-400/50",
  };

  // ─── Render ────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-white/90 mb-0.5">
          ToDo Saya
        </h1>
        <p className="text-sm text-white/30">
          Kelola dan pantau semua tugas Anda
        </p>
      </div>

      {/* Toolbar: Search + Add */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan judul atau deskripsi…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#111118] border border-white/[0.07] text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all shadow-lg shadow-violet-600/20 whitespace-nowrap cursor-pointer"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Tambah Todo</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 border-b border-white/[0.06] pb-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`
              px-3 py-2 text-xs font-medium transition-all relative cursor-pointer
              ${
                activeFilter === tab
                  ? `${TAB_COLORS[tab]} border-b-2 -mb-px`
                  : "text-white/30 hover:text-white/60 border-b-2 border-transparent -mb-px"
              }
            `}
          >
            {tab}
            <span
              className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                activeFilter === tab ? "bg-white/10" : "bg-white/5"
              }`}
            >
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={28} className="text-violet-400 animate-spin" />
          <p className="text-sm text-white/30">Memuat todos…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="text-4xl opacity-20">
            {search ? "🔍" : activeFilter === "Semua" ? "✅" : "📋"}
          </div>
          <p className="text-sm text-white/30 text-center">
            {search
              ? `Tidak ada hasil untuk "${search}"`
              : activeFilter === "Semua"
                ? "Belum ada todo. Buat satu sekarang!"
                : `Tidak ada todo dengan status ${activeFilter}.`}
          </p>
          {!search && activeFilter === "Semua" && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 px-4 py-2 rounded-lg text-sm text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-all cursor-pointer"
            >
              + Buat Todo Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
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

      {/* Modals */}
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
