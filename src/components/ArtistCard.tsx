import Image from "next/image";
import Link from "next/link";
import { type Artist, type TourDate, type PortfolioImage, type Review } from "@/types/database";
import { format, parseISO } from "date-fns";
import { MapPin } from "lucide-react";

function avgRating(reviews: Review[]): number | null {
  if (!reviews.length) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

function nextTourDate(tourDates: TourDate[]): TourDate | null {
  const now = new Date();
  const upcoming = tourDates
    .filter((td) => parseISO(td.date_to) >= now)
    .sort(
      (a, b) =>
        parseISO(a.date_from).getTime() - parseISO(b.date_from).getTime()
    );
  return upcoming[0] ?? null;
}

interface ArtistCardProps {
  artist: Artist;
  tourDates: TourDate[];
  portfolioImages: PortfolioImage[];
  reviews: Review[];
}

export function ArtistCard({
  artist,
  tourDates,
  portfolioImages,
  reviews,
}: ArtistCardProps) {
  const rating = avgRating(reviews);
  const next = nextTourDate(tourDates);
  const thumbs = portfolioImages.slice(0, 3);

  return (
    <Link
      href={`/artist/${artist.username}`}
      className="block bg-card border border-stroke rounded-xl overflow-hidden hover:border-accent/50 transition-colors"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-stroke">
          {artist.avatar_url && (
            <Image
              src={artist.avatar_url}
              alt={artist.full_name}
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-white truncate">
            {artist.full_name}
          </p>
          {artist.instagram_handle && (
            <p className="text-xs text-muted truncate">
              @{artist.instagram_handle}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          {rating !== null && (
            <span className="text-xs text-accent font-mono">
              ★ {rating.toFixed(1)}
            </span>
          )}
          {next && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-muted" />
              <span className="text-xs text-muted whitespace-nowrap">
                {next.city} · {format(parseISO(next.date_from), "d MMM")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio thumbnails */}
      {thumbs.length > 0 && (
        <div className="grid grid-cols-3 gap-0.5">
          {thumbs.map((img) => (
            <div key={img.id} className="aspect-square relative bg-stroke">
              <Image
                src={img.image_url}
                alt={img.style ?? "Tattoo"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
