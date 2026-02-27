export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/[0.05] bg-[#0a0a0f]/80 backdrop-blur-md mt-auto">
      <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col items-center gap-3">
        {/* Brand Icon & Name */}
        <div className="flex items-center gap-2.5 select-none transition-opacity hover:opacity-80">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/10">
            <span className="text-[10px] text-white">✦</span>
          </div>
          <span className="text-sm font-bold text-white/50 tracking-wider uppercase">
            TaskFlow
          </span>
        </div>

        {/* Copyright & Tagline */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-[11px] text-white/30 tracking-wide font-medium">
            &copy; {year} TaskFlow. Semua tugas, terpantau.
          </p>
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </footer>
  );
}
