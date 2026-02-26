export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/[0.05] bg-[#0a0a0f]/80 backdrop-blur-sm mt-auto">
      <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-violet-400 flex items-center justify-center text-[10px] font-bold text-white">
            ✦
          </div>
          <span className="text-xs font-bold text-white/40 tracking-tight">
            TaskFlow
          </span>
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-white/20 text-center">
          &copy; {year} TaskFlow. Semua tugas, terpantau.
        </p>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-white/20">Sistem aktif</span>
        </div>
      </div>
    </footer>
  );
}
