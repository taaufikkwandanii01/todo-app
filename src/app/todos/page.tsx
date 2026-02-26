import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TodosClient from "@/components/TodosClient";
import Navbar from "@/components/fragments/Navbar";

export default async function TodosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware seharusnya sudah redirect, ini double-check
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] rounded-full bg-violet-600/5 blur-[100px]" />
      </div>

      <Navbar user={user} />

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <TodosClient user={user} />
      </main>
    </div>
  );
}
