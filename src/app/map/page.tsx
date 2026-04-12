import { createClient } from "@/lib/supabase/server";
import { MapViewWrapper } from "@/components/MapViewWrapper";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { type TourDateWithArtist } from "@/types/database";

export default async function MapPage() {
  const supabase = await createClient();

  const { data: tourDates } = await supabase
    .from("tour_dates")
    .select("*, artists(username, full_name, avatar_url)")
    .gte("date_to", new Date().toISOString().split("T")[0])
    .order("date_from", { ascending: true });

  return (
    <div className="flex flex-col h-screen bg-bg">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 border-b border-stroke bg-bg flex items-center gap-3">
        <Link
          href="/"
          className="text-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-2xl text-accent tracking-wide">
          WORLD TOUR
        </h1>
        <span className="text-xs text-muted font-mono ml-auto">
          {tourDates?.length ?? 0} upcoming locations
        </span>
      </header>

      {/* Map (fills remaining height) */}
      <div className="flex-1 relative">
        <MapViewWrapper tourDates={(tourDates as TourDateWithArtist[]) ?? []} />
      </div>
    </div>
  );
}
