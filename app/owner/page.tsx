'use client';

import { useEffect, useState } from 'react';
import {
  Building2, Zap, Calendar, IndianRupee, Plus, Loader2, MapPin, TrendingUp,
  Users, Activity, Edit, Trash2,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { Station, Charger, Booking, StationWithChargers } from '@/lib/types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { STATUS_COLORS, CONNECTOR_COLORS } from '@/lib/demo-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const revenueData = [
  { month: 'Jul', revenue: 45000, sessions: 320 },
  { month: 'Aug', revenue: 52000, sessions: 380 },
  { month: 'Sep', revenue: 48000, sessions: 350 },
  { month: 'Oct', revenue: 61000, sessions: 440 },
  { month: 'Nov', revenue: 58000, sessions: 410 },
  { month: 'Dec', revenue: 67000, sessions: 480 },
];

function OwnerContent() {
  const { user, profile } = useAuth();
  const [stations, setStations] = useState<StationWithChargers[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [addStationOpen, setAddStationOpen] = useState(false);
  const [addChargerFor, setAddChargerFor] = useState<string | null>(null);
  const [newStation, setNewStation] = useState({
    name: '', address: '', city: 'Mumbai', latitude: '19.076', longitude: '72.8777', description: '',
  });
  const [newCharger, setNewCharger] = useState({
    label: '', connectorType: 'CCS' as const, powerKw: '50', pricePerKwh: '18', isFree: false,
  });

  const loadData = async () => {
    if (!user) return;
    const { data: sData } = await supabase.from('stations').select('*').eq('owner_id', user.id);
    const sList = (sData as Station[]) ?? [];
    const { data: cData } = await supabase.from('chargers').select('*').in('station_id', sList.map((s) => s.id));
    const cList = (cData as Charger[]) ?? [];
    setStations(sList.map((s) => ({
      ...s,
      chargers: cList.filter((c) => c.station_id === s.id),
      available_count: cList.filter((c) => c.station_id === s.id && c.status === 'available').length,
      total_count: cList.filter((c) => c.station_id === s.id).length,
    })));
    if (sList.length > 0) {
      const { data: bData } = await supabase.from('bookings').select('*').in('station_id', sList.map((s) => s.id)).order('created_at', { ascending: false }).limit(10);
      setBookings((bData as Booking[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAddStation = async () => {
    if (!user) return;
    const { error } = await supabase.from('stations').insert({
      owner_id: user.id,
      name: newStation.name,
      address: newStation.address,
      city: newStation.city,
      latitude: parseFloat(newStation.latitude),
      longitude: parseFloat(newStation.longitude),
      description: newStation.description,
      is_active: true,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Station added!');
    setAddStationOpen(false);
    setNewStation({ name: '', address: '', city: 'Mumbai', latitude: '19.076', longitude: '72.8777', description: '' });
    loadData();
  };

  const handleAddCharger = async () => {
    if (!addChargerFor) return;
    const { error } = await supabase.from('chargers').insert({
      station_id: addChargerFor,
      label: newCharger.label,
      connector_type: newCharger.connectorType,
      power_kw: parseFloat(newCharger.powerKw),
      price_per_kwh: parseFloat(newCharger.pricePerKwh),
      is_free: newCharger.isFree,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Charger added!');
    setAddChargerFor(null);
    setNewCharger({ label: '', connectorType: 'CCS', powerKw: '50', pricePerKwh: '18', isFree: false });
    loadData();
  };

  const handleToggleChargerStatus = async (charger: Charger) => {
    const next = charger.status === 'available' ? 'occupied' : 'available';
    const { error } = await supabase.from('chargers').update({ status: next }).eq('id', charger.id);
    if (error) { toast.error(error.message); return; }
    loadData();
  };

  if (profile?.role !== 'owner' && profile?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-xl font-bold">Station Owner Access Required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You need a station owner account to access this dashboard. Sign up as a station owner to get started.
        </p>
        <Button asChild className="mt-4"><a href="/signup">Sign up as Owner</a></Button>
      </div>
    );
  }

  const totalRevenue = stations.reduce((a, s) => a + (s.chargers?.reduce((ca, c) => ca + Number(c.price_per_kwh) * 100, 0) ?? 0), 0);
  const totalChargers = stations.reduce((a, s) => a + (s.total_count ?? 0), 0);
  const totalAvailable = stations.reduce((a, s) => a + (s.available_count ?? 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Station Owner Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your charging stations and monitor performance</p>
        </div>
        <Dialog open={addStationOpen} onOpenChange={setAddStationOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Station</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Charging Station</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2"><Label>Station Name</Label><Input value={newStation.name} onChange={(e) => setNewStation({ ...newStation, name: e.target.value })} placeholder="VoltHub Downtown" /></div>
              <div className="space-y-2"><Label>Address</Label><Input value={newStation.address} onChange={(e) => setNewStation({ ...newStation, address: e.target.value })} placeholder="123 Main Street" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>City</Label><Input value={newStation.city} onChange={(e) => setNewStation({ ...newStation, city: e.target.value })} /></div>
                <div className="space-y-2"><Label>Latitude</Label><Input value={newStation.latitude} onChange={(e) => setNewStation({ ...newStation, latitude: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Longitude</Label><Input value={newStation.longitude} onChange={(e) => setNewStation({ ...newStation, longitude: e.target.value })} /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={newStation.description} onChange={(e) => setNewStation({ ...newStation, description: e.target.value })} placeholder="Fast charging hub with cafe" /></div>
              <Button onClick={handleAddStation} className="w-full">Add Station</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Building2, label: 'Stations', value: stations.length, color: 'text-primary' },
          { icon: Zap, label: 'Total Chargers', value: totalChargers, color: 'text-chart-2' },
          { icon: Activity, label: 'Available Now', value: totalAvailable, color: 'text-green-600 dark:text-green-400' },
          { icon: Calendar, label: 'Bookings', value: bookings.length, color: 'text-chart-3' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 border-border/60">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 border-border/60">
          <h3 className="text-sm font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-6 border-border/60">
          <h3 className="text-sm font-semibold mb-4">Monthly Sessions</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="sessions" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Stations management */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : stations.length === 0 ? (
        <Card className="p-12 text-center border-border/60">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No stations yet. Add your first charging station to get started.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {stations.map((station) => (
            <Card key={station.id} className="p-5 border-border/60">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div>
                  <h3 className="font-semibold">{station.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {station.address}, {station.city}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{station.available_count}/{station.total_count} available</Badge>
                  <Dialog open={addChargerFor === station.id} onOpenChange={(o) => setAddChargerFor(o ? station.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Add Charger</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Charger to {station.name}</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                        <div className="space-y-2"><Label>Label</Label><Input value={newCharger.label} onChange={(e) => setNewCharger({ ...newCharger, label: e.target.value })} placeholder="CCS-01" /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Connector Type</Label>
                            <Select value={newCharger.connectorType} onValueChange={(v) => setNewCharger({ ...newCharger, connectorType: v as typeof newCharger.connectorType })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['CCS', 'CHAdeMO', 'Type2', 'Tesla', 'GB/T'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2"><Label>Power (kW)</Label><Input value={newCharger.powerKw} onChange={(e) => setNewCharger({ ...newCharger, powerKw: e.target.value })} type="number" /></div>
                        </div>
                        <div className="space-y-2"><Label>Price (₹/kWh)</Label><Input value={newCharger.pricePerKwh} onChange={(e) => setNewCharger({ ...newCharger, pricePerKwh: e.target.value })} type="number" /></div>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={newCharger.isFree} onChange={(e) => setNewCharger({ ...newCharger, isFree: e.target.checked })} className="h-4 w-4 rounded" />
                          Free charging
                        </label>
                        <Button onClick={handleAddCharger} className="w-full">Add Charger</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {station.chargers?.map((c) => (
                  <div key={c.id} className="rounded-lg border border-border/60 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{c.label}</span>
                      <Badge variant="secondary" className={cn('text-xs capitalize border', STATUS_COLORS[c.status])}>{c.status}</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={cn('rounded border px-1.5 py-0.5 text-[10px] font-medium', CONNECTOR_COLORS[c.connector_type])}>{c.connector_type}</span>
                      <span className="text-xs text-muted-foreground">{c.power_kw}kW</span>
                      <span className="text-xs font-medium">{c.is_free ? 'Free' : `₹${c.price_per_kwh}/kWh`}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full h-7 text-xs"
                      onClick={() => handleToggleChargerStatus(c)}
                    >
                      Toggle {c.status === 'available' ? 'Occupied' : 'Available'}
                    </Button>
                  </div>
                ))}
                {(!station.chargers || station.chargers.length === 0) && (
                  <p className="text-sm text-muted-foreground col-span-full py-4 text-center">No chargers yet. Add one to start accepting bookings.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Recent bookings */}
      {bookings.length > 0 && (
        <Card className="p-6 border-border/60 mt-6">
          <h3 className="text-sm font-semibold mb-4">Recent Bookings</h3>
          <div className="space-y-2">
            {bookings.map((b) => {
              const station = stations.find((s) => s.id === b.station_id);
              return (
                <div key={b.id} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{station?.name ?? 'Station'}</p>
                      <p className="text-xs text-muted-foreground">{b.booking_date} · {b.start_time} – {b.end_time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs capitalize">{b.status}</Badge>
                    <span className="text-sm font-bold">₹{b.amount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function OwnerPage() {
  return (
    <ProtectedRoute>
      <OwnerContent />
    </ProtectedRoute>
  );
}
