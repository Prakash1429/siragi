import Link from 'next/link';
import { Feather, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-card py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-primary">
              <Feather className="w-5 h-5" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                Siragii
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The premier platform for spoken word poetry, classical stanzas, and modern verses. Publish and share your soul-stirring lines in Tamil and English.
            </p>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Link href="https://twitter.com" target="_blank" className="hover:text-primary transition-all" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
              <Link href="https://github.com" target="_blank" className="hover:text-primary transition-all" aria-label="GitHub">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs font-semibold text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-all">Home</Link></li>
              <li><Link href="/categories" className="hover:text-primary transition-all">Categories</Link></li>
              <li><Link href="/trending" className="hover:text-primary transition-all">Trending Poems</Link></li>
              <li><Link href="/audio" className="hover:text-primary transition-all">Audio Recitations</Link></li>
            </ul>
          </div>

          {/* Legal / Info */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Information</h4>
            <ul className="space-y-2.5 text-xs font-semibold text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-all">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-all">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-all">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-all">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Languages Supported info */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Supported Languages</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Explore classical and modern Tamil (தமிழ்) verses alongside poetic english prose. Switch languages in the navigation menu to translate the portal.
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-[10px] font-bold text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Translations Active
            </span>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-border/40 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Siragii. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for poets worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
