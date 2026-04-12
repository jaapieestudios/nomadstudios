"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

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

export default function BookingRow({
  booking,
  onStatusChange,
}: {
  booking: Booking;
  onStatusChange: (id: string, status: "confirmed" | "cancelled") => void;
}) {
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: "confirmed" | "cancelled") {
    setLoading(true);
    const res = await fetch(`/api/dashboard/bookings/${booking.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      onStatusChange(booking.id, status);
    }
    setLoading(false);
  }

  const statusColors = {
    pending: "text-orange border-orange/30 bg-orange/10",
    confirmed: "text-green-400 border-green-400/30 bg-green-400/10",
    cancelled: "text-muted border-stroke bg-card",
  };

  return (
    <div className="bg-card border border-stroke rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-white font-medium text-sm">{booking.customer_name}</p>
          <p className="text-muted text-xs">{booking.customer_email}</p>
        </div>
        <span
          className={`text-[11px] font-mono uppercase px-2 py-1 rounded-lg border ${statusColors[booking.status]}`}
        >
          {booking.status}
        </span>
      </div>

      {booking.tour_dates && (
        <p className="text-xs text-muted font-mono">
          {booking.tour_dates.city}, {booking.tour_dates.country} ·{" "}
          {new Date(booking.tour_dates.date_from).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })}
          {" – "}
          {new Date(booking.tour_dates.date_to).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}

      <p className="text-sm text-white/80 leading-relaxed">{booking.description}</p>

      {(booking.preferred_date || booking.preferred_time) && (
        <p className="text-xs text-muted font-mono">
          Preferred:{" "}
          {booking.preferred_date &&
            new Date(booking.preferred_date).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          {booking.preferred_time && ` at ${booking.preferred_time}`}
        </p>
      )}

      {booking.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => updateStatus("confirmed")}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-bg text-xs font-mono uppercase rounded-lg hover:bg-white transition-colors disabled:opacity-50"
          >
            <Check className="w-3 h-3" />
            Confirm
          </button>
          <button
            onClick={() => updateStatus("cancelled")}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-stroke text-muted text-xs font-mono uppercase rounded-lg hover:text-white hover:border-white/30 transition-colors disabled:opacity-50"
          >
            <X className="w-3 h-3" />
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
