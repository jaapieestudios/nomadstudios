"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    username: "",
    instagram_handle: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError || !authData.user) {
      setError(authError?.message ?? "Registration failed");
      setLoading(false);
      return;
    }

    // 2. Create artist profile
    const { error: profileError } = await supabase.from("artists").insert({
      user_id: authData.user.id,
      username: form.username.toLowerCase().trim(),
      full_name: form.full_name.trim(),
      instagram_handle: form.instagram_handle.trim() || null,
      styles: [],
      contact_type: form.instagram_handle ? "instagram" : null,
      contact_value: form.instagram_handle || null,
    });

    if (profileError) {
      setError(
        profileError.message.includes("unique")
          ? "That username is already taken. Please choose another."
          : profileError.message
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard/profile");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl text-accent tracking-wide">
            NOMAD STUDIOS
          </Link>
          <p className="text-muted text-sm mt-2">Create your artist profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wide font-mono mb-1.5">
              Display name
            </label>
            <input
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              required
              placeholder="Ravid"
              className="w-full bg-card border border-stroke rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-muted uppercase tracking-wide font-mono mb-1.5">
              Username (your profile URL)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">
                nomadstudios.com/artist/
              </span>
              <input
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="ravid.tottooz"
                className="w-full bg-card border border-stroke rounded-xl pl-[200px] pr-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted uppercase tracking-wide font-mono mb-1.5">
              Instagram handle (optional)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
              <input
                name="instagram_handle"
                type="text"
                value={form.instagram_handle}
                onChange={handleChange}
                placeholder="ravid.tottooz"
                className="w-full bg-card border border-stroke rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted uppercase tracking-wide font-mono mb-1.5">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              className="w-full bg-card border border-stroke rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-muted uppercase tracking-wide font-mono mb-1.5">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="min. 6 characters"
              className="w-full bg-card border border-stroke rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-orange bg-orange/10 border border-orange/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-bg font-display text-xl py-4 rounded-xl hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            CREATE ACCOUNT
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
