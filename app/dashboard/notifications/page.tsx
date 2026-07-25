'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Zap, Calendar, Battery, Clock, Tag, Info, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const typeConfig: Record<string, { icon: typeof Zap; color: string }> = {
  booking: { icon: Calendar, color: 'text-chart-2' },
  charging: { icon: Zap, color: 'text-primary' },
  battery: { icon: Battery, color: 'text-chart-3' },
  queue: { icon: Clock, color: 'text-chart-4' },
  price: { icon: Tag, color: 'text-green-600 dark:text-green-400' },
  info: { icon: Info, color: 'text-muted-foreground' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      setNotifications((data as Notification[]) ?? []);
      setLoading(false);
    });
  }, [user]);

  const handleMarkRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };
  const handleMarkAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    toast.success('All notifications marked as read');
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <DashboardLayout title="Notifications" subtitle="Stay updated with real-time alerts">
      {unreadCount > 0 && (
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}><Check className="mr-2 h-3.5 w-3.5" /> Mark all read</Button>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center border-border/60">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No notifications yet. You&apos;ll see booking confirmations, charging updates, and alerts here.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const cfg = typeConfig[n.type] ?? typeConfig.info;
            return (
              <Card key={n.id} className={cn('p-4 border-border/60 transition-colors', !n.is_read && 'border-primary/30 bg-primary/5')}>
                <div className="flex items-start gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 flex-shrink-0', cfg.color)}>
                    <cfg.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{n.title}</p>
                      {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  {!n.is_read && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleMarkRead(n.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
