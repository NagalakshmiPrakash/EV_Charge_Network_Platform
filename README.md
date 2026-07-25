# EV Charge Network

AI-powered electric vehicle charging platform. Find charging stations, predict queue times, reserve slots, monitor battery health, and manage payments — all in one intelligent platform.

## Features

### Core Modules
- **Smart Charger Locator** — Interactive map with live availability, filters by charger type/speed/price, station details with reviews and broken-charger reporting
- **Battery Analytics** — Battery percentage, estimated range, health, temperature, charging history, energy consumption, cost analytics, and CO₂ savings with interactive charts
- **AI Queue Prediction** — ML-powered wait time forecasting, best station recommendations, 12-hour forecasts, and station comparisons
- **Slot Booking** — Multi-step reservation flow with QR code confirmation, cancel/reschedule support
- **User Dashboard** — Overview, vehicles, charging sessions, bookings, wallet, rewards/loyalty, notifications, saved stations, profile
- **Station Owner Dashboard** — Add stations, manage chargers, view bookings, revenue analytics, occupancy monitoring
- **Digital Payments** — Wallet system with top-up, transaction ledger, per-session cost tracking
- **Reviews & Ratings** — Star ratings, written reviews, broken charger reports

### Additional Features
- Dark/Light mode with premium green-themed design system
- Responsive mobile-first design
- Role-based access (User, Station Owner, Admin)
- Real-time charger availability status
- Reward points and loyalty tiers
- Support ticket system
- 13 pre-configured vehicle models (Tesla, BYD, Tata, MG, Mahindra, Ather, Ola, Hyundai, Kia)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 13, React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Charts | Recharts |
| Icons | Lucide React |
| Backend/Database | Supabase (PostgreSQL, Auth, RLS) |
| Theme | next-themes |
| Notifications | Sonner |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app runs on `http://localhost:3000`.

### Build

```bash
npm run build
npm start
```

### Type Check

```bash
npm run typecheck
```

## Environment Variables

The Supabase credentials are pre-configured in `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Database Schema

The application uses Supabase (PostgreSQL) with the following tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with roles (user/owner/admin), linked to auth.users |
| `stations` | Charging stations with geo-location, amenities, ratings |
| `chargers` | Individual charger units per station (connector type, power, status, price) |
| `vehicles` | User EVs (make/model, battery capacity, health, range) |
| `bookings` | Reserved charging slots with QR tokens and status lifecycle |
| `charging_sessions` | Historical charging records (energy, cost, duration) |
| `reviews` | Station ratings, comments, and broken-charger reports |
| `notifications` | Per-user alerts (booking, charging, battery, queue, price) |
| `wallets` | User wallet balances (1:1 with users) |
| `wallet_transactions` | Wallet ledger (credit/debit) |
| `support_tickets` | User support requests |

### Row Level Security (RLS)

All tables have RLS enabled with role-based policies:
- **Personal tables** (vehicles, bookings, sessions, notifications, wallets, transactions, tickets): owner-scoped via `auth.uid() = user_id`
- **Public tables** (stations, chargers, reviews): publicly readable; writes are owner-scoped
- **Admin access**: via `is_admin()` SQL helper function
- **Station owners**: can read/write bookings and sessions for stations they own via `is_station_owner_of()` helper

### Helper Functions
- `is_admin()` — returns true if the authenticated user has admin role
- `is_station_owner_of(station_id)` — returns true if the authenticated user owns the station
- `handle_new_user()` — trigger that auto-creates a profile + wallet on signup

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page (marketing) |
| `/map` | Smart charger locator with interactive map |
| `/battery` | Battery analytics dashboard |
| `/queue` | AI queue prediction |
| `/book` | Slot booking flow with QR code |
| `/pricing` | Pricing plans |
| `/contact` | Contact and support |
| `/login` | Sign in |
| `/signup` | Sign up (user or station owner) |
| `/forgot-password` | Password reset |
| `/dashboard` | User dashboard overview |
| `/dashboard/vehicles` | Manage vehicles |
| `/dashboard/sessions` | Charging history |
| `/dashboard/bookings` | View/cancel bookings |
| `/dashboard/wallet` | Wallet and transactions |
| `/dashboard/rewards` | Loyalty rewards and tiers |
| `/dashboard/notifications` | Notifications |
| `/dashboard/favorites` | Saved stations |
| `/dashboard/profile` | Edit profile |
| `/owner` | Station owner dashboard |

## Demo Data

The database is pre-seeded with:
- 12 charging stations across 6 Indian cities (Mumbai, Delhi, Bangalore, Pune, Hyderabad, Chennai)
- 39 chargers with mixed connector types (CCS, CHAdeMO, Type2, Tesla, GB/T) and statuses
- Demo reviews for several stations

## Authentication

Authentication uses Supabase Auth with email/password. New users can sign up as either:
- **EV Owner** — access to locator, booking, battery analytics, and user dashboard
- **Station Owner** — additionally gets access to the station owner dashboard

A database trigger automatically creates a profile and wallet for every new user on signup.

## License

This project is for demonstration purposes.
