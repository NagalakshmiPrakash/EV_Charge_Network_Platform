'use client';

import { useEffect, useState } from 'react';
import { Car, Plus, Zap, Trash2, Loader2, Battery } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { VEHICLE_PRESETS } from '@/lib/demo-data';
import type { Vehicle } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function VehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [presetIdx, setPresetIdx] = useState('0');

  useEffect(() => {
    if (!user) return;
    supabase.from('vehicles').select('*').eq('user_id', user.id).then(({ data }) => {
      setVehicles((data as Vehicle[]) ?? []);
      setLoading(false);
    });
  }, [user]);

  const handleAdd = async () => {
    if (!user) return;
    const preset = VEHICLE_PRESETS[parseInt(presetIdx)];
    const { data, error } = await supabase.from('vehicles').insert({
      user_id: user.id,
      make: preset.make,
      model: preset.model,
      battery_capacity_kwh: preset.batteryCapacityKwh,
      estimated_range_km: preset.rangeKm,
      connector_type: preset.connectorType,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setVehicles([...vehicles, data as Vehicle]);
    toast.success(`${preset.make} ${preset.model} added!`);
    setAddOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    setVehicles(vehicles.filter((v) => v.id !== id));
    toast.success('Vehicle removed');
  };

  return (
    <DashboardLayout title="My Vehicles" subtitle="Manage your electric vehicles">
      <div className="mb-4">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Vehicle</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Vehicle</DialogTitle></DialogHeader>
            <Select value={presetIdx} onValueChange={setPresetIdx}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {VEHICLE_PRESETS.map((p, i) => <SelectItem key={i} value={String(i)}>{p.make} {p.model}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleAdd} className="w-full">Add</Button>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : vehicles.length === 0 ? (
        <Card className="p-12 text-center border-border/60">
          <Car className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No vehicles yet. Add your first EV to get started.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <Card key={v.id} className="p-5 border-border/60">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Car className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{v.make} {v.model}</h3>
                    {v.year && <p className="text-xs text-muted-foreground">{v.year}</p>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(v.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center gap-1"><Battery className="h-3 w-3" /> Battery</span>
                    <span className="font-medium">{v.current_battery_percent.toFixed(0)}%</span>
                  </div>
                  <Progress value={v.current_battery_percent} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Health</span>
                    <span className="font-medium">{v.battery_health_percent.toFixed(0)}%</span>
                  </div>
                  <Progress value={v.battery_health_percent} className="h-2" />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant="secondary" className="text-xs">{v.connector_type}</Badge>
                  <Badge variant="secondary" className="text-xs">{v.battery_capacity_kwh} kWh</Badge>
                  <Badge variant="secondary" className="text-xs">{v.estimated_range_km} km</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
