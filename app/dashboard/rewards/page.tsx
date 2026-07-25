'use client';

import { Gift, Star, Trophy, Users, Zap, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';

const rewardTiers = [
  { name: 'Bronze', points: 0, color: 'text-amber-700', perks: '5% off charging' },
  { name: 'Silver', points: 500, color: 'text-gray-500', perks: '10% off + priority booking' },
  { name: 'Gold', points: 2000, color: 'text-amber-500', perks: '15% off + free fast charging hours' },
  { name: 'Platinum', points: 5000, color: 'text-chart-2', perks: '20% off + exclusive stations' },
];

export default function RewardsPage() {
  const { profile } = useAuth();
  const points = profile?.reward_points ?? 0;
  const currentTier = [...rewardTiers].reverse().find((t) => points >= t.points) ?? rewardTiers[0];
  const nextTier = rewardTiers.find((t) => t.points > points);
  const progress = nextTier ? ((points - currentTier.points) / (nextTier.points - currentTier.points)) * 100 : 100;

  return (
    <DashboardLayout title="Rewards & Loyalty" subtitle="Earn points on every charge and unlock exclusive perks">
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 border-border/60 bg-gradient-to-br from-primary/10 to-chart-2/5 lg:col-span-1">
          <Gift className="h-8 w-8 text-primary" />
          <p className="mt-4 text-4xl font-bold">{points.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Reward Points</p>
          <Badge className="mt-3 capitalize">{currentTier.name} Member</Badge>
          {nextTier && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress to {nextTier.name}</span>
                <span>{nextTier.points - points} to go</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </Card>

        <Card className="p-6 border-border/60 lg:col-span-2">
          <h3 className="font-semibold text-sm mb-4">Reward Tiers</h3>
          <div className="space-y-3">
            {rewardTiers.map((tier) => (
              <div key={tier.name} className={`flex items-center justify-between rounded-lg border p-4 ${points >= tier.points ? 'border-primary/30 bg-primary/5' : 'border-border/60'}`}>
                <div className="flex items-center gap-3">
                  <Trophy className={`h-5 w-5 ${tier.color}`} />
                  <div>
                    <p className="font-medium text-sm">{tier.name}</p>
                    <p className="text-xs text-muted-foreground">{tier.perks}</p>
                  </div>
                </div>
                <span className="text-sm font-medium">{tier.points.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[
          { icon: Zap, title: 'Charge & Earn', desc: 'Earn 1 point per ₹10 spent on charging', points: '+1/₹10' },
          { icon: Star, title: 'Write Reviews', desc: 'Earn 50 points for each station review', points: '+50' },
          { icon: Users, title: 'Refer Friends', desc: 'Earn 500 points for each successful referral', points: '+500' },
        ].map((item) => (
          <Card key={item.title} className="p-5 border-border/60">
            <item.icon className="h-6 w-6 text-primary" />
            <h4 className="mt-3 font-semibold text-sm">{item.title}</h4>
            <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
            <Badge variant="secondary" className="mt-3 text-xs">{item.points}</Badge>
          </Card>
        ))}
      </div>

      <Card className="p-6 border-border/60 mt-6 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Refer a Friend</h3>
            <p className="text-sm text-muted-foreground mt-1">Both you and your friend earn 500 points when they make their first charge.</p>
          </div>
          <Button>Share Referral Link <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </Card>
    </DashboardLayout>
  );
}
