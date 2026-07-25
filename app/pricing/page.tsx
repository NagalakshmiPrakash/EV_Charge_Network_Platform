'use client';

import { useState } from 'react';
import { Check, Zap, Crown, Building2, ArrowRight, Minus, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type BillingCycle = 'monthly' | 'yearly';

const plans = [
  {
    name: 'Free',
    icon: Zap,
    monthly: 0,
    yearly: 0,
    description: 'Perfect for occasional EV drivers',
    features: [
      'Find charging stations',
      'Live availability tracking',
      'Basic battery analytics',
      'Slot booking',
      'Wallet payments',
      'Community support',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Premium',
    icon: Crown,
    monthly: 299,
    yearly: 2990,
    description: 'For regular EV drivers who want more',
    features: [
      'Everything in Free',
      'AI Queue Prediction',
      'Advanced battery analytics',
      'Smart route planner',
      'Priority booking slots',
      '10% reward points bonus',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Business',
    icon: Building2,
    monthly: 999,
    yearly: 9990,
    description: 'For station owners and fleet managers',
    features: [
      'Everything in Premium',
      'Station owner dashboard',
      'Revenue analytics',
      'Charger management',
      'Customer management',
      'Maintenance requests',
      'Priority support',
      'API access',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const comparison: { feature: string; free: boolean | string; premium: boolean | string; business: boolean | string }[] = [
  { feature: 'Station locator & live availability', free: true, premium: true, business: true },
  { feature: 'Slot booking', free: true, premium: true, business: true },
  { feature: 'Wallet payments', free: true, premium: true, business: true },
  { feature: 'Basic battery analytics', free: true, premium: true, business: true },
  { feature: 'AI Queue Prediction', free: false, premium: true, business: true },
  { feature: 'Advanced battery analytics', free: false, premium: true, business: true },
  { feature: 'Smart route planner', free: false, premium: true, business: true },
  { feature: 'Priority booking slots', free: false, premium: true, business: true },
  { feature: '10% reward points bonus', free: false, premium: true, business: true },
  { feature: 'Station owner dashboard', free: false, premium: false, business: true },
  { feature: 'Revenue analytics', free: false, premium: false, business: true },
  { feature: 'Charger & customer management', free: false, premium: false, business: true },
  { feature: 'Maintenance requests', free: false, premium: false, business: true },
  { feature: 'API access', free: false, premium: false, business: true },
  { feature: 'Support', free: 'Community', premium: 'Email', business: 'Priority' },
];

const faqs = [
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes. You can upgrade, downgrade, or cancel your plan at any time from your dashboard. Changes take effect immediately and we prorate the difference.',
  },
  {
    q: 'Is there a free trial for Premium?',
    a: 'Premium includes a 7-day free trial. No card required to start — you only begin paying after the trial ends, and you can cancel before then at no cost.',
  },
  {
    q: 'Are charging costs included in the plan?',
    a: 'No. Plan subscriptions cover app features and perks. Charging itself is pay-per-use, billed per kWh at the station\'s listed rate.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards, UPI, and wallet payments. Business plans can also pay via invoice with NET-30 terms.',
  },
  {
    q: 'Do you offer discounts for fleets?',
    a: 'Yes. The Business plan scales with your fleet size. Contact our sales team for custom pricing on fleets of 10+ vehicles.',
  },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-4 w-4 mx-auto text-primary" />;
  if (value === false) return <Minus className="h-4 w-4 mx-auto text-muted-foreground/30" />;
  return <span className="text-sm font-medium">{value}</span>;
}

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const yearlySavings = 2; // 2 months free

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Badge variant="secondary" className="mb-4">Pricing</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-muted-foreground">
          Choose the plan that fits your charging needs. No hidden fees. Cancel anytime.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={cn('text-sm font-medium transition-colors', cycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground')}>
          Monthly
        </span>
        <button
          onClick={() => setCycle(cycle === 'monthly' ? 'yearly' : 'monthly')}
          className="relative inline-flex h-6 w-11 items-center rounded-full border border-border bg-muted transition-colors data-[active=true]:bg-primary"
          data-active={cycle === 'yearly'}
          aria-label="Toggle billing cycle"
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-background shadow-sm transition-transform',
              cycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
        <span className={cn('text-sm font-medium transition-colors', cycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground')}>
          Yearly
        </span>
        <Badge variant="outline" className="text-green-600 border-green-500/30 bg-green-500/5">
          <Sparkles className="h-3 w-3 mr-1" />
          Save {yearlySavings} months
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const price = cycle === 'monthly' ? plan.monthly : Math.round(plan.yearly / 12);
          return (
            <Card
              key={plan.name}
              className={cn(
                'relative p-8 border-border/60 flex flex-col transition-all duration-300 hover:shadow-lg',
                plan.highlight && 'border-primary shadow-xl shadow-primary/10 lg:scale-105'
              )}
            >
              {plan.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <plan.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">₹{price.toLocaleString('en-IN')}</span>
                <span className="text-sm text-muted-foreground">/{cycle === 'monthly' ? 'month' : 'month, billed yearly'}</span>
              </div>
              {cycle === 'yearly' && plan.yearly > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  ₹{plan.yearly.toLocaleString('en-IN')}/year
                </p>
              )}
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full"
                variant={plan.highlight ? 'default' : 'outline'}
                asChild
              >
                <Link href="/signup">
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="mt-20 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Compare all features</h2>
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="text-left font-semibold p-4 min-w-[220px]">Feature</th>
                <th className="text-center font-semibold p-4">Free</th>
                <th className="text-center font-semibold p-4 text-primary">Premium</th>
                <th className="text-center font-semibold p-4">Business</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={row.feature} className={cn('border-b border-border/40', i % 2 === 1 && 'bg-muted/20')}>
                  <td className="p-4 text-left">{row.feature}</td>
                  <td className="p-4 text-center"><Cell value={row.free} /></td>
                  <td className="p-4 text-center"><Cell value={row.premium} /></td>
                  <td className="p-4 text-center"><Cell value={row.business} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-20 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include access to 12,000+ stations nationwide. Charging costs are pay-per-use.
        </p>
      </div>
    </div>
  );
}
