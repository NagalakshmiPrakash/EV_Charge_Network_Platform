'use client';

import { Zap, Star, MapPin, Clock, BatteryCharging, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CONNECTOR_COLORS, STATUS_COLORS, getChargerSpeedCategory } from '@/lib/demo-data';
import type { StationWithChargers } from '@/lib/types';

interface StationCardProps {
  station: StationWithChargers;
  isSelected: boolean;
  onClick: () => void;
  onBook?: () => void;
}

export function StationCard({ station, isSelected, onClick, onBook }: StationCardProps) {
  const available = station.available_count ?? 0;
  const total = station.total_count ?? 0;
  const connectors = Array.from(new Set(station.chargers?.map((c) => c.connector_type) ?? []));
  const maxPower = Math.max(...(station.chargers?.map((c) => c.power_kw) ?? [0]));

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-4 cursor-pointer transition-all duration-200',
        isSelected
          ? 'border-primary ring-2 ring-primary/20 shadow-md'
          : 'border-border/60 hover:border-primary/30 hover:shadow-sm'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {station.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={station.photo_url}
              alt={station.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Zap className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-xs font-bold">
            {available}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm truncate">{station.name}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium">{station.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {station.address}, {station.city}
          </p>

          <div className="mt-2 flex flex-wrap gap-1">
            {connectors.slice(0, 4).map((c) => (
              <span
                key={c}
                className={cn(
                  'rounded border px-1.5 py-0.5 text-[10px] font-medium',
                  CONNECTOR_COLORS[c]
                )}
              >
                {c}
              </span>
            ))}
            {station.is_24_hours && (
              <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                24/7
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BatteryCharging className="h-3 w-3" />
                {maxPower > 0 ? `${Math.round(maxPower)}kW` : '—'}
              </span>
              <span className={cn(
                'flex items-center gap-1 font-medium',
                available > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
              )}>
                <span className={cn('h-1.5 w-1.5 rounded-full', available > 0 ? 'bg-green-500' : 'bg-orange-500')} />
                {available > 0 ? `${available} available` : 'All occupied'}
              </span>
            </div>
            {onBook && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={(e) => { e.stopPropagation(); onBook(); }}
              >
                Book
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
