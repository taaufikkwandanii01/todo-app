'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Todo, TodoStatus } from '@/types/todo';

interface TodoFormProps {
  todo?: Todo | null;
  onSave: (data: {
    title: string;
    description: string;
    deadline: string;
    status?: TodoStatus;
  }) => Promise<void>;
  onClose: () => void;
}

/** Konversi ISO string → value untuk input datetime-local */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Nilai minimum datetime-local: sekarang + 1 menit */
function getMinDatetime(): string {
  const d = new Date(Date.now() + 60_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TodoForm({ todo, onSave, onClose }: TodoFormProps) {
  const isEdit = !!todo;
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(todo?.title ?? '');
  const [description, setDescription] = useState(todo?.description ?? '');
  const [deadline, setDeadline] = useState(
    todo ? toDatetimeLocal(todo.deadline) : ''
  );
  const [status, setStatus] = useState<TodoStatus>(todo?.status ?? 'Pending');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto focus & Escape handler
  useEffect(() => {
    firstInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit() {
    setError('');

    if (!title.trim()) return setError('Judul tidak boleh kosong.');
    if (!deadline) return setError('Deadline harus diisi.');

    const deadlineISO = new Date(deadline).toISOString();

    // Validasi: deadline harus masa depan untuk todo baru
    if (!isEdit && new Date(deadlineISO) <= new Date()) {
      return setError('Deadline harus di masa mendatang.');
    }

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        deadline: deadlineISO,
        ...(isEdit ? { status } : {}),
      });
      onClose();
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-[#111118] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 p-7 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white/90">
            {isEdit ? 'Edit Todo' : 'Buat Todo Baru'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 border border-white/[0.07] transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <FormField label="Judul *">
            <input
              ref={firstInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Apa yang perlu dilakukan?"
              maxLength={150}
              className="form-input"
            />
          </FormField>

          <FormField label="Deskripsi">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan detail (opsional)"
              maxLength={600}
              rows={3}
              className="form-input resize-none"
            />
          </FormField>

          <FormField label="Deadline *">
            <input
              type="datetime-local"
              value={deadline}
              min={!isEdit ? getMinDatetime() : undefined}
              onChange={(e) => setDeadline(e.target.value)}
              className="form-input"
            />
          </FormField>

          {isEdit && (
            <FormField label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TodoStatus)}
                className="form-input"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
            </FormField>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 border border-white/[0.07] transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20 cursor-pointer"
          >
            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Todo'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
