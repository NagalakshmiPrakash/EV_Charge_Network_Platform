export type UserRole = 'user' | 'owner' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  reward_points: number;
  created_at: string;
}

export type ChargerStatus = 'available' | 'occupied' | 'offline' | 'maintenance';
export type ConnectorType = 'CCS' | 'CHAdeMO' | 'Type2' | 'Tesla' | 'GB/T';

export interface Station {
  id: string;
  owner_id: string | null;
  name: string;
  description: string | null;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  is_24_hours: boolean;
  amenities: string[];
  photo_url: string | null;
  rating: number;
  total_ratings: number;
  is_active: boolean;
  created_at: string;
}

export interface Charger {
  id: string;
  station_id: string;
  label: string;
  connector_type: ConnectorType;
  power_kw: number;
  status: ChargerStatus;
  price_per_kwh: number;
  is_free: boolean;
  created_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number | null;
  battery_capacity_kwh: number;
  current_battery_percent: number;
  battery_health_percent: number;
  estimated_range_km: number;
  connector_type: ConnectorType;
  created_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  user_id: string;
  station_id: string;
  charger_id: string;
  vehicle_id: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  qr_token: string;
  amount: number;
  created_at: string;
}

export interface ChargingSession {
  id: string;
  user_id: string;
  station_id: string;
  charger_id: string;
  vehicle_id: string | null;
  booking_id: string | null;
  energy_kwh: number;
  cost: number;
  duration_minutes: number;
  start_percent: number;
  end_percent: number;
  status: 'in_progress' | 'completed' | 'failed';
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  station_id: string;
  rating: number;
  comment: string | null;
  photo_urls: string[];
  is_broken_report: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'charging' | 'battery' | 'queue' | 'price' | 'info';
  is_read: boolean;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved' | 'closed';
  created_at: string;
}

export interface StationWithChargers extends Station {
  chargers?: Charger[];
  available_count?: number;
  total_count?: number;
  distance_km?: number;
}
