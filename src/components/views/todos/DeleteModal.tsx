'use client';

import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Todo } from '@/types/todo';

interface DeleteModalProps {
  todo: Todo;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function DeleteModal({
  todo,
  onConfirm,
  onClose,
}: DeleteModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-[#111118] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 p-7 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-red-400">
            <Trash2 size={16} />
            <h2 className="text-base font-bold">Hapus ToDo</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 border border-white/[0.07] transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <p className="text-sm text-white/50 leading-relaxed">
          Apakah Anda yakin ingin menghapus tugas{' '}
          <span className="text-white/80 font-semibold">
            &ldquo;{todo.title}&rdquo;
          </span>
        </p>

        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 border border-white/[0.07] transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20 cursor-pointer"
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}
