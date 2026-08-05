'use client';

import Breadcrumb from '@/components/shared/Breadcrumb';

export default function PrivacyPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Breadcrumb items={[{ label: 'Privacy Policy' }]} />

      <div className="border-b border-border/40 pb-4">
        <h1 className="text-2xl font-black text-foreground">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground mt-2">Last Updated: July 2026</p>
      </div>

      <article className="rounded-2xl border border-border/40 p-6 bg-secondary/10 space-y-4 text-xs font-semibold leading-relaxed text-muted-foreground">
        <p className="text-sm font-bold text-foreground">
          Your privacy is extremely important to us.
        </p>
        <p>
          This Privacy Policy outlines how Siragii collects, uses, and safeguards your personal data. We operate in compliance with standard regulations and ensure complete transparent usage.
        </p>

        <h3 className="text-sm font-bold text-foreground pt-2">1. Information We Collect</h3>
        <p>
          We collect basic user profile information such as your name, email address, username, and bio when you register. If you choose to publish poems or comments, this content is stored in our database.
        </p>

        <h3 className="text-sm font-bold text-foreground pt-2">2. Audio Uploads & Media</h3>
        <p>
          Writers can optional link mp3 files for recitation recitations. Any media files you submit remain yours, but we process metadata to index audio durations and likes count.
        </p>

        <h3 className="text-sm font-bold text-foreground pt-2">3. Cookies & Local Storage</h3>
        <p>
          We use local storage keys (such as theme and language preferences) to persist state transitions on your browser, providing a seamless user experience.
        </p>

        <h3 className="text-sm font-bold text-foreground pt-2">4. Contact Information</h3>
        <p>
          If you have any questions, feel free to contact our compliance team at privacy@siragii.com.
        </p>
      </article>
    </div>
  );
}
