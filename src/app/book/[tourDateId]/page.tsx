import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookingForm } from "@/components/BookingForm";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";

interface PageProps {
  params: Promise<{ tourDateId: string }>;
  searchParams: Promise<{ step?: string }>;
}

export default async function BookingPage({
  params,
  searchParams,
}: PageProps) {
  const { tourDateId } = await params;
  const { step } = await searchParams;

  const supabase = await createClient();

  const { data: tourDate } = await supabase
    .from("tour_dates")
    .select("*, artists(username, full_name, avatar_url)")
    .eq("id", tourDateId)
    .single();

  if (!tourDate) notFound();

  const artist = (tourDate as any).artists;

  // Confirmation screen
  if (step === "confirm") {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-6" />
          <h1 className="font-display text-4xl text-white mb-3">
            INQUIRY SENT
          </h1>
          <p className="text-muted text-sm leading-relaxed mb-8">
            {artist?.full_name} will be in touch via email to confirm your
            booking and discuss details.
          </p>
          <div className="bg-card border border-stroke rounded-xl p-4 mb-8 text-left">
            <p className="text-xs text-muted font-mono uppercase tracking-wide mb-2">
              Your appointment
            </p>
            <p className="font-display text-2xl text-white">{tourDate.city}</p>
            <p className="text-sm text-muted">
              {format(parseISO(tourDate.date_from), "d MMM")} –{" "}
              {format(parseISO(tourDate.date_to), "d MMM yyyy")}
            </p>
          </div>
          <Link
            href={`/artist/${artist?.username}`}
            className="inline-flex items-center justify-center w-full bg-accent text-bg font-display text-xl py-4 rounded-xl hover:bg-white transition-colors"
          >
            BACK TO PROFILE
          </Link>
        </div>
      </div>
    );
  }

  const remaining = tourDate.total_slots - tourDate.booked_slots;

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-stroke">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href={`/artist/${artist?.username}`}
            className="text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-display text-xl text-accent tracking-wide">
            BOOK A SLOT
          </span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
        {remaining <= 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg mb-4">This tour date is fully booked.</p>
            <Link
              href={`/artist/${artist?.username}`}
              className="text-accent text-sm hover:underline"
            >
              View other dates →
            </Link>
          </div>
        ) : (
          <BookingForm tourDate={tourDate} />
        )}
      </div>
    </div>
  );
}
