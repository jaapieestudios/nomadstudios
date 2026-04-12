"use client";

import Image from "next/image";
import { type PortfolioImage } from "@/types/database";

interface PortfolioGridProps {
  images: PortfolioImage[];
}

export function PortfolioGrid({ images }: PortfolioGridProps) {
  if (!images.length) return null;

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {images.map((img) => (
        <a
          key={img.id}
          href={img.image_url}
          target="_blank"
          rel="noopener noreferrer"
          className="aspect-square relative block overflow-hidden bg-card"
        >
          <Image
            src={img.image_url}
            alt={img.style ?? "Tattoo"}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        </a>
      ))}
    </div>
  );
}
