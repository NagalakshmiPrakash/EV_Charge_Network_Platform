'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, QrCode as QrIcon, X, Loader2, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/dashboard-layout';
import { QRCode } from '@/components/qr-code';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { Booking, Station } from '@/lib/types';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  completed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stations, setStations] = useState<Record<string, Station>>({});
  const [loading, setLoading] = useState(true);
  const [qrBooking, setQrBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: bData } = await supabase.from('bookings').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setBookings((bData as Booking[]) ?? []);
      const ids = new Set<string>();
      (bData as Booking[])?.forEach((b) => ids.add(b.station_id));
      if (ids.size > 0) {
        const { data: sData } = await supabase.from('stations').select('*').in('id', Array.from(ids));
        const map: Record<string, Station> = {};
        (sData as Station[])?.forEach((s) => { map[s.id] = s; });
        setStations(map);
      }
      setLoading(false);
    })();
  }, [user]);

  const handleCancel = async (id: string) => {
    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setBookings(bookings.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b));
    toast.success('Booking cancelled');
  };

  return (
    <DashboardLayout title="My Bookings" subtitle="View and manage your charging slot reservations">
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : bookings.length === 0 ? (
        <Card className="p-12 text-center border-border/60">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No bookings yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="p-4 border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{stations[b.station_id]?.name ?? 'Station'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {stations[b.station_id]?.address}, {stations[b.station_id]?.city}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {b.booking_date} · {b.start_time} – {b.end_time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-xs capitalize border', statusColors[b.status])}>{b.status}</Badge>
                  <span className="text-sm font-bold">₹{b.amount}</span>
                  {b.status === 'confirmed' && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setQrBooking(b)}>
                            <QrIcon className="mr-1 h-3.5 w-3.5" /> QR
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="text-center">
                          <DialogHeader><DialogTitle>Booking QR Code</DialogTitle></DialogHeader>
                          {qrBooking && (
                            <div className="flex flex-col items-center gap-3 py-4">
                              <QRCode value={qrBooking.qr_token} size={180} />
                              <p className="text-sm font-medium">{stations[qrBooking.station_id]?.name}</p>
                              <p className="text-xs text-muted-foreground">{qrBooking.booking_date} · {qrBooking.start_time}</p>
                              <p className="font-mono text-xs text-muted-foreground">{qrBooking.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleCancel(b.id)}>
                        <X className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
