import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let user = null;

  // Importante: redirect() de Next.js funciona lanzando una excepción,
  // así que NO debe llamarse dentro de un try/catch.
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    redirect("/admin/login?error=config");
  }

  if (!user) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
