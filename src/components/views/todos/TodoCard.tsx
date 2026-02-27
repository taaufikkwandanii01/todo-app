"use client";

import { computeLiveStatus, formatDeadline } from "@/lib/todos";
import Countdown from "@/components/views/todos/Countdown";
import type { Todo } from "@/types/todo";
import { Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onToggleComplete: (todo: Todo) => void;
}

const STATUS_CONFIG = {
  Pending: {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    bar: "bg-violet-500",
    label: "Pending",
    dot: "bg-amber-400",
  },
  Completed: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    bar: "bg-emerald-500",
    label: "Selesai",
    dot: "bg-emerald-400",
  },
  Failed: {
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    bar: "bg-red-500",
    label: "Gagal / Expired",
    dot: "bg-red-400",
  },
};

export default function TodoCard({
  todo,
  onEdit,
  onDelete,
  onToggleComplete,
}: TodoCardProps) {
  const liveStatus = computeLiveStatus(todo);
  const cfg = STATUS_CONFIG[liveStatus];
  const isCompleted = liveStatus === "Completed";
  const isFailed = liveStatus === "Failed";

  return (
    <div
      className={`
        relative group rounded-xl border bg-[#111118] transition-all duration-200
        hover:shadow-lg hover:shadow-black/40
        ${isFailed ? "border-red-500/20 bg-gradient-to-br from-[#111118] to-red-950/10" : ""}
        ${isCompleted ? "border-emerald-500/15 opacity-70" : ""}
        ${!isCompleted && !isFailed ? "border-white/[0.07]" : ""}
      `}
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${cfg.bar}`}
      />

      <div className="pl-5 pr-4 py-4">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Checkbox toggle */}
          <button
            onClick={() => onToggleComplete(todo)}
            disabled={isFailed}
            className="mt-0.5 flex-shrink-0 text-white/20 hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label={isCompleted ? "Tandai belum selesai" : "Tandai selesai"}
          >
            {isCompleted ? (
              <CheckCircle2 size={20} className="text-emerald-400" />
            ) : (
              <Circle size={20} />
            )}
          </button>

          {/* Title + description */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-semibold leading-snug break-words ${
                isCompleted
                  ? "line-through text-white/30"
                  : isFailed
                    ? "text-red-300/70"
                    : "text-white/90"
              }`}
            >
              {todo.title}
            </p>
            {todo.description && (
              <p className="mt-1 text-xs text-white/35 leading-relaxed line-clamp-2">
                {todo.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {!isFailed && (
              <button
                onClick={() => onEdit(todo)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                aria-label="Edit"
              >
                <Pencil size={13} />
              </button>
            )}
            <button
              onClick={() => onDelete(todo)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
              aria-label="Hapus"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Bottom row — status badge + countdown + deadline */}
        <div className="mt-3 pl-8 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${cfg.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>

            {/* Countdown timer */}
            <Countdown deadline={todo.deadline} status={liveStatus} />
          </div>

          {/* Deadline date */}
          <span className="text-[10px] text-white/20 whitespace-nowrap">
            ⏰ {formatDeadline(todo.deadline)}
          </span>
        </div>
      </div>
    </div>
  );
}
