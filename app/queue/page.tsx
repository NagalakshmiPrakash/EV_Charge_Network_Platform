'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Clock, Zap, TrendingUp, Navigation, Sparkles, Loader2, Brain, Route, CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { predictQueueLength, predictWaitTime, haversineDistance, getChargerSpeedCategory } from '@/lib/demo-data';
import type { Station, Charger, StationWithChargers } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

export default function QueuePage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);
  const [hour, setHour] = useState(new Date().getHours());
  const [userLat, setUserLat] = useState(19.076);
  const [userLng, setUserLng] = useState(72.8777);

  useEffect(() => {
    (async () => {
      const [sRes, cRes] = await Promise.all([
        supabase.from('stations').select('*').eq('is_active', true),
        supabase.from('chargers').select('*'),
      ]);
      setStations((sRes.data as Station[]) ?? []);
      setChargers((cRes.data as Charger[]) ?? []);
      setLoading(false);
    })();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
        () => {}
      );
    }
  }, []);

  const predictions = useMemo(() => {
    return stations.map((s) => {
      const stationChargers = chargers.filter((c) => c.station_id === s.id);
      const occupied = stationChargers.filter((c) => c.status === 'occupied').length;
      const total = stationChargers.length;
      const queue = predictQueueLength(occupied, total, hour);
      const avgPower = stationChargers.length > 0
        ? stationChargers.reduce((a, c) => a + Number(c.power_kw), 0) / stationChargers.length
        : 50;
      const wait = predictWaitTime(queue, avgPower);
      const distance = haversineDistance(userLat, userLng, s.latitude, s.longitude);
      const available = stationChargers.filter((c) => c.status === 'available').length;
      return {
        ...s,
        chargers: stationChargers,
        available_count: available,
        total_count: total,
        queueLength: queue,
        waitTime: wait,
        distance,
        score: wait === 0 ? 100 - distance * 0.5 : Math.max(0, 100 - wait * 1.5 - distance * 0.3),
      } as StationWithChargers & { queueLength: number; waitTime: number; distance: number; score: number };
    }).sort((a, b) => b.score - a.score);
  }, [stations, chargers, hour, userLat, userLng]);

  const bestStation = predictions[0];
  const chartData = predictions.slice(0, 8).map((p) => ({
    name: p.name.split(' ').slice(-1)[0],
    wait: p.waitTime,
    queue: p.queueLength,
  }));

  const hourlyForecast = useMemo(() => {
    if (!bestStation) return [];
    const occupied = chargers.filter((c) => c.station_id === bestStation.id && c.status === 'occupied').length;
    const total = chargers.filter((c) => c.station_id === bestStation.id).length;
    return Array.from({ length: 12 }).map((_, i) => {
      const h = (hour + i) % 24;
      const q = predictQueueLength(occupied, total, h);
      const avgP = chargers.filter((c) => c.station_id === bestStation.id)
        .reduce((a, c) => a + Number(c.power_kw), 0) /
        Math.max(1, chargers.filter((c) => c.station_id === bestStation.id).length);
      return { hour: `${h}:00`, wait: predictWaitTime(q, avgP), queue: q };
    });
  }, [bestStation, chargers, hour]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Badge variant="secondary" className="mb-3">
          <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
          AI-Powered Prediction
        </Badge>
        <h1 className="text-2xl font-bold">AI Queue Prediction</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Machine learning forecasts for wait times and optimal charging times
        </p>
      </div>

      {/* Controls */}
      <Card className="p-5 mb-6 border-border/60">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Planned Charging Time</Label>
            <Select value={String(hour)} onValueChange={(v) => setHour(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }).map((_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Navigation className="h-3.5 w-3.5" /> Your Location</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Latitude"
                value={userLat.toFixed(4)}
                onChange={(e) => setUserLat(parseFloat(e.target.value) || 0)}
              />
              <Input
                placeholder="Longitude"
                value={userLng.toFixed(4)}
                onChange={(e) => setUserLng(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
                    () => {}
                  );
                }
              }}
            >
              <Navigation className="mr-2 h-4 w-4" />
              Use My Location
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Best recommendation */}
          {bestStation && (
            <Card className="p-6 mb-6 border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                  <Brain className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{bestStation.name}</h2>
                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Recommended
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{bestStation.address}, {bestStation.city}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      <strong>{bestStation.waitTime === 0 ? 'No queue' : `${bestStation.waitTime} min wait`}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Navigation className="h-4 w-4 text-chart-2" />
                      {bestStation.distance.toFixed(1)} km away
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-chart-3" />
                      {bestStation.available_count} / {bestStation.total_count} available
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Hourly forecast */}
            <Card className="p-6 border-border/60">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                12-Hour Forecast — {bestStation?.name.split(' ').slice(-1)[0]}
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hourlyForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(v: number, n: string) => [`${v} ${n === 'wait' ? 'min' : 'in queue'}`, n === 'wait' ? 'Wait Time' : 'Queue']}
                  />
                  <Bar dataKey="wait" radius={[4, 4, 0, 0]}>
                    {hourlyForecast.map((d, i) => (
                      <Cell key={i} fill={d.wait === 0 ? 'hsl(var(--chart-1))' : d.wait < 15 ? 'hsl(var(--chart-2))' : d.wait < 30 ? 'hsl(var(--chart-3))' : 'hsl(var(--destructive))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* All stations comparison */}
            <Card className="p-6 border-border/60">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Route className="h-4 w-4 text-chart-2" />
                Station Comparison — Wait Times
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={70} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(v: number) => [`${v} min`, 'Wait Time']}
                  />
                  <Bar dataKey="wait" radius={[0, 4, 4, 0]}>
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={d.wait === 0 ? 'hsl(var(--chart-1))' : d.wait < 15 ? 'hsl(var(--chart-2))' : d.wait < 30 ? 'hsl(var(--chart-3))' : 'hsl(var(--destructive))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* All predictions list */}
          <Card className="p-6 border-border/60">
            <h3 className="text-sm font-semibold mb-4">All Station Predictions</h3>
            <div className="space-y-2">
              {predictions.map((p, i) => (
                <div
                  key={p.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-4 transition-colors',
                    i === 0 ? 'border-primary/30 bg-primary/5' : 'border-border/60 hover:bg-muted/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold',
                      i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    )}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.distance.toFixed(1)} km · {p.available_count}/{p.total_count} available · {p.queueLength} in queue
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'text-sm font-bold',
                      p.waitTime === 0 ? 'text-green-600 dark:text-green-400' : p.waitTime < 15 ? 'text-chart-2' : p.waitTime < 30 ? 'text-chart-3' : 'text-destructive'
                    )}>
                      {p.waitTime === 0 ? 'No Queue' : `${p.waitTime} min`}
                    </p>
                    {i === 0 && <p className="text-xs text-primary">Best choice</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
