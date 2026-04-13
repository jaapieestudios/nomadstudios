import { createClient } from "@/lib/supabase/server";

export const revalidate = 60; // re-fetch at most every 60 seconds
import { ArtistCard } from "@/components/ArtistCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { Suspense } from "react";
import Link from "next/link";
import { Map } from "lucide-react";
import { parseISO } from "date-fns";

interface SearchParams {
  city?: string;
  style?: string;
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let artistQuery = supabase
    .from("artists")
    .select("*, tour_dates(*), portfolio_images(id, image_url, order_index), reviews(id, rating)");

  if (params.style) {
    artistQuery = artistQuery.contains("styles", [params.style]);
  }

  const { data: artists } = await artistQuery.order("created_at", {
    ascending: false,
  });

  // Filter by city based on upcoming tour dates
  const filtered = (artists ?? []).filter((artist) => {
    if (!params.city) return true;
    const cityLower = params.city.toLowerCase();
    return artist.tour_dates.some(
      (td: { city: string; date_to: string }) =>
        td.city.toLowerCase().includes(cityLower) &&
        parseISO(td.date_to) >= new Date()
    );
  });

  return (
    <main className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-stroke">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-display text-2xl tracking-wide text-accent">
            NOMAD STUDIOS
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/map"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors font-mono"
            >
              <Map className="w-4 h-4" />
              Map
            </Link>
            <Link
              href="/login"
              className="text-xs text-muted hover:text-accent transition-colors font-mono"
            >
              Artist login
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4">
        {/* Hero */}
        <div className="pt-10 pb-8">
          <h1 className="font-display text-6xl sm:text-8xl leading-none mb-2">
            FIND YOUR
            <br />
            <span className="text-accent">ARTIST</span>
          </h1>
          <p className="text-muted text-sm mt-3">
            Travelling tattoo artists — wherever they are, whenever you&apos;re ready.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="space-y-3 mb-8">
          <Suspense>
            <SearchBar />
          </Suspense>
          <Suspense>
            <FilterBar />
          </Suspense>
        </div>

        {/* Results info */}
        <div className="mb-4">
          <span className="text-xs text-muted font-mono uppercase tracking-wide">
            {filtered.length} artist{filtered.length !== 1 ? "s" : ""}
            {params.city ? ` in ${params.city}` : ""}
            {params.style ? ` · ${params.style}` : ""}
          </span>
        </div>

        {/* Artist grid */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted text-sm">No artists found.</p>
            <Link
              href="/"
              className="text-xs text-accent mt-2 inline-block hover:underline"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-12">
            {filtered.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                tourDates={artist.tour_dates}
                portfolioImages={artist.portfolio_images}
                reviews={artist.reviews}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
