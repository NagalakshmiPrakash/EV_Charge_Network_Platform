'use client';

import { useEffect, useState } from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Plus, Loader2, Gift } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { Wallet as WalletType, WalletTransaction } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function WalletPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('500');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: wData } = await supabase.from('wallets').select('*').eq('user_id', user.id).maybeSingle();
      setWallet(wData as WalletType | null);
      const { data: tData } = await supabase.from('wallet_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setTransactions((tData as WalletTransaction[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const handleAddMoney = async () => {
    if (!user || !wallet) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { toast.error('Enter a valid amount'); return; }
    const newBalance = Number(wallet.balance) + amt;
    const { error: wError } = await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);
    if (wError) { toast.error(wError.message); return; }
    const { error: tError } = await supabase.from('wallet_transactions').insert({
      wallet_id: wallet.id, user_id: user.id, amount: amt, type: 'credit', description: 'Wallet top-up',
    });
    if (tError) { toast.error(tError.message); return; }
    setWallet({ ...wallet, balance: newBalance });
    setTransactions([{ id: 'temp', wallet_id: wallet.id, user_id: user.id, amount: amt, type: 'credit', description: 'Wallet top-up', created_at: new Date().toISOString() } as WalletTransaction, ...transactions]);
    toast.success(`₹${amt} added to wallet`);
  };

  return (
    <DashboardLayout title="Wallet" subtitle="Manage your balance and transaction history">
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card className="p-6 border-border/60 bg-gradient-to-br from-primary/10 to-chart-2/5">
              <div className="flex items-center justify-between">
                <Wallet className="h-6 w-6 text-primary" />
                <span className="text-xs text-muted-foreground">Current Balance</span>
              </div>
              <p className="mt-4 text-3xl font-bold">₹{(wallet?.balance ?? 0).toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground mt-1">Available for charging</p>
            </Card>

            <Card className="p-6 border-border/60">
              <h3 className="font-semibold text-sm mb-4">Add Money</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  {['100', '500', '1000', '2000'].map((a) => (
                    <Button key={a} variant="outline" size="sm" onClick={() => setAmount(a)}>₹{a}</Button>
                  ))}
                </div>
                <Button onClick={handleAddMoney} className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Money</Button>
              </div>
            </Card>
          </div>

          <Card className="p-6 border-border/60 lg:col-span-2">
            <h3 className="font-semibold text-sm mb-4">Transaction History</h3>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                    <div className="flex items-center gap-3">
                      {t.type === 'credit' ? (
                        <ArrowDownCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowUpCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{t.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={cn('text-sm font-bold', t.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400')}>
                      {t.type === 'credit' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
