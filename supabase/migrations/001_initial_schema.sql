-- Nomad Studios — Initial Schema
-- Run this in Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- Artists
create table artists (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  full_name text not null,
  bio text,
  instagram_handle text,
  avatar_url text,
  years_experience integer,
  total_tattoos integer,
  styles text[] not null default '{}',
  contact_type text check (contact_type in ('instagram', 'whatsapp', 'email', 'custom')),
  contact_value text,
  created_at timestamptz default now()
);

-- Tour dates
create table tour_dates (
  id uuid primary key default uuid_generate_v4(),
  artist_id uuid references artists(id) on delete cascade,
  city text not null,
  country text not null,
  venue_name text,
  date_from date not null,
  date_to date not null,
  total_slots integer not null default 10,
  booked_slots integer not null default 0,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz default now()
);

-- Portfolio images
create table portfolio_images (
  id uuid primary key default uuid_generate_v4(),
  artist_id uuid references artists(id) on delete cascade,
  image_url text not null,
  style text,
  order_index integer not null default 0,
  created_at timestamptz default now()
);

-- Bookings
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  tour_date_id uuid references tour_dates(id) on delete cascade,
  artist_id uuid references artists(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  description text not null,
  reference_image_url text,
  preferred_date date,
  preferred_time text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  deposit_amount numeric(10, 2),
  created_at timestamptz default now()
);

-- Reviews
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  artist_id uuid references artists(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table artists enable row level security;
alter table tour_dates enable row level security;
alter table portfolio_images enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;

-- Public read policies
create policy "Public read artists" on artists for select using (true);
create policy "Public read tour_dates" on tour_dates for select using (true);
create policy "Public read portfolio_images" on portfolio_images for select using (true);
create policy "Public read reviews" on reviews for select using (true);

-- Bookings: anyone can submit an inquiry
create policy "Anyone can insert bookings" on bookings for insert with check (true);

-- Supabase Storage bucket for reference images
-- Create manually in Supabase dashboard: Storage → New bucket → "reference-images" (public)
