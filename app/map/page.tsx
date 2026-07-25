'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Search, SlidersHorizontal, MapPin, Loader2, Navigation, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { StationMap } from '@/components/station-map';
import { StationCard } from '@/components/station-card';
import { StationDetail } from '@/components/station-detail';
import { supabase } from '@/lib/supabase';
import { haversineDistance, getChargerSpeedCategory } from '@/lib/demo-data';
import type { Station, Charger, StationWithChargers } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type SpeedFilter = 'all' | 'Normal' | 'Fast' | 'Ultra Fast';
type AvailFilter = 'all' | 'available' | 'free';

const cities = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'];

export default function MapPage() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [speedFilter, setSpeedFilter] = useState<SpeedFilter>('all');
  const [availFilter, setAvailFilter] = useState<AvailFilter>('all');
  const [connectorFilter, setConnectorFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [detailStation, setDetailStation] = useState<StationWithChargers | null>(null);

  useEffect(() => {
    async function loadData() {
      const [sRes, cRes] = await Promise.all([
        supabase.from('stations').select('*').eq('is_active', true),
        supabase.from('chargers').select('*'),
      ]);
      setStations((sRes.data as Station[]) ?? []);
      setChargers((cRes.data as Charger[]) ?? []);
      setLoading(false);
    }
    loadData();
  }, []);

  const stationsWithChargers = useMemo(() => {
    return stations.map((s) => {
      const stationChargers = chargers.filter((c) => c.station_id === s.id);
      const available = stationChargers.filter((c) => c.status === 'available').length;
      return {
        ...s,
        chargers: stationChargers,
        available_count: available,
        total_count: stationChargers.length,
      } as StationWithChargers;
    });
  }, [stations, chargers]);

  const filtered = useMemo(() => {
    return stationsWithChargers.filter((s) => {
      if (selectedCity !== 'All' && s.city !== selectedCity) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.address.toLowerCase().includes(q) && !s.city.toLowerCase().includes(q))
          return false;
      }
      if (availFilter === 'available' && (s.available_count ?? 0) === 0) return false;
      if (availFilter === 'free' && !s.chargers?.some((c) => c.is_free)) return false;
      if (connectorFilter !== 'all' && !s.chargers?.some((c) => c.connector_type === connectorFilter)) return false;
      if (speedFilter !== 'all') {
        const hasSpeed = s.chargers?.some((c) => getChargerSpeedCategory(c.power_kw) === speedFilter);
        if (!hasSpeed) return false;
      }
      return true;
    });
  }, [stationsWithChargers, selectedCity, search, availFilter, connectorFilter, speedFilter]);

  const sorted = useMemo(() => {
    if (!userLocation) return filtered;
    return [...filtered].sort((a, b) => {
      const da = haversineDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
      const db = haversineDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
      return da - db;
    });
  }, [filtered, userLocation]);

  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: 19.076, lng: 72.8777 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation({ lat: 19.076, lng: 72.8777 })
    );
  }, []);

  useEffect(() => {
    handleUseLocation();
  }, [handleUseLocation]);

  const handleBook = (station: StationWithChargers, chargerId: string) => {
    router.push(`/book?station=${station.id}&charger=${chargerId}`);
  };

  const selectedStation = filtered.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col border-r border-border/60 bg-background">
        <div className="p-4 border-b border-border/60 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, city, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  selectedCity === city
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? 'secondary' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Filters
            </Button>
            <Button variant="outline" size="sm" onClick={handleUseLocation}>
              <Navigation className="mr-1.5 h-3.5 w-3.5" />
              Near me
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-3 pt-2 animate-fade-in">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Charging Speed</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(['all', 'Normal', 'Fast', 'Ultra Fast'] as SpeedFilter[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeedFilter(s)}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                        speedFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
                      )}
                    >
                      {s === 'all' ? 'All' : s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Availability</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(['all', 'available', 'free'] as AvailFilter[]).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAvailFilter(a)}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                        availFilter === a ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
                      )}
                    >
                      {a === 'all' ? 'All' : a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Connector Type</p>
                <div className="flex gap-1.5 flex-wrap">
                  {['all', 'CCS', 'CHAdeMO', 'Type2', 'Tesla', 'GB/T'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setConnectorFilter(c)}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                        connectorFilter === c ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
                      )}
                    >
                      {c === 'all' ? 'All' : c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <p className="text-xs text-muted-foreground px-1">
            {filtered.length} station{filtered.length !== 1 ? 's' : ''} found
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No stations match your filters</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => { setSearch(''); setSelectedCity('All'); setSpeedFilter('all'); setAvailFilter('all'); setConnectorFilter('all'); }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            sorted.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                isSelected={station.id === selectedId}
                onClick={() => setSelectedId(station.id)}
                onBook={() => handleBook(station, station.chargers?.find((c) => c.status === 'available')?.id ?? '')}
              />
            ))
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative p-3">
        <StationMap
          stations={filtered}
          selectedId={selectedId}
          onSelect={setSelectedId}
          userLocation={userLocation}
        />
        {selectedStation && (
          <div className="absolute bottom-5 left-5 right-5 lg:right-auto lg:max-w-md z-40 animate-slide-in-right">
            <Card className="p-4 shadow-2xl border-border/60">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedStation.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStation.address}, {selectedStation.city}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm">
                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                  {selectedStation.available_count} available
                </Badge>
                <span className="text-muted-foreground">{selectedStation.total_count} total chargers</span>
              </div>
              <div className="mt-3 flex gap-2">
                <StationDetail
                  station={selectedStation}
                  trigger={<Button variant="outline" size="sm" className="flex-1">Details</Button>}
                  onBook={handleBook}
                />
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleBook(selectedStation, selectedStation.chargers?.find((c) => c.status === 'available')?.id ?? '')}
                >
                  Book Now
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
