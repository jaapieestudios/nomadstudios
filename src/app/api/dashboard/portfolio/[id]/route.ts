import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!artist) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Get image to find storage path
  const { data: image } = await supabase
    .from("portfolio_images")
    .select("image_url, artist_id")
    .eq("id", id)
    .eq("artist_id", artist.id)
    .single();

  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Extract storage path from URL
  const url = new URL(image.image_url);
  const pathParts = url.pathname.split("/portfolio/");
  if (pathParts[1]) {
    await supabase.storage.from("portfolio").remove([pathParts[1]]);
  }

  const { error } = await supabase
    .from("portfolio_images")
    .delete()
    .eq("id", id)
    .eq("artist_id", artist.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
