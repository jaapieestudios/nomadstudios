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

  const body = await request.json();
  const { city, country, venue_name, date_from, date_to, total_slots, lat, lng } = body;

  const { data, error } = await supabase
    .from("tour_dates")
    .insert({
      artist_id: artist.id,
      city,
      country,
      venue_name: venue_name || null,
      date_from,
      date_to,
      total_slots,
      booked_slots: 0,
      lat,
      lng,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
