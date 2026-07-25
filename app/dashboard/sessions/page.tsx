'use client';

import { useEffect, useState } from 'react';
import { Zap, Loader2, MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { ChargingSession, Station } from '@/lib/types';

export default function SessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [stations, setStations] = useState<Record<string, Station>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: sData } = await supabase.from('charging_sessions').select('*').eq('user_id', user.id).order('started_at', { ascending: false });
      setSessions((sData as ChargingSession[]) ?? []);
      const ids = new Set<string>();
      (sData as ChargingSession[])?.forEach((s) => ids.add(s.station_id));
      if (ids.size > 0) {
        const { data: stData } = await supabase.from('stations').select('*').in('id', Array.from(ids));
        const map: Record<string, Station> = {};
        (stData as Station[])?.forEach((s) => { map[s.id] = s; });
        setStations(map);
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <DashboardLayout title="Charging History" subtitle="Your complete charging session records">
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : sessions.length === 0 ? (
        <Card className="p-12 text-center border-border/60">
          <Zap className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No charging sessions yet. Your charging history will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.id} className="p-4 border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{stations[s.station_id]?.name ?? 'Station'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {stations[s.station_id]?.city}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {new Date(s.started_at).toLocaleDateString()} · {s.duration_minutes} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-bold">{Number(s.energy_kwh).toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">kWh</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">{s.start_percent.toFixed(0)}→{s.end_percent.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Charge</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-primary">₹{Number(s.cost).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Cost</p>
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">{s.status}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
