"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CalendarDays, ImageIcon, Inbox, User, LogOut } from "lucide-react";

interface ArtistSnippet {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  subscription_tier: string;
}

const navItems = [
  { href: "/dashboard/bookings", label: "Bookings", icon: Inbox },
  { href: "/dashboard/tour-dates", label: "Tour Dates", icon: CalendarDays },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: ImageIcon },
];

export default function DashboardNav({ artist }: { artist: ArtistSnippet }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-stroke bg-card">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-accent tracking-wide">
          NOMAD
        </Link>

        <div className="flex items-center gap-1 text-xs">
          <span className="text-muted font-mono mr-2">{artist.full_name}</span>
          {artist.subscription_tier === "pro" && (
            <span className="bg-accent text-bg font-mono text-[10px] px-1.5 py-0.5 rounded uppercase">
              Pro
            </span>
          )}
          <button
            onClick={handleLogout}
            className="ml-2 text-muted hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <nav className="max-w-2xl mx-auto px-4 flex gap-1 pb-0">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono uppercase tracking-wide border-b-2 transition-colors ${
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
