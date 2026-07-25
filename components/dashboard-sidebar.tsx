'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Car, Calendar, Zap, Wallet, Gift, Bell, User, Star, Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const userNav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/vehicles', label: 'Vehicles', icon: Car },
  { href: '/dashboard/sessions', label: 'Charging History', icon: Zap },
  { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/rewards', label: 'Rewards', icon: Gift },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/favorites', label: 'Saved Stations', icon: Heart },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  return (
    <nav className="w-full lg:w-60 flex-shrink-0 lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16 lg:overflow-y-auto border-r border-border/60 p-4">
      <div className="hidden lg:block mb-4 pb-4 border-b border-border/60">
        <p className="text-xs text-muted-foreground">Signed in as</p>
        <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
        <p className="text-xs text-primary capitalize">{profile?.role}</p>
      </div>
      <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
        {userNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
