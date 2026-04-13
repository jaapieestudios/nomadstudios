import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!artist) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { image_url, order_index } = await request.json();
  if (!image_url) return NextResponse.json({ error: "No image_url" }, { status: 400 });

  const { data: row, error } = await supabase
    .from("portfolio_images")
    .insert({ artist_id: artist.id, image_url, style: null, order_index })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(row, { status: 201 });
}
