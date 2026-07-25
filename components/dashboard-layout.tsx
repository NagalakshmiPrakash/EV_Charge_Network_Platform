'use client';

import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardSidebar } from '@/components/dashboard-sidebar';

export function DashboardLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col lg:flex-row">
        <DashboardSidebar />
        <div className="flex-1 min-w-0">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
