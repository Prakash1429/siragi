'use client';

import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { User, VisitorProfile } from '@/types';
import { Users, Shield, ShieldAlert, Clock, BookOpen, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [visitorProfiles, setVisitorProfiles] = useState<VisitorProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'registered' | 'visitors'>('visitors');
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<VisitorProfile | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [userList, profileList] = await Promise.all([
          dbService.getUsers(),
          dbService.getVisitorProfiles()
        ]);
        setUsers(userList);
        setVisitorProfiles(profileList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: 'admin' | 'user') => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await dbService.updateUser(userId, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success('User role updated!');
    } catch {
      toast.error('Failed to change role.');
    }
  };

  const formatTimeSpent = (seconds: number) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const isOnline = (lastActiveString: string) => {
    const lastActive = new Date(lastActiveString).getTime();
    const now = Date.now();
    return (now - lastActive) < 300000; // 5 minutes
  };

  if (loading) {
    return <div className="h-40 flex items-center justify-center text-xs animate-pulse">Loading directory...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-2">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Users className="w-4.5 h-4.5 text-primary" />
          User Directory
        </h3>
      </div>

      {/* Visitor Profiles View (Users Module) */}
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[800px]">
            <thead>
              <tr className="bg-secondary/40 text-muted-foreground font-bold border-b border-border/40">
                <th className="p-3 w-16 text-center">S.No</th>
                <th className="p-3">Username</th>
                <th className="p-3">User ID</th>
                <th className="p-3">Joined Date & Time</th>
                <th className="p-3">Last Active</th>
                <th className="p-3">Device Type</th>
                <th className="p-3">Browser</th>
                <th className="p-3">Total Visits</th>
                <th className="p-3">Status</th>
                <th className="p-3">Read Stats</th>
                <th className="p-3">Time Spent</th>
                <th className="p-3 text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {visitorProfiles.map((profile, index) => {
                const online = isOnline(profile.lastActive);
                return (
                  <tr key={profile.id} className="hover:bg-secondary/20">
                    <td className="p-3 text-center text-muted-foreground font-mono">
                      {index + 1}
                    </td>
                    <td className="p-3 font-semibold text-foreground">
                      {profile.username}
                    </td>
                    <td className="p-3 text-muted-foreground font-mono text-[10px] select-all" title={profile.id}>
                      {profile.id.slice(0, 12)}...
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(profile.firstVisit).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(profile.lastActive).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-3 text-foreground font-medium">
                      {profile.deviceType || 'Desktop'}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {profile.browser || 'Unknown'}
                    </td>
                    <td className="p-3 font-bold text-foreground">
                      {profile.visitsCount || 1}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                        online ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        {online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-primary font-semibold">{profile.totalPoemsRead || 0} poems</span>
                      <span className="text-muted-foreground mx-1">•</span>
                      <span className="text-indigo-400 font-semibold">{profile.totalStoriesRead || 0} stories</span>
                    </td>
                    <td className="p-3 font-bold text-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {formatTimeSpent(profile.totalTimeSpent)}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedProfile(profile)}
                        className="px-2 py-1 rounded bg-secondary/50 hover:bg-primary hover:text-primary-foreground text-[10px] font-bold transition-all"
                      >
                        History
                      </button>
                    </td>
                  </tr>
                );
              })}
              {visitorProfiles.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-muted-foreground">No active reader profiles tracked yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reading History Modal Overlay */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 relative animate-in zoom-in duration-200">
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-foreground flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                Reading History: @{selectedProfile.username}
              </h4>
              <p className="text-[10px] text-muted-foreground">Detailed list of publications opened by this visitor.</p>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-border/40 divide-y divide-border/20">
              {selectedProfile.readingHistory && selectedProfile.readingHistory.length > 0 ? (
                selectedProfile.readingHistory.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-secondary/10">
                    <div className="space-y-0.5">
                      <strong className="block text-foreground">{item.title}</strong>
                      <span className={`inline-flex px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-[8px] ${
                        item.type === 'poem' ? 'bg-primary/10 text-primary' : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No content views recorded in reading history.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
