-- Nomad Studios — Artist Auth Migration
-- Run in Supabase SQL Editor

-- Add user_id and subscription_tier to artists
alter table artists add column if not exists user_id uuid references auth.users on delete set null;
alter table artists add column if not exists subscription_tier text not null default 'free';

-- RLS write policies for artists
create policy "Artist manages own profile" on artists
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS write policies for tour_dates
create policy "Artist manages own tour_dates" on tour_dates
  for all using (
    artist_id in (select id from artists where user_id = auth.uid())
  )
  with check (
    artist_id in (select id from artists where user_id = auth.uid())
  );

-- RLS write policies for portfolio_images
create policy "Artist manages own portfolio" on portfolio_images
  for all using (
    artist_id in (select id from artists where user_id = auth.uid())
  )
  with check (
    artist_id in (select id from artists where user_id = auth.uid())
  );

-- RLS for bookings (artist reads + updates own)
create policy "Artist reads own bookings" on bookings
  for select using (
    artist_id in (select id from artists where user_id = auth.uid())
  );

create policy "Artist updates own bookings" on bookings
  for update using (
    artist_id in (select id from artists where user_id = auth.uid())
  );

-- Storage buckets
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true) on conflict do nothing;
