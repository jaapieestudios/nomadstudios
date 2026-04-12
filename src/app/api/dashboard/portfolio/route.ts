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

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  // Get current max order_index
  const { data: existing } = await supabase
    .from("portfolio_images")
    .select("order_index")
    .eq("artist_id", artist.id)
    .order("order_index", { ascending: false })
    .limit(1);

  let nextIndex = (existing?.[0]?.order_index ?? -1) + 1;
  const inserted: { id: string; image_url: string; style: null; order_index: number }[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `${artist.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(path, file);

    if (uploadError) continue;

    const { data: { publicUrl } } = supabase.storage.from("portfolio").getPublicUrl(path);

    const { data: row, error: insertError } = await supabase
      .from("portfolio_images")
      .insert({
        artist_id: artist.id,
        image_url: publicUrl,
        style: null,
        order_index: nextIndex++,
      })
      .select()
      .single();

    if (!insertError && row) {
      inserted.push(row);
    }
  }

  return NextResponse.json({ images: inserted }, { status: 201 });
}
