'use client';

import { useMemo, useState, useRef } from 'react';
import { Zap, Plus, Minus, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StationWithChargers } from '@/lib/types';

interface StationMapProps {
  stations: StationWithChargers[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export function StationMap({ stations, selectedId, onSelect, userLocation }: StationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const bounds = useMemo(() => {
    if (stations.length === 0) {
      return { minLat: 8, maxLat: 35, minLng: 68, maxLng: 92 };
    }
    const lats = stations.map((s) => s.latitude);
    const lngs = stations.map((s) => s.longitude);
    const minLat = Math.min(...lats, userLocation?.lat ?? 19);
    const maxLat = Math.max(...lats, userLocation?.lat ?? 19);
    const minLng = Math.min(...lngs, userLocation?.lng ?? 73);
    const maxLng = Math.max(...lngs, userLocation?.lng ?? 73);
    const latPad = (maxLat - minLat) * 0.15 || 2;
    const lngPad = (maxLng - minLng) * 0.15 || 2;
    return {
      minLat: minLat - latPad,
      maxLat: maxLat + latPad,
      minLng: minLng - lngPad,
      maxLng: maxLng + lngPad,
    };
  }, [stations, userLocation]);

  const project = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  };
  const handleMouseUp = () => setIsDragging(false);

  const selected = stations.find((s) => s.id === selectedId);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-xl bg-muted/30 border border-border/60 cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute inset-0 bg-grid opacity-40"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Connections from user to stations */}
          {userLocation &&
            stations.slice(0, 6).map((s) => {
              const u = project(userLocation.lat, userLocation.lng);
              const p = project(s.latitude, s.longitude);
              return (
                <line
                  key={`line-${s.id}`}
                  x1={u.x}
                  y1={u.y}
                  x2={p.x}
                  y2={p.y}
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.15"
                  strokeDasharray="0.5 0.5"
                  opacity="0.25"
                />
              );
            })}
        </svg>

        {/* User location marker */}
        {userLocation && (
          <div
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${project(userLocation.lat, userLocation.lng).x}%`,
              top: `${project(userLocation.lat, userLocation.lng).y}%`,
            }}
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute h-6 w-6 rounded-full bg-blue-500/30 animate-pulse-ring" />
              <span className="h-3 w-3 rounded-full bg-blue-500 ring-4 ring-blue-500/30" />
            </div>
          </div>
        )}

        {/* Station markers */}
        {stations.map((station) => {
          const { x, y } = project(station.latitude, station.longitude);
          const available = station.available_count ?? 0;
          const isSelected = station.id === selectedId;
          const hasAvail = available > 0;
          return (
            <button
              key={station.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(station.id);
              }}
              className={cn(
                'absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-200',
                isSelected ? 'z-30 scale-125' : 'hover:scale-110'
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
              aria-label={station.name}
            >
              <div
                className={cn(
                  'relative flex items-center justify-center rounded-full border-2 shadow-lg',
                  isSelected ? 'h-9 w-9' : 'h-7 w-7',
                  hasAvail
                    ? 'bg-green-500/90 border-green-400 text-white'
                    : 'bg-orange-500/90 border-orange-400 text-white'
                )}
              >
                {hasAvail && (
                  <span className="absolute h-full w-full rounded-full bg-green-500/40 animate-pulse-ring" />
                )}
                <Zap className={cn(isSelected ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
              </div>
              {isSelected && (
                <div className="absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-background px-3 py-1.5 text-xs font-medium shadow-xl border border-border">
                  {station.name}
                  <div className="text-muted-foreground">
                    {available} / {station.total_count ?? 0} available
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Zoom controls */}
      <div className="absolute right-3 top-3 z-40 flex flex-col gap-1">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 shadow-md"
          onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(z + 0.3, 3)); }}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 shadow-md"
          onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(z - 0.3, 0.5)); }}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 shadow-md"
          onClick={(e) => { e.stopPropagation(); setZoom(1); setPan({ x: 0, y: 0 }); }}
        >
          <Locate className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute left-3 bottom-3 z-40 rounded-lg glass px-3 py-2 text-xs shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          <span>Occupied</span>
        </div>
        {userLocation && (
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span>You are here</span>
          </div>
        )}
      </div>

      {stations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <p className="text-sm text-muted-foreground">No stations found in this area</p>
        </div>
      )}
    </div>
  );
}
