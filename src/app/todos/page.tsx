import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MainLayout from "@/components/layouts/MainLayout";
import TodosClient from "@/components/views/todos/TodosClient";

export default async function TodosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <MainLayout user={user}>
      <TodosClient user={user} />
    </MainLayout>
  );
}
