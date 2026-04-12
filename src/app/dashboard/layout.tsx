import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: artist } = await supabase
    .from("artists")
    .select("id, username, full_name, avatar_url, subscription_tier")
    .eq("user_id", user.id)
    .single();

  if (!artist) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <DashboardNav artist={artist} />
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
