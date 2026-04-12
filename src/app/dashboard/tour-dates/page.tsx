"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface TourDate {
  id: string;
  city: string;
  country: string;
  venue_name: string | null;
  date_from: string;
  date_to: string;
  total_slots: number;
  booked_slots: number;
}

export default function TourDatesPage() {
  const [tourDates, setTourDates] = useState<TourDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

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
      .from("tour_dates")
      .select("*")
      .eq("artist_id", artist.id)
      .order("date_from", { ascending: true });

    setTourDates((data as TourDate[]) ?? []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this tour date?")) return;
    setDeleting(id);
    const res = await fetch(`/api/dashboard/tour-dates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTourDates((prev) => prev.filter((t) => t.id !== id));
    }
    setDeleting(null);
  }

  const now = new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-white tracking-wide">TOUR DATES</h1>
        <Link
          href="/dashboard/tour-dates/new"
          className="flex items-center gap-1.5 bg-accent text-bg font-mono text-xs uppercase px-4 py-2 rounded-xl hover:bg-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add date
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-stroke rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : tourDates.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="font-mono text-sm mb-4">No tour dates yet</p>
          <Link
            href="/dashboard/tour-dates/new"
            className="inline-flex items-center gap-1.5 bg-accent text-bg font-mono text-xs uppercase px-4 py-2 rounded-xl hover:bg-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add your first date
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tourDates.map((td) => {
            const isPast = new Date(td.date_to) < now;
            const remaining = td.total_slots - td.booked_slots;
            return (
              <div
                key={td.id}
                className={`bg-card border rounded-xl p-4 flex items-center justify-between gap-4 ${
                  isPast ? "border-stroke opacity-50" : "border-stroke"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-medium text-sm">
                      {td.city}, {td.country}
                    </p>
                    {isPast && (
                      <span className="text-[10px] font-mono text-muted border border-stroke rounded px-1.5 py-0.5 uppercase">
                        Past
                      </span>
                    )}
                  </div>
                  {td.venue_name && (
                    <p className="text-muted text-xs mt-0.5">{td.venue_name}</p>
                  )}
                  <p className="text-muted text-xs font-mono mt-1">
                    {new Date(td.date_from).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                    {" – "}
                    {new Date(td.date_to).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {" · "}
                    <span
                      className={
                        remaining === 0
                          ? "text-muted"
                          : remaining <= 2
                          ? "text-orange"
                          : "text-green-400"
                      }
                    >
                      {remaining === 0 ? "Full" : `${remaining} slots`}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/dashboard/tour-dates/${td.id}`}
                    className="p-2 text-muted hover:text-white transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(td.id)}
                    disabled={deleting === td.id}
                    className="p-2 text-muted hover:text-orange transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
