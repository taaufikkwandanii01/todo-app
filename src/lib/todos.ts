/**
 * lib/todos.ts
 * Semua operasi CRUD untuk Todo + logika validasi waktu
 */
import { createClient } from '@/lib/supabase/client';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '@/types/todo';

// ─────────────────────────────────────────────────────────
// AUTO-FAIL LOGIC
// ─────────────────────────────────────────────────────────

/**
 * Panggil fungsi server-side di Supabase untuk auto-fail
 * todos yang sudah melewati deadline. Menggunakan waktu server
 * (NOW()) bukan waktu client.
 */
export async function triggerAutoFail(userId: string): Promise<void> {
  const supabase = createClient();
  await supabase.rpc('auto_fail_overdue_todos', { p_user_id: userId });
}

// ─────────────────────────────────────────────────────────
// CRUD OPERATIONS
// ─────────────────────────────────────────────────────────

/** Ambil semua todos milik user, dengan opsional search by title */
export async function getTodos(
  userId: string,
  search?: string
): Promise<Todo[]> {
  // Trigger auto-fail berbasis server time dulu
  await triggerAutoFail(userId);

  const supabase = createClient();

  let query = supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (search && search.trim().length > 0) {
    // Search by title (case-insensitive) ATAU description
    query = query.or(
      `title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Todo[];
}

/** Buat Todo baru */
export async function createTodo(
  userId: string,
  input: CreateTodoInput
): Promise<Todo> {
  // Validasi: deadline harus di masa depan
  if (new Date(input.deadline) <= new Date()) {
    throw new Error('Deadline harus di masa mendatang.');
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('todos')
    .insert({
      user_id: userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      deadline: input.deadline,
      status: 'Pending',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Todo;
}

/** Update Todo */
export async function updateTodo(
  todoId: string,
  userId: string,
  input: UpdateTodoInput
): Promise<Todo> {
  const supabase = createClient();

  // Hanya kirim field yang ada nilainya
  const payload: Partial<Record<string, unknown>> = {};
  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.description !== undefined)
    payload.description = input.description.trim() || null;
  if (input.deadline !== undefined) payload.deadline = input.deadline;
  if (input.status !== undefined) payload.status = input.status;

  const { data, error } = await supabase
    .from('todos')
    .update(payload)
    .eq('id', todoId)
    .eq('user_id', userId) // proteksi tambahan selain RLS
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Todo;
}

/** Hapus Todo */
export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', todoId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────────────────
// TIME UTILITIES
// ─────────────────────────────────────────────────────────

export interface TimeRemaining {
  total: number;      // ms, negatif jika overdue
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOverdue: boolean;
}

/** Hitung sisa waktu ke deadline */
export function getTimeRemaining(deadline: string): TimeRemaining {
  const diff = new Date(deadline).getTime() - Date.now();
  const isOverdue = diff < 0;
  const abs = Math.abs(diff);

  return {
    total: diff,
    isOverdue,
    days: Math.floor(abs / 86_400_000),
    hours: Math.floor((abs % 86_400_000) / 3_600_000),
    minutes: Math.floor((abs % 3_600_000) / 60_000),
    seconds: Math.floor((abs % 60_000) / 1_000),
  };
}

/**
 * Hitung status "live" secara lokal di client.
 * Berguna untuk langsung menampilkan Failed di UI
 * sebelum respons server tiba.
 */
export function computeLiveStatus(todo: Todo): Todo['status'] {
  if (todo.status === 'Pending' && new Date(todo.deadline) < new Date()) {
    return 'Failed';
  }
  return todo.status;
}

/** Format deadline ke string yang mudah dibaca */
export function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
