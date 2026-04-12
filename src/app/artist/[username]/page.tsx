import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { TourDateCard } from "@/components/TourDateCard";
import { ReviewCard } from "@/components/ReviewCard";
import { StyleTag } from "@/components/StyleTag";
import { MessageCircle, Mail, ExternalLink, Link2 } from "lucide-react";
import { type Review } from "@/types/database";

function avgRating(reviews: Review[]): number | null {
  if (!reviews.length) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

function buildContactUrl(
  type: string | null,
  value: string | null
): string | null {
  if (!type || !value) return null;
  switch (type) {
    case "instagram":
      return `https://ig.me/m/${value}`;
    case "whatsapp":
      return `https://wa.me/${value.replace(/\D/g, "")}`;
    case "email":
      return `mailto:${value}`;
    case "custom":
      return value;
    default:
      return null;
  }
}

export default async function ArtistProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: artist } = await supabase
    .from("artists")
    .select("*, tour_dates(*), portfolio_images(*), reviews(*)")
    .eq("username", username)
    .single();

  if (!artist) notFound();

  const rating = avgRating(artist.reviews);
  const contactUrl = buildContactUrl(artist.contact_type, artist.contact_value);

  // Sort tour dates: upcoming first, then past
  const now = new Date();
  const sortedTourDates = [...artist.tour_dates].sort((a, b) => {
    const aDate = new Date(a.date_from);
    const bDate = new Date(b.date_from);
    const aFuture = aDate >= now;
    const bFuture = bDate >= now;
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    return aDate.getTime() - bDate.getTime();
  });

  const sortedImages = [...artist.portfolio_images].sort(
    (a, b) => a.order_index - b.order_index
  );

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Back nav */}
      <nav className="sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-stroke">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-muted hover:text-white transition-colors text-sm">
            ← Back
          </Link>
          <span className="text-stroke">|</span>
          <span className="font-display text-xl text-accent tracking-wide">
            NOMAD STUDIOS
          </span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto">
        {/* Hero header */}
        <div className="relative">
          {/* Blurred background */}
          {artist.avatar_url && (
            <div className="absolute inset-0 h-48 overflow-hidden">
              <Image
                src={artist.avatar_url}
                alt=""
                fill
                className="object-cover blur-2xl opacity-30 scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg" />
            </div>
          )}

          <div className="relative px-4 pt-8 pb-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-stroke mb-4">
              {artist.avatar_url ? (
                <Image
                  src={artist.avatar_url}
                  alt={artist.full_name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-card" />
              )}
            </div>

            <h1 className="font-display text-4xl text-white mb-1">
              {artist.full_name.toUpperCase()}
            </h1>

            {artist.instagram_handle && (
              <a
                href={`https://instagram.com/${artist.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-muted text-sm hover:text-accent transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" />
                @{artist.instagram_handle}
              </a>
            )}

            {rating !== null && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-accent">★★★★★</span>
                <span className="text-white text-sm font-mono">
                  {rating.toFixed(1)}
                </span>
                <span className="text-muted text-xs">
                  ({artist.reviews.length} review{artist.reviews.length !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex overflow-x-auto gap-0 border-y border-stroke">
          {[
            { label: "Years", value: artist.years_experience ?? "—" },
            { label: "Tattoos", value: artist.total_tattoos ?? "—" },
            { label: "Reviews", value: artist.reviews.length },
            { label: "Cities", value: new Set(artist.tour_dates.map((t: { city: string }) => t.city)).size },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 min-w-[80px] flex flex-col items-center py-4 border-r border-stroke last:border-r-0"
            >
              <span className="font-display text-2xl text-white">{stat.value}</span>
              <span className="text-xs text-muted font-mono uppercase tracking-wide mt-0.5">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Style tags */}
        {artist.styles.length > 0 && (
          <div className="px-4 py-4 flex gap-2 overflow-x-auto">
            {artist.styles.map((style: string) => (
              <StyleTag key={style} label={style} />
            ))}
          </div>
        )}

        {/* Bio */}
        {artist.bio && (
          <div className="px-4 py-2 pb-6">
            <p className="text-muted text-sm leading-relaxed">{artist.bio}</p>
          </div>
        )}

        {/* Portfolio */}
        {sortedImages.length > 0 && (
          <div className="border-t border-stroke">
            <PortfolioGrid images={sortedImages} />
          </div>
        )}

        {/* Tour dates */}
        <div id="tour-dates" className="border-t border-stroke px-4 py-6">
          <h2 className="font-display text-2xl text-white mb-4 tracking-wide">
            TOUR DATES
          </h2>
          {sortedTourDates.length === 0 ? (
            <p className="text-muted text-sm">No tour dates yet.</p>
          ) : (
            <div className="space-y-2">
              {sortedTourDates.map((td) => (
                <TourDateCard
                  key={td.id}
                  tourDate={td}
                  showBookLink={true}
                  artistUsername={artist.username}
                />
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        {artist.reviews.length > 0 && (
          <div className="border-t border-stroke px-4 py-6">
            <h2 className="font-display text-2xl text-white mb-4 tracking-wide">
              REVIEWS
            </h2>
            <div className="space-y-3">
              {[...artist.reviews]
                .sort(
                  (a: Review, b: Review) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
                .map((review: Review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-stroke safe-area-pb">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <a
            href="#tour-dates"
            className="flex-1 flex items-center justify-center border border-stroke rounded-xl py-3 text-sm text-muted hover:text-white hover:border-accent transition-colors font-mono"
          >
            All Dates
          </a>
          {contactUrl ? (
            <a
              href={contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-accent text-bg rounded-xl py-3 font-display text-xl hover:bg-white transition-colors"
            >
              {artist.contact_type === "instagram" && <Link2 className="w-4 h-4" />}
              {artist.contact_type === "whatsapp" && <MessageCircle className="w-4 h-4" />}
              {artist.contact_type === "email" && <Mail className="w-4 h-4" />}
              {artist.contact_type === "custom" && <ExternalLink className="w-4 h-4" />}
              BOOK / MESSAGE
            </a>
          ) : (
            <Link
              href={`/book/${sortedTourDates.find((td) => new Date(td.date_to) >= now)?.id ?? ""}`}
              className="flex-1 flex items-center justify-center bg-accent text-bg rounded-xl py-3 font-display text-xl hover:bg-white transition-colors"
            >
              BOOK NOW
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
