'use client';

import { useState } from 'react';
import { User, Mail, Phone, Save, Loader2, Building2, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success('Profile updated');
  };

  return (
    <DashboardLayout title="Profile" subtitle="Manage your account information">
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 border-border/60 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
            {(profile?.full_name || user?.email || 'U').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <h3 className="mt-4 font-semibold">{profile?.full_name || 'User'}</h3>
          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          <Badge className="mt-3 capitalize">{profile?.role}</Badge>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-bold">{profile?.reward_points ?? 0}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-bold capitalize">{profile?.role}</p>
              <p className="text-xs text-muted-foreground">Plan</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/60 lg:col-span-2">
          <h3 className="font-semibold text-sm mb-4">Edit Profile</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" value={user?.email ?? ''} disabled className="pl-10 bg-muted/50" />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" placeholder="+91 98765 43210" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
