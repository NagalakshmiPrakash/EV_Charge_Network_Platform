/*
# EV Charge Network — Core Schema

## Overview
Full data model for an EV charging platform with three roles (user, owner, admin).
Tables: profiles, stations, chargers, vehicles, bookings, charging_sessions, reviews,
notifications, wallets, wallet_transactions, support_tickets. Includes auto-profile
trigger on signup and helper functions for RLS.

## Ordering rationale
Tables created first, then helper functions (is_admin, is_station_owner_of) that
reference them, then RLS + policies that reference the functions, then the trigger.

## Security (RLS)
- Every table RLS-enabled with 4 CRUD policies.
- Personal tables owner-scoped via auth.uid() = user_id.
- Stations/chargers/reviews publicly readable (locator works without sign-in); writes owner-scoped.
- Admins get full access via is_admin(). Station owners access bookings/sessions for their stations.

## Notes
- owner_id nullable on stations (null = platform/demo station).
- user_id columns default to auth.uid() so client inserts omitting owner still pass RLS.
*/

-- ============ TABLES (created first) ============
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','owner','admin')),
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  phone text,
  reward_points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  address text NOT NULL,
  city text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  is_24_hours boolean NOT NULL DEFAULT false,
  amenities text[] NOT NULL DEFAULT '{}',
  photo_url text,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  total_ratings integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chargers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Charger',
  connector_type text NOT NULL CHECK (connector_type IN ('CCS','CHAdeMO','Type2','Tesla','GB/T')),
  power_kw numeric(6,1) NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','offline','maintenance')),
  price_per_kwh numeric(8,2) NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  make text NOT NULL,
  model text NOT NULL,
  year integer,
  battery_capacity_kwh numeric(6,1) NOT NULL,
  current_battery_percent numeric(4,1) NOT NULL DEFAULT 80,
  battery_health_percent numeric(4,1) NOT NULL DEFAULT 100,
  estimated_range_km integer NOT NULL DEFAULT 300,
  connector_type text NOT NULL DEFAULT 'CCS',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  station_id uuid NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  charger_id uuid NOT NULL REFERENCES public.chargers(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  qr_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12),'hex'),
  amount numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.charging_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  station_id uuid NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  charger_id uuid NOT NULL REFERENCES public.chargers(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  energy_kwh numeric(8,2) NOT NULL DEFAULT 0,
  cost numeric(10,2) NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 0,
  start_percent numeric(4,1) NOT NULL DEFAULT 0,
  end_percent numeric(4,1) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress','completed','failed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  station_id uuid NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  photo_urls text[] NOT NULL DEFAULT '{}',
  is_broken_report boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('booking','charging','battery','queue','price','info')),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('credit','debit')),
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_stations_city ON public.stations(city);
CREATE INDEX IF NOT EXISTS idx_stations_owner ON public.stations(owner_id);
CREATE INDEX IF NOT EXISTS idx_stations_geo ON public.stations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_chargers_station ON public.chargers(station_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_user ON public.vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_station ON public.bookings(station_id);
CREATE INDEX IF NOT EXISTS idx_bookings_charger_date ON public.bookings(charger_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.charging_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_station ON public.charging_sessions(station_id);
CREATE INDEX IF NOT EXISTS idx_reviews_station ON public.reviews(station_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_wtx_user ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.support_tickets(user_id);

-- ============ HELPER FUNCTIONS (tables now exist) ============
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_station_owner_of(p_station_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stations
    WHERE id = p_station_id AND owner_id = auth.uid()
  );
$$;

-- ============ RLS ENABLE ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chargers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charging_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES ============

-- profiles
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- stations (public read, owner/admin write)
DROP POLICY IF EXISTS "select_stations_public" ON public.stations;
CREATE POLICY "select_stations_public" ON public.stations FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_stations" ON public.stations;
CREATE POLICY "insert_own_stations" ON public.stations FOR INSERT
  TO authenticated WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "update_own_stations" ON public.stations;
CREATE POLICY "update_own_stations" ON public.stations FOR UPDATE
  TO authenticated USING (owner_id = auth.uid() OR public.is_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "delete_own_stations" ON public.stations;
CREATE POLICY "delete_own_stations" ON public.stations FOR DELETE
  TO authenticated USING (owner_id = auth.uid() OR public.is_admin());

-- chargers (public read, owner write)
DROP POLICY IF EXISTS "select_chargers_public" ON public.chargers;
CREATE POLICY "select_chargers_public" ON public.chargers FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_chargers_owner" ON public.chargers;
CREATE POLICY "insert_chargers_owner" ON public.chargers FOR INSERT
  TO authenticated WITH CHECK (public.is_station_owner_of(station_id));
DROP POLICY IF EXISTS "update_chargers_owner" ON public.chargers;
CREATE POLICY "update_chargers_owner" ON public.chargers FOR UPDATE
  TO authenticated USING (public.is_station_owner_of(station_id))
  WITH CHECK (public.is_station_owner_of(station_id));
DROP POLICY IF EXISTS "delete_chargers_owner" ON public.chargers;
CREATE POLICY "delete_chargers_owner" ON public.chargers FOR DELETE
  TO authenticated USING (public.is_station_owner_of(station_id));

-- vehicles (owner-scoped)
DROP POLICY IF EXISTS "select_own_vehicles" ON public.vehicles;
CREATE POLICY "select_own_vehicles" ON public.vehicles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_vehicles" ON public.vehicles;
CREATE POLICY "insert_own_vehicles" ON public.vehicles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_vehicles" ON public.vehicles;
CREATE POLICY "update_own_vehicles" ON public.vehicles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_vehicles" ON public.vehicles;
CREATE POLICY "delete_own_vehicles" ON public.vehicles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- bookings (owner + station owner + admin)
DROP POLICY IF EXISTS "select_own_bookings" ON public.bookings;
CREATE POLICY "select_own_bookings" ON public.bookings FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR public.is_station_owner_of(station_id) OR public.is_admin()
  );
DROP POLICY IF EXISTS "insert_own_bookings" ON public.bookings;
CREATE POLICY "insert_own_bookings" ON public.bookings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_bookings" ON public.bookings;
CREATE POLICY "update_own_bookings" ON public.bookings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_station_owner_of(station_id) OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_station_owner_of(station_id) OR public.is_admin());
DROP POLICY IF EXISTS "delete_own_bookings" ON public.bookings;
CREATE POLICY "delete_own_bookings" ON public.bookings FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_station_owner_of(station_id) OR public.is_admin());

-- charging_sessions
DROP POLICY IF EXISTS "select_own_sessions" ON public.charging_sessions;
CREATE POLICY "select_own_sessions" ON public.charging_sessions FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR public.is_station_owner_of(station_id) OR public.is_admin()
  );
DROP POLICY IF EXISTS "insert_own_sessions" ON public.charging_sessions;
CREATE POLICY "insert_own_sessions" ON public.charging_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_sessions" ON public.charging_sessions;
CREATE POLICY "update_own_sessions" ON public.charging_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_station_owner_of(station_id) OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_station_owner_of(station_id) OR public.is_admin());
DROP POLICY IF EXISTS "delete_own_sessions" ON public.charging_sessions;
CREATE POLICY "delete_own_sessions" ON public.charging_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- reviews (public read, owner write)
DROP POLICY IF EXISTS "select_reviews_public" ON public.reviews;
CREATE POLICY "select_reviews_public" ON public.reviews FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_reviews" ON public.reviews;
CREATE POLICY "insert_own_reviews" ON public.reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_reviews" ON public.reviews;
CREATE POLICY "update_own_reviews" ON public.reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_reviews" ON public.reviews;
CREATE POLICY "delete_own_reviews" ON public.reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- notifications (owner-scoped)
DROP POLICY IF EXISTS "select_own_notifications" ON public.notifications;
CREATE POLICY "select_own_notifications" ON public.notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON public.notifications;
CREATE POLICY "insert_own_notifications" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON public.notifications;
CREATE POLICY "update_own_notifications" ON public.notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON public.notifications;
CREATE POLICY "delete_own_notifications" ON public.notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- wallets (owner-scoped)
DROP POLICY IF EXISTS "select_own_wallet" ON public.wallets;
CREATE POLICY "select_own_wallet" ON public.wallets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_wallet" ON public.wallets;
CREATE POLICY "insert_own_wallet" ON public.wallets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_wallet" ON public.wallets;
CREATE POLICY "update_own_wallet" ON public.wallets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_wallet" ON public.wallets;
CREATE POLICY "delete_own_wallet" ON public.wallets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- wallet_transactions (owner-scoped)
DROP POLICY IF EXISTS "select_own_wtx" ON public.wallet_transactions;
CREATE POLICY "select_own_wtx" ON public.wallet_transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_wtx" ON public.wallet_transactions;
CREATE POLICY "insert_own_wtx" ON public.wallet_transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_wtx" ON public.wallet_transactions;
CREATE POLICY "update_own_wtx" ON public.wallet_transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_wtx" ON public.wallet_transactions;
CREATE POLICY "delete_own_wtx" ON public.wallet_transactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- support_tickets (owner + admin)
DROP POLICY IF EXISTS "select_own_tickets" ON public.support_tickets;
CREATE POLICY "select_own_tickets" ON public.support_tickets FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "insert_own_tickets" ON public.support_tickets;
CREATE POLICY "insert_own_tickets" ON public.support_tickets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_tickets" ON public.support_tickets;
CREATE POLICY "update_own_tickets" ON public.support_tickets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "delete_own_tickets" ON public.support_tickets;
CREATE POLICY "delete_own_tickets" ON public.support_tickets FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- ============ AUTO-PROFILE TRIGGER ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  INSERT INTO public.wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();