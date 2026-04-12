"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Image from "next/image";
import Link from "next/link";
import { type TourDateWithArtist } from "@/types/database";
import { format, parseISO } from "date-fns";

function SlotBadge({ total, booked }: { total: number; booked: number }) {
  const remaining = total - booked;
  if (remaining === 0)
    return <span className="text-xs text-muted font-mono">Full</span>;
  if (remaining <= 2)
    return (
      <span className="text-xs font-mono" style={{ color: "#ff6b35" }}>
        {remaining} left
      </span>
    );
  return (
    <span className="text-xs text-green-400 font-mono">{remaining} slots</span>
  );
}

type DateFilter = "all" | "this-month" | "next-month";

interface MapViewProps {
  tourDates: TourDateWithArtist[];
}

export default function MapView({ tourDates }: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<DateFilter>("all");

  useEffect(() => {
    setMounted(true);
    // Fix Leaflet default marker icons broken by webpack
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "/leaflet/marker-icon.png",
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    });
  }, []);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const nextMonth = (thisMonth + 1) % 12;
  const nextMonthYear = thisMonth === 11 ? thisYear + 1 : thisYear;

  const filtered = tourDates.filter((td) => {
    const from = parseISO(td.date_from);
    if (filter === "all") return from >= now;
    if (filter === "this-month")
      return (
        from.getMonth() === thisMonth && from.getFullYear() === thisYear
      );
    if (filter === "next-month")
      return (
        from.getMonth() === nextMonth && from.getFullYear() === nextMonthYear
      );
    return true;
  });

  if (!mounted) {
    return (
      <div className="w-full h-full bg-card animate-pulse flex items-center justify-center">
        <span className="text-muted text-sm font-mono">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Date filter */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-1 bg-card/90 backdrop-blur border border-stroke rounded-full p-1">
        {(["all", "this-month", "next-month"] as DateFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
              filter === f
                ? "bg-accent text-bg"
                : "text-muted hover:text-white"
            }`}
          >
            {f === "all" ? "All" : f === "this-month" ? "This month" : "Next month"}
          </button>
        ))}
      </div>

      <MapContainer
        center={[50, 10]}
        zoom={4}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {filtered.map((td) => (
          <Marker key={td.id} position={[td.lat, td.lng]}>
            <Popup>
              <div className="min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  {td.artists.avatar_url && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={td.artists.avatar_url}
                        alt={td.artists.full_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{td.artists.full_name}</p>
                    <p className="text-xs text-gray-500">{td.city}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-1">
                  {format(parseISO(td.date_from), "d MMM")} –{" "}
                  {format(parseISO(td.date_to), "d MMM yyyy")}
                </p>
                <div className="flex items-center justify-between">
                  <SlotBadge total={td.total_slots} booked={td.booked_slots} />
                  <Link
                    href={`/artist/${td.artists.username}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
