"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("city", e.target.value);
    } else {
      params.delete("city");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
      <input
        type="text"
        placeholder="Search by city..."
        defaultValue={searchParams.get("city") ?? ""}
        onChange={handleChange}
        className="w-full bg-card border border-stroke rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  );
}
