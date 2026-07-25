'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Star, MapPin, Clock, Zap, BatteryCharging, Navigation, CheckCircle2, AlertTriangle, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  CONNECTOR_COLORS, STATUS_COLORS, getChargerSpeedCategory, getDemoReviews,
} from '@/lib/demo-data';
import type { StationWithChargers } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

interface StationDetailProps {
  station: StationWithChargers | null;
  trigger?: React.ReactNode;
  onBook?: (station: StationWithChargers, chargerId: string) => void;
}

export function StationDetail({ station, trigger, onBook }: StationDetailProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reportBroken, setReportBroken] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!station) return null;

  const reviews = getDemoReviews(station.id);
  const available = station.available_count ?? 0;
  const total = station.total_count ?? 0;
  const maxPower = Math.max(...(station.chargers?.map((c) => c.power_kw) ?? [0]));

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      station_id: station.id,
      rating,
      comment: reviewText,
      is_broken_report: reportBroken,
      photo_urls: [],
    });
    setSubmitting(false);
    if (error) {
      toast.error('Could not submit review: ' + error.message);
    } else {
      toast.success('Review submitted!');
      setReviewText('');
      setReportBroken(false);
      setRating(5);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">View Details</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{station.name}</DialogTitle>
        </DialogHeader>

        {station.photo_url && (
          <div className="relative h-40 rounded-lg overflow-hidden -mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={station.photo_url} alt={station.name} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{station.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({station.total_ratings})</span>
          </div>
          <span className="text-muted-foreground flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {station.address}, {station.city}
          </span>
          {station.is_24_hours && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="mr-1 h-3 w-3" /> 24/7
            </Badge>
          )}
        </div>

        {station.description && (
          <p className="text-sm text-muted-foreground">{station.description}</p>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border/60 p-3 text-center">
            <Zap className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1 text-lg font-bold">{Math.round(maxPower)}kW</p>
            <p className="text-xs text-muted-foreground">Max Power</p>
          </div>
          <div className="rounded-lg border border-border/60 p-3 text-center">
            <CheckCircle2 className="mx-auto h-5 w-5 text-green-500" />
            <p className="mt-1 text-lg font-bold">{available}/{total}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
          <div className="rounded-lg border border-border/60 p-3 text-center">
            <BatteryCharging className="mx-auto h-5 w-5 text-chart-2" />
            <p className="mt-1 text-lg font-bold">{station.chargers?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Chargers</p>
          </div>
        </div>

        {/* Amenities */}
        {station.amenities.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {station.amenities.map((a) => (
                <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Chargers */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Chargers</h4>
          <div className="space-y-2">
            {station.chargers?.map((charger) => (
              <div
                key={charger.id}
                className="flex items-center justify-between rounded-lg border border-border/60 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg border',
                    STATUS_COLORS[charger.status]
                  )}>
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{charger.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {charger.connector_type} · {charger.power_kw}kW · {getChargerSpeedCategory(charger.power_kw)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {charger.is_free ? 'Free' : `₹${charger.price_per_kwh}/kWh`}
                    </p>
                    <p className={cn('text-xs font-medium capitalize', STATUS_COLORS[charger.status].split(' ')[1])}>
                      {charger.status}
                    </p>
                  </div>
                  {charger.status === 'available' && onBook && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setOpen(false);
                        onBook(station, charger.id);
                      }}
                    >
                      Book
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h4 className="text-sm font-semibold mb-2">
            Reviews ({reviews.length})
          </h4>
          <div className="space-y-2">
            {reviews.map((review, i) => (
              <div key={i} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{review.author}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={cn(
                          'h-3 w-3',
                          j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                        )}
                      />
                    ))}
                  </div>
                </div>
                {review.broken && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    <AlertTriangle className="mr-1 h-3 w-3" /> Broken Charger Report
                  </Badge>
                )}
                <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">{review.date}</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>

        {/* Write a review */}
        <div className="rounded-lg border border-border/60 p-4">
          <h4 className="text-sm font-semibold mb-3">Write a Review</h4>
          {!user ? (
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">Sign in</Link> to leave a review or report a broken charger.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i + 1)}
                    className="p-0.5"
                  >
                    <Star
                      className={cn(
                        'h-5 w-5 transition-colors',
                        i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40 hover:text-amber-400'
                      )}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Share your charging experience..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                className="mb-2"
              />
              <label className="flex items-center gap-2 mb-3 text-sm">
                <input
                  type="checkbox"
                  checked={reportBroken}
                  onChange={(e) => setReportBroken(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Report a broken charger
              </label>
              <Button onClick={handleSubmitReview} disabled={submitting} size="sm">
                {submitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Submit Review
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
