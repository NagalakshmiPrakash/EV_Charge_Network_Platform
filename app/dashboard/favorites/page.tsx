'use client';

import { Heart, MapPin, Zap, Star, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/dashboard-layout';
import { StationCard } from '@/components/station-card';
import { StationDetail } from '@/components/station-detail';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { Station, Charger, StationWithChargers } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [stations, setStations] = useState<StationWithChargers[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sData } = await supabase.from('stations').select('*').eq('is_active', true).limit(4);
      const sList = (sData as Station[]) ?? [];
      if (sList.length > 0) {
        const { data: cData } = await supabase.from('chargers').select('*').in('station_id', sList.map((s) => s.id));
        const cList = (cData as Charger[]) ?? [];
        setStations(sList.map((s) => ({
          ...s,
          chargers: cList.filter((c) => c.station_id === s.id),
          available_count: cList.filter((c) => c.station_id === s.id && c.status === 'available').length,
          total_count: cList.filter((c) => c.station_id === s.id).length,
        })));
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <DashboardLayout title="Saved Stations" subtitle="Your favorite charging stations for quick access">
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : stations.length === 0 ? (
        <Card className="p-12 text-center border-border/60">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No saved stations yet.</p>
          <Button className="mt-4" variant="outline" onClick={() => window.location.href = '/map'}>Browse Stations</Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {stations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              isSelected={selectedId === station.id}
              onClick={() => setSelectedId(station.id)}
              onBook={() => window.location.href = `/book?station=${station.id}`}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
