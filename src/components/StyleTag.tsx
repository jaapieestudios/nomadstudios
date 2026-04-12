"use client";

import { cn } from "@/lib/utils";

interface StyleTagProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function StyleTag({ label, active, onClick }: StyleTagProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "px-3 py-1 rounded-full text-xs font-mono border transition-colors whitespace-nowrap",
        active
          ? "bg-accent text-bg border-accent"
          : "bg-card text-muted border-stroke hover:border-accent hover:text-accent"
      )}
    >
      {label}
    </button>
  );
}
