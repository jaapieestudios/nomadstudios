import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!artist) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const {
    full_name,
    bio,
    instagram_handle,
    styles,
    contact_type,
    contact_value,
    years_experience,
    total_tattoos,
  } = body;

  const { error } = await supabase
    .from("artists")
    .update({
      full_name,
      bio: bio || null,
      instagram_handle: instagram_handle || null,
      styles: styles ?? [],
      contact_type: contact_type || null,
      contact_value: contact_value || null,
      years_experience: years_experience ?? null,
      total_tattoos: total_tattoos ?? null,
    })
    .eq("id", artist.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
