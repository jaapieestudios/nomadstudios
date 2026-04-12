-- Nomad Studios — Seed Data
-- Run this AFTER running 001_initial_schema.sql

-- Artist: Ravid
insert into artists (id, username, full_name, bio, instagram_handle, avatar_url, years_experience, total_tattoos, styles, contact_type, contact_value)
values (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'ravid.tottooz',
  'Ravid',
  'Travelling tattoo artist specialising in Black & Grey Realism and Fine Line work. Based nowhere, found everywhere. Each piece tells a story — let''s tell yours.',
  'ravid.tottooz',
  'https://i.pravatar.cc/300?u=ravid',
  8,
  420,
  ARRAY['Black & Grey Realism', 'Fine Line'],
  'instagram',
  'ravid.tottooz'
);

-- Tour dates
insert into tour_dates (id, artist_id, city, country, venue_name, date_from, date_to, total_slots, booked_slots, lat, lng)
values
  (
    '00000001-0000-0000-0000-000000000001',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Berlin',
    'Germany',
    'Studio X Berlin',
    '2026-05-10',
    '2026-05-17',
    10,
    3,
    52.5200,
    13.4050
  ),
  (
    '00000002-0000-0000-0000-000000000002',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Amsterdam',
    'Netherlands',
    'INK House Amsterdam',
    '2026-06-03',
    '2026-06-10',
    8,
    7,
    52.3676,
    4.9041
  ),
  (
    '00000003-0000-0000-0000-000000000003',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'London',
    'United Kingdom',
    'East End Tattoo Studio',
    '2026-07-15',
    '2026-07-22',
    12,
    12,
    51.5074,
    -0.1278
  );

-- Portfolio images
insert into portfolio_images (artist_id, image_url, style, order_index)
values
  ('a1b2c3d4-0000-0000-0000-000000000001', 'https://picsum.photos/seed/tat1/600/600', 'Black & Grey Realism', 0),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'https://picsum.photos/seed/tat2/600/600', 'Fine Line', 1),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'https://picsum.photos/seed/tat3/600/600', 'Black & Grey Realism', 2),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'https://picsum.photos/seed/tat4/600/600', 'Fine Line', 3),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'https://picsum.photos/seed/tat5/600/600', 'Black & Grey Realism', 4),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'https://picsum.photos/seed/tat6/600/600', 'Fine Line', 5);

-- Sample bookings
insert into bookings (id, tour_date_id, artist_id, customer_name, customer_email, description, preferred_date, status)
values
  (
    'b0000001-0000-0000-0000-000000000001',
    '00000001-0000-0000-0000-000000000001',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Alex M.',
    'alex@example.com',
    'Black and grey sleeve piece — geometric wolf with fine line details',
    '2026-05-12',
    'confirmed'
  ),
  (
    'b0000002-0000-0000-0000-000000000002',
    '00000002-0000-0000-0000-000000000002',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Sophie K.',
    'sophie@example.com',
    'Fine line floral piece on forearm — roses and lavender',
    '2026-06-05',
    'confirmed'
  );

-- Reviews
insert into reviews (artist_id, booking_id, customer_name, rating, text, created_at)
values
  (
    'a1b2c3d4-0000-0000-0000-000000000001',
    'b0000001-0000-0000-0000-000000000001',
    'Alex M.',
    5,
    'Ravid is an absolute genius. The detail in the shading is insane — everyone stops me on the street to ask about it. Already planning my next piece.',
    now() - interval '45 days'
  ),
  (
    'a1b2c3d4-0000-0000-0000-000000000001',
    'b0000002-0000-0000-0000-000000000002',
    'Sophie K.',
    5,
    'Came to Ravid for a fine line floral and got exactly what I envisioned. The lines are incredibly precise. Super professional and the studio was spotless.',
    now() - interval '20 days'
  ),
  (
    'a1b2c3d4-0000-0000-0000-000000000001',
    null,
    'Marco D.',
    4,
    'Great experience overall. Ravid took time to understand what I wanted and delivered something even better. Only minor thing — booking communication could be a bit faster.',
    now() - interval '10 days'
  );
