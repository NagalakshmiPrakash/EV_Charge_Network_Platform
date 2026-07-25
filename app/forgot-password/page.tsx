'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success('Reset link sent to your email');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-grid px-4">
      <div className="absolute top-1/3 left-1/4 h-72 w-72 rounded-full bg-primary/15 blur-[120px]" />

      <Card className="relative w-full max-w-md p-8 shadow-2xl border-border/60">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">EV<span className="text-primary">Charge</span></span>
        </div>

        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email and we&apos;ll send you a reset link
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm">
            <p className="font-medium text-green-600 dark:text-green-400">Check your inbox</p>
            <p className="mt-1 text-muted-foreground">
              We&apos;ve sent a password reset link to <strong>{email}</strong>. The link expires in 1 hour.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
