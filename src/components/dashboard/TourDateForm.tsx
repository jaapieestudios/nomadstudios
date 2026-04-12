"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface TourDateFormData {
  city: string;
  country: string;
  venue_name: string;
  date_from: string;
  date_to: string;
  total_slots: number;
  lat: number | string;
  lng: number | string;
}

interface Props {
  initialData?: TourDateFormData & { id?: string };
  mode: "create" | "edit";
}

const emptyForm: TourDateFormData = {
  city: "",
  country: "",
  venue_name: "",
  date_from: "",
  date_to: "",
  total_slots: 10,
  lat: "",
  lng: "",
};

export default function TourDateForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<TourDateFormData>(initialData ?? emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "total_slots" ? Number(value) : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = {
      ...form,
      lat: Number(form.lat),
      lng: Number(form.lng),
      total_slots: Number(form.total_slots),
    };

    const url =
      mode === "create"
        ? "/api/dashboard/tour-dates"
        : `/api/dashboard/tour-dates/${(initialData as { id?: string })?.id}`;

    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/dashboard/tour-dates");
    router.refresh();
  }

  const inputClass =
    "w-full bg-bg border border-stroke rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors";
  const labelClass = "block text-xs text-muted uppercase tracking-wide font-mono mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>City</label>
          <input name="city" type="text" value={form.city} onChange={handleChange} required placeholder="Berlin" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Country</label>
          <input name="country" type="text" value={form.country} onChange={handleChange} required placeholder="Germany" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Venue / Studio (optional)</label>
        <input name="venue_name" type="text" value={form.venue_name} onChange={handleChange} placeholder="Studio Name" className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date from</label>
          <input name="date_from" type="date" value={form.date_from} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Date to</label>
          <input name="date_to" type="date" value={form.date_to} onChange={handleChange} required className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Total slots</label>
        <input name="total_slots" type="number" min={1} max={100} value={form.total_slots} onChange={handleChange} required className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Latitude</label>
          <input name="lat" type="number" step="any" value={form.lat} onChange={handleChange} required placeholder="52.52" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Longitude</label>
          <input name="lng" type="number" step="any" value={form.lng} onChange={handleChange} required placeholder="13.405" className={inputClass} />
        </div>
      </div>

      <p className="text-xs text-muted font-mono">
        Tip: find coordinates at{" "}
        <span className="text-accent">maps.google.com</span> → right-click → "What&apos;s here?"
      </p>

      {error && (
        <p className="text-sm text-orange bg-orange/10 border border-orange/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-accent text-bg font-display text-xl py-4 rounded-xl hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === "create" ? "ADD DATE" : "SAVE CHANGES"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 border border-stroke text-muted rounded-xl hover:text-white hover:border-white/30 transition-colors font-mono text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
