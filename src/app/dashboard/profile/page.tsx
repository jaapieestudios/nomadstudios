"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";

const STYLES = [
  "Blackwork", "Realism", "Watercolor", "Japanese", "Neo-trad",
  "Minimalist", "Geometric", "Dotwork", "Tribal", "Illustrative",
  "Old School", "New School", "Surrealism", "Abstract", "Botanical",
];

type ContactType = "instagram" | "whatsapp" | "email" | "custom" | null;

interface ProfileForm {
  full_name: string;
  bio: string;
  instagram_handle: string;
  styles: string[];
  contact_type: ContactType;
  contact_value: string;
  years_experience: string;
  total_tattoos: string;
}

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    bio: "",
    instagram_handle: "",
    styles: [],
    contact_type: null,
    contact_value: "",
    years_experience: "",
    total_tattoos: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: artist } = await supabase
        .from("artists")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (!artist) return;

      setArtistId(artist.id);
      setAvatarUrl(artist.avatar_url);
      setForm({
        full_name: artist.full_name ?? "",
        bio: artist.bio ?? "",
        instagram_handle: artist.instagram_handle ?? "",
        styles: artist.styles ?? [],
        contact_type: artist.contact_type ?? null,
        contact_value: artist.contact_value ?? "",
        years_experience: artist.years_experience?.toString() ?? "",
        total_tattoos: artist.total_tattoos?.toString() ?? "",
      });
      setLoading(false);
    }
    load();
  }, []);

  function toggleStyle(style: string) {
    setForm((f) => ({
      ...f,
      styles: f.styles.includes(style)
        ? f.styles.filter((s) => s !== style)
        : [...f.styles, style],
    }));
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !artistId) return;
    setUploadingAvatar(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/dashboard/avatar", { method: "POST", body: fd });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Avatar upload failed");
    } else {
      setAvatarUrl(json.url);
    }
    setUploadingAvatar(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/dashboard/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        years_experience: form.years_experience ? Number(form.years_experience) : null,
        total_tattoos: form.total_tattoos ? Number(form.total_tattoos) : null,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Save failed");
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  const inputClass =
    "w-full bg-bg border border-stroke rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors";
  const labelClass = "block text-xs text-muted uppercase tracking-wide font-mono mb-1.5";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-white tracking-wide mb-6">PROFILE</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-card border border-stroke shrink-0">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-2xl font-display">
              {form.full_name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
            className="flex items-center gap-1.5 border border-stroke text-muted text-xs font-mono uppercase px-4 py-2 rounded-xl hover:text-white hover:border-white/30 transition-colors disabled:opacity-50"
          >
            {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploadingAvatar ? "Uploading..." : "Change photo"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Display name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            rows={4}
            placeholder="Tell people about your work..."
            className="w-full bg-bg border border-stroke rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Years experience</label>
            <input
              type="number"
              min={0}
              value={form.years_experience}
              onChange={(e) => setForm((f) => ({ ...f, years_experience: e.target.value }))}
              placeholder="5"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Total tattoos</label>
            <input
              type="number"
              min={0}
              value={form.total_tattoos}
              onChange={(e) => setForm((f) => ({ ...f, total_tattoos: e.target.value }))}
              placeholder="500"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Instagram handle</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
            <input
              type="text"
              value={form.instagram_handle}
              onChange={(e) => setForm((f) => ({ ...f, instagram_handle: e.target.value }))}
              placeholder="yourhandle"
              className={`${inputClass} pl-8`}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Styles</label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => toggleStyle(style)}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors ${
                  form.styles.includes(style)
                    ? "border-accent text-accent bg-accent/10"
                    : "border-stroke text-muted hover:text-white hover:border-white/30"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Contact method</label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {(["instagram", "whatsapp", "email", "custom"] as ContactType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm((f) => ({ ...f, contact_type: type }))}
                className={`py-2 text-xs font-mono uppercase rounded-xl border transition-colors ${
                  form.contact_type === type
                    ? "border-accent text-accent bg-accent/10"
                    : "border-stroke text-muted hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {form.contact_type && (
            <input
              type="text"
              value={form.contact_value}
              onChange={(e) => setForm((f) => ({ ...f, contact_value: e.target.value }))}
              placeholder={
                form.contact_type === "instagram"
                  ? "Instagram handle"
                  : form.contact_type === "whatsapp"
                  ? "+386 31 123 456"
                  : form.contact_type === "email"
                  ? "your@email.com"
                  : "Contact link or info"
              }
              className={inputClass}
            />
          )}
        </div>

        {error && (
          <p className="text-sm text-orange bg-orange/10 border border-orange/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
            Profile saved!
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-accent text-bg font-display text-xl py-4 rounded-xl hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          SAVE PROFILE
        </button>
      </form>
    </div>
  );
}
