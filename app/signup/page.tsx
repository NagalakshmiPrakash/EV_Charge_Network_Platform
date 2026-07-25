'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, User, Loader2, ArrowLeft, Building2, Check, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import type { UserRole } from '@/lib/types';
import { PASSWORD_RULES, validatePassword, passwordStrength } from '@/lib/password-policy';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const { valid, failed } = useMemo(() => validatePassword(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      toast.error('Password doesn\'t meet the requirements');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Account created! Welcome to EV Charge Network.');
      router.push('/dashboard');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-grid px-4 py-12">
      <div className="absolute top-1/3 left-1/4 h-72 w-72 rounded-full bg-primary/15 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-chart-2/15 blur-[120px]" />

      <Card className="relative w-full max-w-md p-8 shadow-2xl border-border/60">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">EV<span className="text-primary">Charge</span></span>
        </div>

        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">Join the smart EV charging network</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              role === 'user'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <User className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">EV Owner</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              role === 'owner'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Station Owner</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="mt-2 space-y-2.5 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground w-12 text-right">{strength.label}</span>
                </div>
                <ul className="space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <li key={rule.label} className="flex items-center gap-2 text-xs">
                        {passed ? (
                          <Check className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                        ) : (
                          <X className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/40" />
                        )}
                        <span className={passed ? 'text-foreground' : 'text-muted-foreground'}>
                          {rule.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
