import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const tour_date_id = formData.get("tour_date_id") as string;
    const artist_id = formData.get("artist_id") as string;
    const customer_name = formData.get("customer_name") as string;
    const customer_email = formData.get("customer_email") as string;
    const description = formData.get("description") as string;
    const preferred_date = (formData.get("preferred_date") as string) || null;
    const preferred_time = (formData.get("preferred_time") as string) || null;
    const referenceImageFile = formData.get("reference_image") as File | null;

    if (!tour_date_id || !artist_id || !customer_name || !customer_email || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    let reference_image_url: string | null = null;

    // Upload reference image if provided
    if (referenceImageFile && referenceImageFile.size > 0) {
      const ext = referenceImageFile.name.split(".").pop();
      const path = `${tour_date_id}/${Date.now()}.${ext}`;
      const arrayBuffer = await referenceImageFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("reference-images")
        .upload(path, buffer, {
          contentType: referenceImageFile.type,
          upsert: false,
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("reference-images")
          .getPublicUrl(path);
        reference_image_url = urlData.publicUrl;
      }
    }

    // Insert booking row
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        tour_date_id,
        artist_id,
        customer_name,
        customer_email,
        description,
        preferred_date: preferred_date || null,
        preferred_time: preferred_time || null,
        reference_image_url,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Booking insert error:", error);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    return NextResponse.json({ id: booking.id }, { status: 201 });
  } catch (err) {
    console.error("Booking route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
