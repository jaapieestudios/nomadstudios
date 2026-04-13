"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface PortfolioImage {
  id: string;
  image_url: string;
  style: string | null;
  order_index: number;
}

export default function PortfolioPage() {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: artist } = await supabase
      .from("artists")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!artist) return;

    setArtistId(artist.id);

    const { data } = await supabase
      .from("portfolio_images")
      .select("*")
      .eq("artist_id", artist.id)
      .order("order_index", { ascending: true });

    setImages((data as PortfolioImage[]) ?? []);
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || !artistId) return;
    setUploading(true);
    setError(null);

    const supabase = createClient();
    const newImages: PortfolioImage[] = [];
    const nextIndex = images.length;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop();
        const path = `${artistId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        // Upload directly from browser to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("portfolio")
          .upload(path, file, { contentType: file.type });

        if (uploadError) {
          setError(`Upload failed: ${uploadError.message}`);
          break;
        }

        const { data: { publicUrl } } = supabase.storage.from("portfolio").getPublicUrl(path);

        // Save record to DB via API (just the URL, no file)
        const res = await fetch("/api/dashboard/portfolio/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: publicUrl, order_index: nextIndex + i }),
        });

        if (!res.ok) {
          const json = await res.json();
          setError(`Save failed: ${json.error ?? "unknown"}`);
          break;
        }

        const row = await res.json();
        newImages.push(row);
      }

      if (newImages.length > 0) {
        setImages((prev) => [...prev, ...newImages]);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : "unknown"}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image?")) return;
    setDeleting(id);
    const res = await fetch(`/api/dashboard/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== id));
    }
    setDeleting(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-white tracking-wide">PORTFOLIO</h1>
          <p className="text-muted text-xs font-mono mt-0.5">{images.length} images</p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 bg-accent text-bg font-mono text-xs uppercase px-4 py-2 rounded-xl hover:bg-white transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            {uploading ? "Uploading..." : "Add photos"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-orange bg-orange/10 border border-orange/20 rounded-xl px-4 py-3 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-card border border-stroke rounded-xl animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="font-mono text-sm mb-4">No portfolio images yet</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 bg-accent text-bg font-mono text-xs uppercase px-4 py-2 rounded-xl hover:bg-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload your work
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square group">
              <Image
                src={img.image_url}
                alt="Portfolio"
                fill
                className="object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <button
                  onClick={() => handleDelete(img.id)}
                  disabled={deleting === img.id}
                  className="p-2 bg-orange/20 border border-orange/40 text-orange rounded-xl hover:bg-orange/30 transition-colors disabled:opacity-50"
                >
                  {deleting === img.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
