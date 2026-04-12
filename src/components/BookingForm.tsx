"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { type TourDate } from "@/types/database";
import { format, parseISO, eachDayOfInterval } from "date-fns";

const bookingSchema = z.object({
  customer_name: z.string().min(2, "Name must be at least 2 characters"),
  customer_email: z.string().email("Invalid email address"),
  description: z
    .string()
    .min(10, "Please describe your tattoo idea (min 10 characters)")
    .max(500, "Description too long (max 500 characters)"),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  tourDate: TourDate;
}

export function BookingForm({ tourDate }: BookingFormProps) {
  const router = useRouter();
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  // Available days within the tour date window
  const availableDays = eachDayOfInterval({
    start: parseISO(tourDate.date_from),
    end: parseISO(tourDate.date_to),
  }).filter((d) => d >= new Date());

  async function onSubmit(data: BookingFormData) {
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("tour_date_id", tourDate.id);
      formData.append("artist_id", tourDate.artist_id);
      formData.append("customer_name", data.customer_name);
      formData.append("customer_email", data.customer_email);
      formData.append("description", data.description);
      if (data.preferred_date) formData.append("preferred_date", data.preferred_date);
      if (data.preferred_time) formData.append("preferred_time", data.preferred_time);
      if (referenceFile) formData.append("reference_image", referenceFile);

      const res = await fetch("/api/bookings", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Something went wrong");
      }

      router.push(`/book/${tourDate.id}?step=confirm`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Tour date summary */}
      <div className="bg-card border border-stroke rounded-xl p-4">
        <p className="text-xs text-muted uppercase tracking-wide font-mono mb-1">
          Booking for
        </p>
        <p className="font-display text-xl text-white">{tourDate.city}</p>
        <p className="text-sm text-muted">
          {format(parseISO(tourDate.date_from), "d MMM")} –{" "}
          {format(parseISO(tourDate.date_to), "d MMM yyyy")}
          {tourDate.venue_name && ` · ${tourDate.venue_name}`}
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs text-muted uppercase tracking-wide font-mono mb-1.5">
          Your Name
        </label>
        <input
          {...register("customer_name")}
          type="text"
          placeholder="Your full name"
          className="w-full bg-card border border-stroke rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
        {errors.customer_name && (
          <p className="text-xs text-orange mt-1">{errors.customer_name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs text-muted uppercase tracking-wide font-mono mb-1.5">
          Email
        </label>
        <input
          {...register("customer_email")}
          type="email"
          placeholder="your@email.com"
          className="w-full bg-card border border-stroke rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
        {errors.customer_email && (
          <p className="text-xs text-orange mt-1">{errors.customer_email.message}</p>
        )}
      </div>

      {/* Preferred date */}
      {availableDays.length > 0 && (
        <div>
          <label className="block text-xs text-muted uppercase tracking-wide font-mono mb-1.5">
            Preferred Date (optional)
          </label>
          <select
            {...register("preferred_date")}
            className="w-full bg-card border border-stroke rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">No preference</option>
            {availableDays.map((day) => (
              <option key={day.toISOString()} value={format(day, "yyyy-MM-dd")}>
                {format(day, "EEEE, d MMMM yyyy")}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Preferred time */}
      <div>
        <label className="block text-xs text-muted uppercase tracking-wide font-mono mb-1.5">
          Preferred Time (optional)
        </label>
        <select
          {...register("preferred_time")}
          className="w-full bg-card border border-stroke rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">No preference</option>
          <option value="morning">Morning (9am – 12pm)</option>
          <option value="afternoon">Afternoon (12pm – 4pm)</option>
          <option value="evening">Evening (4pm – 7pm)</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-muted uppercase tracking-wide font-mono mb-1.5">
          Tattoo Description
        </label>
        <textarea
          {...register("description")}
          placeholder="Describe the tattoo you want — style, placement, size, any specific ideas or references..."
          rows={5}
          className="w-full bg-card border border-stroke rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
        />
        {errors.description && (
          <p className="text-xs text-orange mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Reference image */}
      <div>
        <label className="block text-xs text-muted uppercase tracking-wide font-mono mb-1.5">
          Reference Image (optional)
        </label>
        <label className="flex items-center gap-3 bg-card border border-stroke border-dashed rounded-xl px-4 py-4 cursor-pointer hover:border-accent transition-colors">
          <Upload className="w-5 h-5 text-muted flex-shrink-0" />
          <span className="text-sm text-muted">
            {referenceFile ? referenceFile.name : "Upload a reference image"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setReferenceFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {/* Deposit info */}
      <div className="bg-stroke/30 border border-stroke rounded-xl p-4">
        <p className="text-xs text-muted font-mono uppercase tracking-wide mb-1">
          Deposit Info
        </p>
        <p className="text-sm text-muted">
          After submitting your inquiry, the artist will contact you to confirm
          the booking and discuss deposit details. Deposit is typically 20–30% of
          the total price.
        </p>
      </div>

      {error && (
        <p className="text-sm text-orange bg-orange/10 border border-orange/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-accent text-bg font-display text-xl py-4 rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Sending..." : "Send Inquiry"}
      </button>
    </form>
  );
}
