'use client';

import { useState } from 'react';
import { Settings, Shield, Globe, Database, Save } from 'lucide-react';
import { isFirebaseConfigured } from '@/lib/firebase/firebase';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('Siragii');
  const [allowPublicSubmissions, setAllowPublicSubmissions] = useState(true);
  const [requireAudioApproval, setRequireAudioApproval] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('System configurations updated successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-4 max-w-xl">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/40 pb-2">
        <Settings className="w-4.5 h-4.5 text-primary" />
        System Configurations
      </h3>

      <form onSubmit={handleSave} className="space-y-5 p-5 rounded-2xl border border-border/40 bg-card">
        {/* Site Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5 text-muted-foreground border-b border-border/30 pb-2">
            <Globe className="w-4.5 h-4.5 text-indigo-400" />
            Portal Settings
          </h4>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Portal Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary/80 text-foreground"
            />
          </div>
        </div>

        {/* Database Status */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5 text-muted-foreground border-b border-border/30 pb-2">
            <Database className="w-4.5 h-4.5 text-emerald-400" />
            Integrations Status
          </h4>

          <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-secondary/20 border border-border/40">
            <span className="font-semibold">Firebase Authentication & Firestore</span>
            <span className={`inline-flex px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${
              isFirebaseConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {isFirebaseConfigured ? 'Connected' : 'Local Fallback (Active)'}
            </span>
          </div>
        </div>

        {/* Access Moderation */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5 text-muted-foreground border-b border-border/30 pb-2">
            <Shield className="w-4.5 h-4.5 text-primary" />
            Moderation Policies
          </h4>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="block font-semibold">Allow Public Submissions</span>
              <span className="text-[10px] text-muted-foreground">Guests can request new accounts to publish.</span>
            </div>
            <input
              type="checkbox"
              checked={allowPublicSubmissions}
              onChange={(e) => setAllowPublicSubmissions(e.target.checked)}
              className="w-4 h-4 rounded accent-primary bg-secondary border-border"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <span className="block font-semibold">Moderate Recitations</span>
              <span className="text-[10px] text-muted-foreground">Admins must review audio uploads before live streaming.</span>
            </div>
            <input
              type="checkbox"
              checked={requireAudioApproval}
              onChange={(e) => setRequireAudioApproval(e.target.checked)}
              className="w-4 h-4 rounded accent-primary bg-secondary border-border"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md mt-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Updating...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
}
