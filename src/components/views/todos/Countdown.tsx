'use client';

import { useState, useEffect } from 'react';
import { getTimeRemaining } from '@/lib/todos';
import type { TodoStatus } from '@/types/todo';

interface CountdownProps {
  deadline: string;
  status: TodoStatus;
}

export default function Countdown({ deadline, status }: CountdownProps) {
  const [tick, setTick] = useState(0);

  // Update setiap detik hanya jika status Pending
  useEffect(() => {
    if (status !== 'Pending') return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  if (status === 'Completed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
        Selesai
      </span>
    );
  }

  if (status === 'Failed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
        Kadaluarsa
      </span>
    );
  }

  // Pending — tampilkan countdown
  const { days, hours, minutes, seconds, isOverdue } = getTimeRemaining(deadline);

  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 animate-pulse">
        ⚠ Melewati deadline…
      </span>
    );
  }

  // Warning jika kurang dari 24 jam
  const isWarning = days === 0 && hours < 24;
  // Critical jika kurang dari 1 jam
  const isCritical = days === 0 && hours === 0;

  const colorClass = isCritical
    ? 'text-red-400'
    : isWarning
    ? 'text-amber-400'
    : 'text-white/40';

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}h`);
  if (hours > 0 || days > 0) parts.push(`${hours}j`);
  parts.push(`${minutes}m`);
  if (!days) parts.push(`${seconds}d`);

  // suppress tick warning — tick dipakai untuk force re-render
  void tick;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium ${colorClass}`}
    >
      {isCritical ? '🔴' : isWarning ? '🟡' : '🕐'} {parts.join(' ')} lagi
    </span>
  );
}
