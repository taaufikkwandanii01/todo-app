"use client";

import { signOut } from "@/lib/auth";
import { LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const name: string =
    (user.user_metadata?.full_name as string) || user.email || "User";
  const avatar: string | undefined = user.user_metadata?.avatar_url as
    | string
    | undefined;

  async function handleSignOut() {
    await signOut();
    window.location.href = "/auth/login";
  }

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between px-6 h-[60px] bg-[#0d0d14]/90 backdrop-blur-md border-b border-white/[0.06]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 select-none">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-400 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-violet-500/20">
          ✦
        </div>
        <span className="text-sm font-extrabold tracking-tight text-white/90">
          TaskFlow
        </span>
      </div>

      {/* User info + sign out */}
      <div className="flex items-center gap-3">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={name}
            width={28}
            height={28}
            className="rounded-full border border-white/10 w-7 h-7 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          /* Fallback avatar dengan inisial nama */
          <div className="w-7 h-7 rounded-full bg-violet-600 border border-white/10 flex items-center justify-center text-[11px] font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-xs text-white/40 hidden sm:block max-w-[160px] truncate">
          {name}
        </span>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20 transition-all cursor-pointer"
        >
          <LogOut size={12} />
          Keluar
        </button>
      </div>
    </nav>
  );
}
