'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { dbService } from '@/services/db';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { Save, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileEditPage() {
  const { user, setUser } = useStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Please configure your username first.');
      router.push('/');
      return;
    }
    setName(user.name);
    setBio(user.bio || '');
    setAvatarUrl(user.avatarUrl || '');
    setEnableNotifications(user.enableNotifications !== false);
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const updatedData = { name, bio, avatarUrl, enableNotifications };
      await dbService.updateUser(user.id, updatedData);
      
      const newProfile = { ...user, ...updatedData };
      setUser(newProfile);
      localStorage.setItem('siragii_user', JSON.stringify(newProfile));

      // Sync to Visitor Profile in local storage and Firestore
      const storedProfile = localStorage.getItem('siragii_visitor_profile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        const updatedVisitor = { ...parsed, username: name };
        localStorage.setItem('siragii_visitor_profile', JSON.stringify(updatedVisitor));
        await dbService.updateVisitorProfile(user.id, { username: name });
      }
      
      toast.success('Profile updated successfully!');
      router.push('/profile');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <Breadcrumb
        items={[
          { label: 'Profile', href: '/profile' },
          { label: 'Edit' },
        ]}
      />

      <div className="border-b border-border/40 pb-4">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Edit Profile
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Display Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-secondary/30 border border-border/50 text-sm focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition-all text-foreground"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Biography
          </label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            className="w-full p-4 rounded-xl bg-secondary/30 border border-border/50 text-sm focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition-all text-foreground"
          />
        </div>

        {/* Avatar URL */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Avatar Image URL
          </label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full h-12 px-4 rounded-xl bg-secondary/30 border border-border/50 text-sm focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition-all text-foreground"
          />
        </div>

        {/* Enable Notifications */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-secondary/15">
          <div className="space-y-0.5 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
              Enable Admin Reply Notifications
            </span>
            <span className="text-[10px] text-muted-foreground block">
              Show desktop notifications and alerts when an admin replies to your comments.
            </span>
          </div>
          <input
            type="checkbox"
            checked={enableNotifications}
            onChange={(e) => {
              const checked = e.target.checked;
              setEnableNotifications(checked);
              if (checked && typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
                Notification.requestPermission();
              }
            }}
            className="w-4 h-4 rounded text-primary focus:ring-primary/45 border-border bg-secondary cursor-pointer shrink-0"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-primary-foreground font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </form>
    </div>
  );
}
