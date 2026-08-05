'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { dbService } from '@/services/db';
import { Poem, ActivityLog, Achievement } from '@/types';
import Breadcrumb from '@/components/shared/Breadcrumb';
import PoemCard from '@/components/poems/PoemCard';
import CountUp from '@/components/shared/CountUp';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { 
  Award, Heart, Eye, Share2, Bookmark, MessageCircle, Calendar, Users, 
  Feather, Sparkles, BarChart3, TrendingUp, CheckCircle2 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { toast } from 'sonner';

export default function UserDashboardPage() {
  const { user } = useStore();
  const router = useRouter();

  const [myPoems, setMyPoems] = useState<Poem[]>([]);
  const [popularPoem, setPopularPoem] = useState<Poem | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to view dashboard.');
      router.push('/login');
      return;
    }

    async function loadDashboardData() {
      if (!user) return;
      try {
        const [poemsList, logs, achList, data] = await Promise.all([
          dbService.getPoems('published'),
          dbService.getActivityLogs(user.id),
          dbService.getAchievements(user.id),
          dbService.getAnalytics(user.id)
        ]);

        const filtered = poemsList.filter((p) => p.authorId === user.id);
        setMyPoems(filtered);
        setActivities(logs);
        setAchievements(achList);
        setAnalytics(data);

        if (filtered.length > 0) {
          const sorted = [...filtered].sort((a, b) => b.viewsCount - a.viewsCount);
          setPopularPoem(sorted[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user, router]);

  if (!user) return null;

  if (loading || !analytics) {
    return <LoadingSkeleton type="profile" />;
  }

  const statCards = [
    { name: 'Total Poems', value: myPoems.length, icon: Feather, color: 'text-primary' },
    { name: 'Total Likes', value: analytics.totalLikes, icon: Heart, color: 'text-rose-500' },
    { name: 'Total Comments', value: analytics.totalComments, icon: MessageCircle, color: 'text-indigo-400' },
    { name: 'Total Shares', value: analytics.totalShares, icon: Share2, color: 'text-sky-400' },
    { name: 'Total Saves', value: analytics.totalSaves, icon: Bookmark, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Profile', href: '/profile' },
          { label: 'Dashboard' },
        ]}
      />

      {/* Welcome Block */}
      <div className="rounded-3xl border border-border/40 p-6 md:p-8 bg-gradient-to-br from-indigo-950/20 via-background to-card relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-xs font-bold text-primary border border-primary/20 tracking-wide uppercase">
            Poet Workspace
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xs text-muted-foreground max-w-md">
            Here is your weekly summary, writing achievements, and analytics catalogue. Keep composing!
          </p>
        </div>

        {/* Profile Completion bar */}
        <div className="w-full md:w-60 p-4 rounded-2xl bg-secondary/30 border border-border/40 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span>Profile Completion</span>
            <span className="text-primary">{user.profileCompletion || 80}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${user.profileCompletion || 80}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {user.profileCompletion === 100 ? 'Profile fully completed!' : 'Complete your bio to reach 100%.'}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.name} className="p-4 rounded-2xl border border-border/40 bg-secondary/15 flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-secondary shrink-0 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{card.name}</span>
              <strong className="block text-base font-black text-foreground"><CountUp end={card.value} /></strong>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Analytics Area chart */}
      <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-4">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
          <TrendingUp className="w-4 h-4 text-primary" />
          Weekly Views & Engagement Analytics
        </h3>
        <div className="h-60 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.visitorTrends}>
              <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#0f111a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="views" stroke="#8b5cf6" fill="rgba(139, 92, 246, 0.1)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="likes" stroke="#10b981" fill="rgba(16, 185, 129, 0.05)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Popular Poem & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Popular Poem */}
          {popularPoem && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                <Sparkles className="w-4.5 h-4.5 text-primary" />
                Most Popular Poem
              </h3>
              <PoemCard poem={popularPoem} />
            </div>
          )}

          {/* Recent Activity */}
          <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-4">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
              <Calendar className="w-4.5 h-4.5 text-indigo-400" />
              Recent Activity logs
            </h3>
            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-xs py-2 border-b border-border/30 last:border-b-0">
                    <span className="font-semibold text-foreground">{log.details || `Logged action: ${log.action}`}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(log.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No recent activity.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Achievements & Badges */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-4">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
              <Award className="w-4.5 h-4.5 text-amber-500" />
              Achievements & Badges
            </h3>

            {/* Streak */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-amber-400">Reading Streak</span>
                <span className="text-[10px] text-muted-foreground">Composing/reading consecutive days</span>
              </div>
              <strong className="text-lg font-black text-amber-400">{user.readingStreak || 3} days</strong>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {achievements.map((ach) => (
                <div 
                  key={ach.id} 
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                    ach.unlockedAt 
                      ? "bg-primary/10 border-primary/30 text-primary" 
                      : "bg-secondary/20 border-border/30 text-muted-foreground opacity-60"
                  }`}
                >
                  <Award className="w-6 h-6" />
                  <span className="text-[10px] font-black">{ach.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
