'use client';

import Breadcrumb from '@/components/shared/Breadcrumb';

export default function TermsPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Breadcrumb items={[{ label: 'Terms of Service' }]} />

      <div className="border-b border-border/40 pb-4">
        <h1 className="text-2xl font-black text-foreground">Terms of Service</h1>
        <p className="text-xs text-muted-foreground mt-2">Last Updated: July 2026</p>
      </div>

      <article className="rounded-2xl border border-border/40 p-6 bg-secondary/10 space-y-4 text-xs font-semibold leading-relaxed text-muted-foreground">
        <p className="text-sm font-bold text-foreground">
          Welcome to Siragii. By accessing our platform, you agree to these terms.
        </p>

        <h3 className="text-sm font-bold text-foreground pt-2">1. Acceptance of Terms</h3>
        <p>
          By creating an account, publishing content, or listening to recitations, you represent that you have read and agreed to these terms of service in full.
        </p>

        <h3 className="text-sm font-bold text-foreground pt-2">2. Content Ownership</h3>
        <p>
          You retain the copyright for all original poetry and recitations you publish. However, by publishing on Siragii, you grant us a worldwide, royalty-free, non-exclusive license to host, display, and stream this content.
        </p>

        <h3 className="text-sm font-bold text-foreground pt-2">3. Moderation & Conduct</h3>
        <p>
          Poets are expected to treat other community members with respect. Hate speech, plagiarism, or harassment in poems/comments is strictly prohibited and will result in immediate suspension.
        </p>

        <h3 className="text-sm font-bold text-foreground pt-2">4. Disclaimers</h3>
        <p>
          Services are provided &quot;as is&quot; without warranties of any kind. We are not responsible for any copyright violations committed by users.
        </p>
      </article>
    </div>
  );
}
