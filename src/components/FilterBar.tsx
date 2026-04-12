"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { StyleTag } from "./StyleTag";

const STYLES = [
  "Black & Grey Realism",
  "Fine Line",
  "Japanese",
  "Traditional",
  "Neo-Trad",
  "Geometric",
  "Watercolor",
];

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const activeStyle = searchParams.get("style") ?? "";

  function handleStyleClick(style: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (activeStyle === style) {
      params.delete("style");
    } else {
      params.set("style", style);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {STYLES.map((style) => (
        <StyleTag
          key={style}
          label={style}
          active={activeStyle === style}
          onClick={() => handleStyleClick(style)}
        />
      ))}
    </div>
  );
}
