'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  BatteryCharging, Thermometer, Heart, TrendingUp, Leaf, DollarSign,
  Zap, Activity, Gauge, Loader2, Car, Plus,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { ProtectedRoute } from '@/components/protected-route';
import type { Vehicle, ChargingSession } from '@/lib/types';
import { VEHICLE_PRESETS } from '@/lib/demo-data';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const monthlyData = [
  { month: 'Jul', energy: 420, cost: 7560, sessions: 12, co2Saved: 168 },
  { month: 'Aug', energy: 380, cost: 6840, sessions: 10, co2Saved: 152 },
  { month: 'Sep', energy: 510, cost: 9180, sessions: 14, co2Saved: 204 },
  { month: 'Oct', energy: 460, cost: 8280, sessions: 11, co2Saved: 184 },
  { month: 'Nov', energy: 590, cost: 10620, sessions: 16, co2Saved: 236 },
  { month: 'Dec', energy: 530, cost: 9540, sessions: 13, co2Saved: 212 },
];

const chargingHistory = [
  { day: 'Mon', percent: 62 }, { day: 'Tue', percent: 45 }, { day: 'Wed', percent: 78 },
  { day: 'Thu', percent: 30 }, { day: 'Fri', percent: 55 }, { day: 'Sat', percent: 88 },
  { day: 'Sun', percent: 42 },
];

const energyDistribution = [
  { name: 'Home Charging', value: 45, color: 'hsl(var(--chart-1))' },
  { name: 'Public Fast', value: 30, color: 'hsl(var(--chart-2))' },
  { name: 'Public Normal', value: 15, color: 'hsl(var(--chart-3))' },
  { name: 'Ultra Fast', value: 10, color: 'hsl(var(--chart-4))' },
];

function BatteryAnalyticsContent() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    presetIdx: '0', make: '', model: '', batteryCapacityKwh: '75',
    rangeKm: '358', connectorType: 'CCS' as const,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [vRes, sRes] = await Promise.all([
        supabase.from('vehicles').select('*').eq('user_id', user.id),
        supabase.from('charging_sessions').select('*').eq('user_id', user.id).order('started_at', { ascending: false }),
      ]);
      setVehicles((vRes.data as Vehicle[]) ?? []);
      setSessions((sRes.data as ChargingSession[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) setSelectedVehicle(vehicles[0]);
  }, [vehicles, selectedVehicle]);

  const stats = useMemo(() => {
    const totalEnergy = sessions.reduce((a, s) => a + Number(s.energy_kwh), 0);
    const totalCost = sessions.reduce((a, s) => a + Number(s.cost), 0);
    const totalDuration = sessions.reduce((a, s) => a + s.duration_minutes, 0);
    const co2Saved = totalEnergy * 0.4;
    return {
      totalEnergy: totalEnergy || 480,
      totalCost: totalCost || 8640,
      totalSessions: sessions.length || 12,
      totalDuration,
      co2Saved,
    };
  }, [sessions]);

  const handleAddVehicle = async () => {
    if (!user) return;
    const idx = parseInt(newVehicle.presetIdx);
    const preset = VEHICLE_PRESETS[idx];
    const { data, error } = await supabase.from('vehicles').insert({
      user_id: user.id,
      make: preset.make,
      model: preset.model,
      battery_capacity_kwh: preset.batteryCapacityKwh,
      estimated_range_km: preset.rangeKm,
      connector_type: preset.connectorType,
      current_battery_percent: 78,
      battery_health_percent: 96,
    }).select().single();
    if (error) {
      toast.error('Could not add vehicle: ' + error.message);
    } else {
      setVehicles([...vehicles, data as Vehicle]);
      setSelectedVehicle(data as Vehicle);
      toast.success(`${preset.make} ${preset.model} added!`);
      setAddOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const batteryPercent = selectedVehicle?.current_battery_percent ?? 78;
  const batteryHealth = selectedVehicle?.battery_health_percent ?? 96;
  const range = selectedVehicle?.estimated_range_km ?? 358;
  const batteryData = [{ name: 'Battery', value: batteryPercent, fill: batteryPercent > 50 ? 'hsl(var(--chart-1))' : batteryPercent > 20 ? 'hsl(var(--chart-3))' : 'hsl(var(--destructive))' }];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Battery Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor your EV battery health and charging insights</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Vehicle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Your Vehicle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Vehicle Model</Label>
                <Select value={newVehicle.presetIdx} onValueChange={(v) => setNewVehicle({ ...newVehicle, presetIdx: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VEHICLE_PRESETS.map((p, i) => (
                      <SelectItem key={i} value={String(i)}>{p.make} {p.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddVehicle} className="w-full">Add Vehicle</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vehicle selector */}
      {vehicles.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVehicle(v)}
              className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all whitespace-nowrap ${
                selectedVehicle?.id === v.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              }`}
            >
              <Car className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{v.make} {v.model}</span>
            </button>
          ))}
        </div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Zap, label: 'Battery Level', value: `${batteryPercent.toFixed(0)}%`, color: 'text-primary' },
          { icon: Gauge, label: 'Est. Range', value: `${Math.round(range * (batteryPercent / 100))} km`, color: 'text-chart-2' },
          { icon: Heart, label: 'Battery Health', value: `${batteryHealth.toFixed(0)}%`, color: 'text-green-600 dark:text-green-400' },
          { icon: Thermometer, label: 'Temperature', value: '28°C', color: 'text-chart-3' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 border-border/60">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Battery gauge */}
        <Card className="p-6 border-border/60">
          <h3 className="text-sm font-semibold mb-4">Battery Level</h3>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={batteryData} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{batteryPercent.toFixed(0)}%</span>
              <span className="text-xs text-muted-foreground">
                {Math.round(range * (batteryPercent / 100))} km left
              </span>
            </div>
          </div>
          {selectedVehicle && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Health</span>
                <span className="font-medium">{batteryHealth.toFixed(0)}%</span>
              </div>
              <Progress value={batteryHealth} className="h-2" />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-medium">{selectedVehicle.battery_capacity_kwh} kWh</span>
              </div>
            </div>
          )}
        </Card>

        {/* Weekly charging pattern */}
        <Card className="p-6 border-border/60 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4">Weekly Charging Pattern</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chargingHistory}>
              <defs>
                <linearGradient id="batteryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                formatter={(v: number) => [`${v}%`, 'Battery']}
              />
              <Area type="monotone" dataKey="percent" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#batteryGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Monthly stats */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 border-border/60">
          <h3 className="text-sm font-semibold mb-4">Monthly Energy Consumption (kWh)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="energy" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-border/60">
          <h3 className="text-sm font-semibold mb-4">Monthly Charging Cost (₹)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="cost" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Energy distribution */}
        <Card className="p-6 border-border/60">
          <h3 className="text-sm font-semibold mb-4">Energy Source Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={energyDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
                {energyDistribution.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {energyDistribution.map((e) => (
              <div key={e.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }} />
                  {e.name}
                </span>
                <span className="font-medium">{e.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Cost & carbon summary */}
        <Card className="p-6 border-border/60">
          <h3 className="text-sm font-semibold mb-4">Savings Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{(stats.co2Saved).toFixed(0)} kg</p>
                <p className="text-xs text-muted-foreground">CO₂ emissions saved</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">₹{(stats.totalCost * 3).toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">Saved vs petrol</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Charging sessions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalEnergy.toFixed(0)} kWh</p>
                <p className="text-xs text-muted-foreground">Total energy consumed</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Battery health trend */}
        <Card className="p-6 border-border/60">
          <h3 className="text-sm font-semibold mb-4">Battery Health Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={[
              { month: 'Jul', health: 98.5 }, { month: 'Aug', health: 98.2 },
              { month: 'Sep', health: 97.8 }, { month: 'Oct', health: 97.4 },
              { month: 'Nov', health: 96.9 }, { month: 'Dec', health: 96.5 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[95, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="health" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <Badge variant="secondary" className="mt-2 text-xs">
            <BatteryCharging className="mr-1 h-3 w-3" />
            Est. degradation: 2% / year
          </Badge>
        </Card>
      </div>
    </div>
  );
}

export default function BatteryPage() {
  return (
    <ProtectedRoute>
      <BatteryAnalyticsContent />
    </ProtectedRoute>
  );
}
