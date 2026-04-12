import { type TourDate } from "@/types/database";
import { format, parseISO } from "date-fns";
import { MapPin, Calendar } from "lucide-react";
import Link from "next/link";

interface SlotIndicatorProps {
  total: number;
  booked: number;
}

function SlotIndicator({ total, booked }: SlotIndicatorProps) {
  const remaining = total - booked;
  if (remaining === 0) {
    return (
      <span className="text-xs font-mono text-muted uppercase tracking-wide">
        Full
      </span>
    );
  }
  if (remaining <= 2) {
    return (
      <span className="text-xs font-mono uppercase tracking-wide" style={{ color: "#ff6b35" }}>
        {remaining} slot{remaining !== 1 ? "s" : ""} left
      </span>
    );
  }
  return (
    <span className="text-xs font-mono uppercase tracking-wide text-green-400">
      {remaining} available
    </span>
  );
}

interface TourDateCardProps {
  tourDate: TourDate;
  showBookLink?: boolean;
  artistUsername?: string;
}

export function TourDateCard({
  tourDate,
  showBookLink,
  artistUsername,
}: TourDateCardProps) {
  const dateFrom = parseISO(tourDate.date_from);
  const dateTo = parseISO(tourDate.date_to);
  const isPast = dateTo < new Date();
  const remaining = tourDate.total_slots - tourDate.booked_slots;

  return (
    <div
      className={`bg-card border border-stroke rounded-xl p-4 flex items-start justify-between gap-4 ${
        isPast ? "opacity-50" : ""
      }`}
    >
      <div className="flex gap-3 items-start min-w-0">
        <div
          className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
            isPast
              ? "bg-muted"
              : remaining === 0
              ? "bg-muted"
              : remaining <= 2
              ? "bg-orange"
              : "bg-green-400"
          }`}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-lg tracking-wide text-white">
              {tourDate.city}
            </span>
            <span className="text-xs text-muted">{tourDate.country}</span>
          </div>
          {tourDate.venue_name && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-muted flex-shrink-0" />
              <span className="text-xs text-muted truncate">
                {tourDate.venue_name}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3 text-muted flex-shrink-0" />
            <span className="text-xs text-muted">
              {format(dateFrom, "d MMM")} – {format(dateTo, "d MMM yyyy")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {isPast ? (
          <span className="text-xs font-mono text-muted uppercase tracking-wide">
            Visited
          </span>
        ) : (
          <SlotIndicator total={tourDate.total_slots} booked={tourDate.booked_slots} />
        )}
        {showBookLink && !isPast && remaining > 0 && artistUsername && (
          <Link
            href={`/book/${tourDate.id}`}
            className="text-xs bg-accent text-bg font-mono px-3 py-1 rounded-full hover:bg-white transition-colors"
          >
            Book
          </Link>
        )}
      </div>
    </div>
  );
}
