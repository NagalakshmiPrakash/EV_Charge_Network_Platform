'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Zap, Calendar, Wallet, Gift, Car, TrendingUp, ArrowRight, Star, Clock,
  BatteryCharging, Loader2, MapPin,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { Vehicle, Booking, ChargingSession, Station, Wallet as WalletType } from '@/lib/types';
import { cn } from '@/lib/utils';

function OverviewContent() {
  const { user, profile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [stations, setStations] = useState<Record<string, Station>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [vRes, bRes, sRes, wRes] = await Promise.all([
        supabase.from('vehicles').select('*').eq('user_id', user.id),
        supabase.from('bookings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('charging_sessions').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(5),
        supabase.from('wallets').select('*').eq('user_id', user.id).maybeSingle(),
      ]);
      setVehicles((vRes.data as Vehicle[]) ?? []);
      setBookings((bRes.data as Booking[]) ?? []);
      setSessions((sRes.data as ChargingSession[]) ?? []);
      setWallet(wRes.data as WalletType | null);

      const stationIds = new Set<string>();
      (bRes.data as Booking[])?.forEach((b) => stationIds.add(b.station_id));
      (sRes.data as ChargingSession[])?.forEach((s) => stationIds.add(s.station_id));
      if (stationIds.size > 0) {
        const { data: stData } = await supabase.from('stations').select('*').in('id', Array.from(stationIds));
        const map: Record<string, Station> = {};
        (stData as Station[])?.forEach((s) => { map[s.id] = s; });
        setStations(map);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed');
  const totalEnergy = sessions.reduce((a, s) => a + Number(s.energy_kwh), 0);
  const totalCost = sessions.reduce((a, s) => a + Number(s.cost), 0);
  const co2Saved = totalEnergy * 0.4;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name?.split(' ')[0] || 'Driver'}!</h1>
        <p className="text-sm text-muted-foreground mt-1">Here&apos;s your EV charging overview</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Wallet, label: 'Wallet Balance', value: `₹${(wallet?.balance ?? 0).toLocaleString('en-IN')}`, color: 'text-primary' },
          { icon: Gift, label: 'Reward Points', value: profile?.reward_points?.toLocaleString() ?? '0', color: 'text-chart-2' },
          { icon: Zap, label: 'Total Energy', value: `${totalEnergy.toFixed(0)} kWh`, color: 'text-chart-3' },
          { icon: Calendar, label: 'Bookings', value: bookings.length, color: 'text-chart-4' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 border-border/60">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Vehicles */}
        <Card className="p-5 border-border/60">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Your Vehicles</h3>
            <Button variant="ghost" size="sm" asChild><Link href="/dashboard/vehicles">Manage</Link></Button>
          </div>
          {vehicles.length === 0 ? (
            <div className="text-center py-6">
              <Car className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No vehicles added</p>
              <Button size="sm" variant="outline" className="mt-3" asChild>
                <Link href="/battery">Add Vehicle</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.slice(0, 3).map((v) => (
                <div key={v.id} className="rounded-lg border border-border/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{v.make} {v.model}</span>
                    <Badge variant="secondary" className="text-xs">{v.connector_type}</Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Battery</span>
                      <span className="font-medium">{v.current_battery_percent.toFixed(0)}%</span>
                    </div>
                    <Progress value={v.current_battery_percent} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming bookings */}
        <Card className="p-5 border-border/60">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Upcoming Bookings</h3>
            <Button variant="ghost" size="sm" asChild><Link href="/dashboard/bookings">View All</Link></Button>
          </div>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No upcoming bookings</p>
              <Button size="sm" variant="outline" className="mt-3" asChild>
                <Link href="/map">Book a Slot</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingBookings.slice(0, 3).map((b) => (
                <div key={b.id} className="rounded-lg border border-border/60 p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium">{stations[b.station_id]?.name ?? 'Station'}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {b.booking_date} · {b.start_time} – {b.end_time}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Environmental impact */}
        <Card className="p-5 border-border/60">
          <h3 className="font-semibold text-sm mb-3">Environmental Impact</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                <BatteryCharging className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold">{co2Saved.toFixed(0)} kg</p>
                <p className="text-xs text-muted-foreground">CO₂ saved</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold">₹{(totalCost * 3).toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">Saved vs petrol</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold">{sessions.length}</p>
                <p className="text-xs text-muted-foreground">Sessions completed</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent sessions */}
      <Card className="p-5 border-border/60 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Recent Charging Sessions</h3>
          <Button variant="ghost" size="sm" asChild><Link href="/dashboard/sessions">View All</Link></Button>
        </div>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No charging sessions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{stations[s.station_id]?.name ?? 'Station'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.started_at).toLocaleDateString()} · {s.duration_minutes} min
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{Number(s.energy_kwh).toFixed(1)} kWh</p>
                  <p className="text-xs text-muted-foreground">₹{Number(s.cost).toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <Button asChild variant="outline" className="h-20 justify-start p-5">
          <Link href="/map"><MapPin className="mr-3 h-5 w-5 text-primary" /> Find Chargers <ArrowRight className="ml-auto h-4 w-4" /></Link>
        </Button>
        <Button asChild variant="outline" className="h-20 justify-start p-5">
          <Link href="/queue"><TrendingUp className="mr-3 h-5 w-5 text-primary" /> AI Queue <ArrowRight className="ml-auto h-4 w-4" /></Link>
        </Button>
        <Button asChild variant="outline" className="h-20 justify-start p-5">
          <Link href="/battery"><BatteryCharging className="mr-3 h-5 w-5 text-primary" /> Battery <ArrowRight className="ml-auto h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col lg:flex-row">
        <DashboardSidebar />
        <div className="flex-1 min-w-0">
          <OverviewContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}
