export interface Artist {
  id: string;
  username: string;
  full_name: string;
  bio: string | null;
  instagram_handle: string | null;
  avatar_url: string | null;
  years_experience: number | null;
  total_tattoos: number | null;
  styles: string[];
  contact_type: "instagram" | "whatsapp" | "email" | "custom" | null;
  contact_value: string | null;
  created_at: string;
}

export interface TourDate {
  id: string;
  artist_id: string;
  city: string;
  country: string;
  venue_name: string | null;
  date_from: string;
  date_to: string;
  total_slots: number;
  booked_slots: number;
  lat: number;
  lng: number;
  created_at: string;
}

export interface PortfolioImage {
  id: string;
  artist_id: string;
  image_url: string;
  style: string | null;
  order_index: number;
  created_at: string;
}

export interface Booking {
  id: string;
  tour_date_id: string;
  artist_id: string;
  customer_name: string;
  customer_email: string;
  description: string;
  reference_image_url: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: "pending" | "confirmed" | "cancelled";
  deposit_amount: number | null;
  created_at: string;
}

export interface Review {
  id: string;
  artist_id: string;
  booking_id: string | null;
  customer_name: string;
  rating: number;
  text: string;
  created_at: string;
}

// Joined types used in queries
export interface TourDateWithArtist extends TourDate {
  artists: Pick<Artist, "username" | "full_name" | "avatar_url">;
}

export interface ArtistWithDetails extends Artist {
  tour_dates: TourDate[];
  portfolio_images: PortfolioImage[];
  reviews: Review[];
}
