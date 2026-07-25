'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, Loader2, Headphones, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'support@evchargenetwork.com' },
  { icon: Phone, label: 'Phone', value: '+91 1800 123 4567' },
  { icon: MapPin, label: 'Address', value: 'Tech Park, Bangalore, KA 560001' },
  { icon: MessageSquare, label: 'Live Chat', value: 'Available 24/7' },
];

export default function ContactPage() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please sign in to submit a support ticket');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      subject,
      message,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Support ticket submitted! We\'ll get back to you soon.');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Get in touch</h1>
        <p className="mt-4 text-muted-foreground">
          Questions, feedback, or need help? Our team is here for you.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          {contactInfo.map((info) => (
            <Card key={info.label} className="p-5 border-border/60 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                <info.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{info.label}</p>
                <p className="text-sm font-medium">{info.value}</p>
              </div>
            </Card>
          ))}
          <Card className="p-5 border-border/60 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <Headphones className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Need urgent help?</p>
                <p className="text-xs text-muted-foreground">Emergency charging support available 24/7</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 border-border/60 lg:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" /> Send us a message
          </h3>
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Describe your issue or question..." required />
              </div>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Ticket
              </Button>
            </form>
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                Please sign in to submit a support ticket.
              </p>
              <Button asChild className="mt-4"><a href="/login">Sign In</a></Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
