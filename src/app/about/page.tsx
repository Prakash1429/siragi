'use client';

import Breadcrumb from '@/components/shared/Breadcrumb';
import { Feather, Heart, Globe, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Breadcrumb items={[{ label: 'About Us' }]} />

      <div className="text-center space-y-3">
        <Feather className="w-12 h-12 text-primary mx-auto animate-bounce" />
        <h1 className="text-3xl font-black text-foreground">About Siragii</h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          The ultimate home for classical, modern, and spoken word poetry in Tamil and English.
        </p>
      </div>

      <article className="rounded-3xl border border-border/40 glass-card p-6 md:p-8 space-y-6 leading-relaxed text-sm text-foreground/90">
        <p>
          Founded in 2026, <strong>Siragii</strong> was born out of a desire to bridge traditional linguistics with modern technology. Our goal is to provide a premium, aesthetically rich environment where writers can publish their verses, and listeners can experience recitations as spoken word performances.
        </p>

        <h3 className="text-base font-bold text-foreground flex items-center gap-2 pt-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          Bilingual Stanza & Voice Support
        </h3>
        <p>
          We take pride in offering complete support for both Tamil (தமிழ்) and English. Writers can flag their language preference, allowing users to switch interface vocabularies dynamically. Additionally, writers can upload MP3 audio recordings of their recitations, creating an audio-guided reader experience.
        </p>

        <h3 className="text-base font-bold text-foreground flex items-center gap-2 pt-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Our Mission
        </h3>
        <p>
          To empower new generations of writers, preserve classical sangam or romantic traditions, and connect poets across the globe. Whether you write four-line haikus or deep philosophical stanzas, your voice has a home here.
        </p>

        <div className="border-t border-border/40 pt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
          <span>Thank you for being part of the journey.</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </div>
      </article>
    </div>
  );
}
