import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TourDateForm from "@/components/dashboard/TourDateForm";

export default async function EditTourDatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!artist) redirect("/login");

  const { data: tourDate } = await supabase
    .from("tour_dates")
    .select("*")
    .eq("id", id)
    .eq("artist_id", artist.id)
    .single();

  if (!tourDate) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl text-white tracking-wide mb-6">EDIT TOUR DATE</h1>
      <TourDateForm
        mode="edit"
        initialData={{
          id: tourDate.id,
          city: tourDate.city,
          country: tourDate.country,
          venue_name: tourDate.venue_name ?? "",
          date_from: tourDate.date_from,
          date_to: tourDate.date_to,
          total_slots: tourDate.total_slots,
          lat: tourDate.lat,
          lng: tourDate.lng,
        }}
      />
    </div>
  );
}
