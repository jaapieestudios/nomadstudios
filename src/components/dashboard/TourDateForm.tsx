"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, CheckCircle } from "lucide-react";

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
  total_slots: 5,
  lat: "",
  lng: "",
};

export default function TourDateForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<TourDateFormData>(initialData ?? emptyForm);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocoded, setGeocoded] = useState(!!initialData?.lat);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "total_slots" ? Number(value) : value }));
    // Reset geocode if city/country changes
    if (name === "city" || name === "country") {
      setGeocoded(false);
      setGeocodeError(null);
    }
  }

  async function handleGeocode() {
    if (!form.city || !form.country) return;
    setGeocoding(true);
    setGeocodeError(null);

    const query = form.venue_name
      ? `${form.venue_name}, ${form.city}, ${form.country}`
      : `${form.city}, ${form.country}`;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();

      if (data.length === 0) {
        setGeocodeError("Location not found. Try a different spelling.");
      } else {
        setForm((f) => ({ ...f, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }));
        setGeocoded(true);
      }
    } catch {
      setGeocodeError("Could not reach location service. Check your connection.");
    }

    setGeocoding(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.lat || !form.lng) {
      setError('Click "Find location" to set the map pin before saving.');
      return;
    }

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
          <input
            name="city"
            type="text"
            value={form.city}
            onChange={handleChange}
            required
            placeholder="Berlin"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Country</label>
          <input
            name="country"
            type="text"
            value={form.country}
            onChange={handleChange}
            required
            placeholder="Germany"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Venue / Studio (optional)</label>
        <input
          name="venue_name"
          type="text"
          value={form.venue_name}
          onChange={handleChange}
          placeholder="Studio Name"
          className={inputClass}
        />
      </div>

      {/* Geocode button */}
      <div>
        <button
          type="button"
          onClick={handleGeocode}
          disabled={geocoding || !form.city || !form.country}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-mono transition-colors disabled:opacity-40 ${
            geocoded
              ? "border-green-400/40 text-green-400 bg-green-400/10"
              : "border-stroke text-muted hover:text-white hover:border-white/30"
          }`}
        >
          {geocoding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : geocoded ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          {geocoding ? "Finding location..." : geocoded ? "Location found" : "Find location"}
        </button>
        {geocodeError && (
          <p className="text-xs text-orange mt-1.5">{geocodeError}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date from</label>
          <input
            name="date_from"
            type="date"
            value={form.date_from}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Date to</label>
          <input
            name="date_to"
            type="date"
            value={form.date_to}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Total slots</label>
        <input
          name="total_slots"
          type="number"
          min={1}
          max={100}
          value={form.total_slots}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>

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
