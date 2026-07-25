'use client';

import Link from 'next/link';
import {
  Zap,
  MapPin,
  BatteryCharging,
  Clock,
  Calendar,
  Route,
  CreditCard,
  Star,
  Leaf,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  { value: '12,000+', label: 'Charging Stations' },
  { value: '45M', label: 'Sessions Completed' },
  { value: '98%', label: 'Uptime' },
  { value: '2.8M', label: 'Active Users' },
];

const features = [
  {
    icon: MapPin,
    title: 'Smart Charger Locator',
    description: 'Interactive map with live availability, filters by charger type, speed, and pricing.',
  },
  {
    icon: BatteryCharging,
    title: 'Battery Analytics',
    description: 'Monitor battery health, charging cycles, energy consumption, and cost analytics in real-time.',
  },
  {
    icon: Clock,
    title: 'AI Queue Prediction',
    description: 'ML-powered wait time forecasting. Know the best station and time before you arrive.',
  },
  {
    icon: Calendar,
    title: 'Slot Booking',
    description: 'Reserve your charger in advance with QR-code confirmation. Cancel or reschedule anytime.',
  },
  {
    icon: Route,
    title: 'Smart Route Planner',
    description: 'Battery-aware routing with recommended charging stops and alternative paths.',
  },
  {
    icon: CreditCard,
    title: 'Digital Payments',
    description: 'Pay via card, UPI, wallet, or net banking. Automatic invoices and loyalty rewards.',
  },
];

const steps = [
  {
    icon: MapPin,
    title: 'Find a Station',
    description: 'Search by location or use the interactive map to find nearby chargers with live availability.',
  },
  {
    icon: Calendar,
    title: 'Book Your Slot',
    description: 'Reserve a charger at your preferred time. Get instant QR-code confirmation.',
  },
  {
    icon: Zap,
    title: 'Charge & Go',
    description: 'Scan, plug in, and charge. Track progress in real-time and pay seamlessly.',
  },
];

const vehicles = ['Tesla', 'BYD', 'Tata', 'MG', 'Mahindra', 'Ather', 'Ola', 'Hyundai', 'Kia'];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 right-1/4 h-96 w-96 rounded-full bg-chart-2/20 blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 py-1.5 px-4 text-sm animate-fade-up">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
              AI-Powered EV Charging Platform
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Charge smarter,
              <br />
              <span className="text-gradient">drive further</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Discover charging stations, predict wait times, reserve slots, and monitor your
              battery health — all powered by AI. The intelligent network for electric vehicles.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button size="lg" asChild className="h-12 px-8 text-base shadow-lg shadow-primary/30">
                <Link href="/map">
                  Find Chargers Near You
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                <Link href="/signup">Create Free Account</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6 text-center border-border/60 hover:shadow-lg transition-shadow">
                <div className="text-3xl lg:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to charge
            </h2>
            <p className="mt-4 text-muted-foreground">
              A complete platform built for EV owners, station operators, and fleet managers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group p-6 border-border/60 hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Charging in three simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-px bg-gradient-to-r from-primary/40 to-transparent" />
                )}
                <div className="relative inline-flex h-24 w-24 items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-lg">
                  <step.icon className="h-10 w-10 text-primary" />
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {i + 1}
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Highlight */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
                AI-Powered Intelligence
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Predict wait times before you arrive
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Our machine learning models analyze historical demand, time of day, traffic patterns,
                and station occupancy to forecast queue lengths and recommend the optimal charging
                station and time for your trip.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Real-time queue length prediction',
                  'Best station and time recommendations',
                  'Battery-aware route optimization',
                  'Charging cost and savings calculator',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8" size="lg">
                <Link href="/queue">
                  Try AI Queue Prediction
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <Card className="p-8 border-border/60 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">AI Predictions — Live</p>
                  <p className="text-lg font-semibold">Koramangala, Bangalore</p>
                </div>
                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Real-time
                </Badge>
              </div>
              <div className="space-y-3">
                {[
                  { station: 'PowerDrive Koramangala', wait: '5 min', queue: 0, best: true },
                  { station: 'WattHub Whitefield', wait: '18 min', queue: 3, best: false },
                  { station: 'ElectroPark OMR', wait: '28 min', queue: 5, best: false },
                  { station: 'VoltStation Hitech City', wait: 'No Queue', queue: 0, best: false },
                ].map((s) => (
                  <div
                    key={s.station}
                    className={`flex items-center justify-between rounded-lg p-4 transition-colors ${
                      s.best
                        ? 'bg-primary/5 border border-primary/30'
                        : 'bg-muted/50 border border-border/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        s.best ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{s.station}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.queue > 0 ? `${s.queue} in queue` : 'No queue'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${s.best ? 'text-primary' : ''}`}>{s.wait}</p>
                      {s.best && (
                        <p className="text-xs text-primary">Recommended</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Vehicles */}
      <section className="py-16 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Supporting all major EV brands
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {vehicles.map((v) => (
                <span key={v} className="text-xl font-bold text-muted-foreground/60 hover:text-foreground transition-colors">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Leaf, value: '1.2M tons', label: 'CO₂ Emissions Saved', color: 'text-green-600 dark:text-green-400' },
              { icon: TrendingUp, value: '₹340 Cr', label: 'Saved on Fuel Costs', color: 'text-chart-2' },
              { icon: Shield, value: '99.9%', label: 'Platform Reliability', color: 'text-chart-3' },
            ].map((item) => (
              <Card key={item.label} className="p-8 text-center border-border/60">
                <item.icon className={`mx-auto h-10 w-10 ${item.color}`} />
                <div className="mt-4 text-2xl font-bold">{item.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden p-12 lg:p-16 text-center border-primary/30 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-chart-2/5 to-transparent" />
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/15 blur-[100px]" />
            <div className="relative">
              <Star className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
                Ready to charge smarter?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Join millions of EV drivers saving time and money with AI-powered charging.
                Free to sign up. No credit card required.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" asChild className="h-12 px-8 text-base shadow-lg shadow-primary/30">
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
