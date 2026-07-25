import Link from 'next/link';
import { Zap, Twitter, Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" />
              </div>
              EV<span className="text-primary">Charge</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              The intelligent EV charging network. Find, book, and charge smarter with AI-powered predictions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/map" className="hover:text-foreground transition-colors">Find Chargers</Link></li>
              <li><Link href="/battery" className="hover:text-foreground transition-colors">Battery Analytics</Link></li>
              <li><Link href="/queue" className="hover:text-foreground transition-colors">AI Queue Prediction</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/owner" className="hover:text-foreground transition-colors">For Station Owners</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Connect</h4>
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 EV Charge Network. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for a sustainable future.
          </p>
        </div>
      </div>
    </footer>
  );
}
