"use client";

import dynamic from "next/dynamic";
import { type TourDateWithArtist } from "@/types/database";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-card flex items-center justify-center">
      <span className="text-muted text-sm font-mono animate-pulse">
        Loading map...
      </span>
    </div>
  ),
});

interface MapViewWrapperProps {
  tourDates: TourDateWithArtist[];
}

export function MapViewWrapper({ tourDates }: MapViewWrapperProps) {
  return <MapView tourDates={tourDates} />;
}
