"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BookingRow from "@/components/dashboard/BookingRow";

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  description: string;
  preferred_date: string | null;
  preferred_time: string | null;
  status: "pending" | "confirmed" | "cancelled";
  tour_dates: {
    city: string;
    country: string;
    date_from: string;
    date_to: string;
  } | null;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: artist } = await supabase
        .from("artists")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!artist) return;

      const { data } = await supabase
        .from("bookings")
        .select("*, tour_dates(city, country, date_from, date_to)")
        .eq("artist_id", artist.id)
        .order("created_at", { ascending: false });

      setBookings((data as Booking[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  function handleStatusChange(id: string, status: "confirmed" | "cancelled") {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  }

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-white tracking-wide">BOOKINGS</h1>
          {pendingCount > 0 && (
            <p className="text-orange text-sm font-mono mt-0.5">
              {pendingCount} pending {pendingCount === 1 ? "request" : "requests"}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(["all", "pending", "confirmed", "cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-mono uppercase rounded-lg border transition-colors ${
              filter === s
                ? "border-accent text-accent bg-accent/10"
                : "border-stroke text-muted hover:text-white hover:border-white/30"
            }`}
          >
            {s}
            {s !== "all" && (
              <span className="ml-1.5 opacity-60">
                {bookings.filter((b) => b.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-stroke rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="font-mono text-sm">No {filter === "all" ? "" : filter} bookings yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
