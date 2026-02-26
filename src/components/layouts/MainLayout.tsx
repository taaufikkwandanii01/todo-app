import type { User } from "@supabase/supabase-js";
import Navbar from "../fragments/Navbar";
import Footer from "../fragments/Footer";

interface MainLayoutProps {
  user: User;
  children: React.ReactNode;
}

export default function MainLayout({ user, children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-violet-800/4 blur-[100px]" />
      </div>

      {/* Navbar */}
      <Navbar user={user} />

      {/* Main content — flex-1 agar footer selalu di bawah */}
      <main className="relative z-10 flex-1 w-full max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
