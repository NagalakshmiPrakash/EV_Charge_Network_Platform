'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Zap, Calendar, Clock, Car, CheckCircle2, Loader2, ArrowLeft, ArrowRight,
  Download, QrCode as QrIcon, Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { QRCode } from '@/components/qr-code';
import { CONNECTOR_COLORS, STATUS_COLORS, getChargerSpeedCategory } from '@/lib/demo-data';
import type { Station, Charger, Vehicle } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

function BookingContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const stationId = params.get('station');
  const chargerId = params.get('charger');

  const [station, setStation] = useState<Station | null>(null);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedCharger, setSelectedCharger] = useState<string>(chargerId ?? '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:00');
  const [duration, setDuration] = useState('60');
  const [vehicleId, setVehicleId] = useState('');
  const [booking, setBooking] = useState<{ id: string; qr_token: string; amount: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      if (stationId) {
        const { data: sData } = await supabase.from('stations').select('*').eq('id', stationId).maybeSingle();
        setStation(sData as Station | null);
        const { data: cData } = await supabase.from('chargers').select('*').eq('station_id', stationId);
        setChargers((cData as Charger[]) ?? []);
      }
      if (user) {
        const { data: vData } = await supabase.from('vehicles').select('*').eq('user_id', user.id);
        setVehicles((vData as Vehicle[]) ?? []);
      }
      setLoading(false);
    })();
  }, [stationId, user]);

  const selectedChargerObj = chargers.find((c) => c.id === selectedCharger);
  const endTime = useMemo(() => {
    const [h, m] = timeSlot.split(':').map(Number);
    const end = h + Number(duration) / 60;
    const eh = Math.floor(end);
    const em = Math.round((end - eh) * 60);
    return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
  }, [timeSlot, duration]);

  const estimatedAmount = useMemo(() => {
    if (!selectedChargerObj) return 0;
    const energy = (Number(selectedChargerObj.power_kw) * Number(duration)) / 60 * 0.6;
    return Math.round(energy * Number(selectedChargerObj.price_per_kwh));
  }, [selectedChargerObj, duration]);

  const handleConfirm = async () => {
    if (!user || !stationId || !selectedCharger) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        station_id: stationId,
        charger_id: selectedCharger,
        vehicle_id: vehicleId || null,
        booking_date: date,
        start_time: timeSlot,
        end_time: endTime,
        status: 'confirmed',
        amount: estimatedAmount,
      })
      .select()
      .single();

    if (error) {
      toast.error('Booking failed: ' + error.message);
      setSubmitting(false);
      return;
    }

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Booking Confirmed',
      message: `Your charging slot at ${station?.name} on ${date} at ${timeSlot} has been confirmed.`,
      type: 'booking',
    });

    setBooking({ id: data.id, qr_token: data.qr_token, amount: data.amount });
    setStep(4);
    setSubmitting(false);
    toast.success('Booking confirmed!');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Station not found.</p>
        <Button asChild className="mt-4"><Link href="/map">Back to Map</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/map" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to map
      </Link>

      <h1 className="text-2xl font-bold mb-2">Book a Charging Slot</h1>
      <p className="text-sm text-muted-foreground mb-6">{station.name} — {station.address}, {station.city}</p>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 max-w-md">
        {['Charger', 'Date & Time', 'Confirm', 'QR Code'].map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                step > i + 1 ? 'bg-primary text-primary-foreground' :
                step === i + 1 ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                'bg-muted text-muted-foreground'
              )}>
                {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className="mt-1 text-[10px] text-muted-foreground hidden sm:block">{label}</span>
            </div>
            {i < 3 && <div className={cn('flex-1 h-0.5 mx-2 transition-colors', step > i + 1 ? 'bg-primary' : 'bg-border')} />}
          </div>
        ))}
      </div>

      {/* Step 1: Charger */}
      {step === 1 && (
        <Card className="p-6 border-border/60 animate-fade-in">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Select a Charger</h2>
          <div className="space-y-2">
            {chargers.map((c) => (
              <button
                key={c.id}
                disabled={c.status !== 'available'}
                onClick={() => setSelectedCharger(c.id)}
                className={cn(
                  'w-full flex items-center justify-between rounded-lg border-2 p-4 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed',
                  selectedCharger === c.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg border', STATUS_COLORS[c.status])}>
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.connector_type} · {c.power_kw}kW · {getChargerSpeedCategory(c.power_kw)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{c.is_free ? 'Free' : `₹${c.price_per_kwh}/kWh`}</p>
                  <Badge variant="secondary" className={cn('text-xs capitalize mt-1', STATUS_COLORS[c.status])}>
                    {c.status}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!selectedCharger}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <Card className="p-6 border-border/60 animate-fade-in">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Select Date & Time</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['30', '60', '90', '120'].map((d) => (
                    <SelectItem key={d} value={d}>{d} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label>Time Slot</Label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {timeSlots.map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeSlot(t)}
                  className={cn(
                    'rounded-lg border-2 py-2 text-xs font-medium transition-all',
                    timeSlot === t ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {vehicles.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="flex items-center gap-1.5"><Car className="h-3.5 w-3.5" /> Vehicle (optional)</Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger><SelectValue placeholder="Select your vehicle" /></SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.make} {v.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button onClick={() => setStep(3)}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </Card>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <Card className="p-6 border-border/60 animate-fade-in">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Confirm Booking</h2>
          <div className="space-y-3 rounded-lg border border-border/60 p-4">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Station</span><span className="font-medium">{station.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Charger</span><span className="font-medium">{selectedChargerObj?.label} ({selectedChargerObj?.connector_type}, {selectedChargerObj?.power_kw}kW)</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span className="font-medium">{date}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Time</span><span className="font-medium">{timeSlot} – {endTime}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration</span><span className="font-medium">{duration} min</span></div>
            <div className="border-t border-border/60 pt-3 flex justify-between"><span className="font-medium">Estimated Cost</span><span className="font-bold text-primary">₹{estimatedAmount}</span></div>
          </div>
          <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
            <Sparkles className="inline h-3.5 w-3.5 text-primary mr-1" />
            Payment will be processed via your wallet or card after the charging session completes.
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button onClick={handleConfirm} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Booking
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: QR Code */}
      {step === 4 && booking && (
        <Card className="p-8 border-border/60 text-center animate-fade-in">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400 mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">Booking Confirmed!</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your charging slot at {station.name} is reserved.
          </p>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <QrIcon className="h-4 w-4" />
              Scan this QR code at the charging station
            </div>
            <QRCode value={booking.qr_token} size={200} />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Booking ID</p>
              <p className="font-mono text-sm font-medium">{booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-4 py-3 w-full max-w-xs">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{date}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{timeSlot} – {endTime}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-primary">₹{booking.amount}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button asChild>
              <Link href="/dashboard/bookings">View My Bookings</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <BookingContent />
      </Suspense>
    </ProtectedRoute>
  );
}
