'use client';

import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { BookOpen, Heart, Users, Share2, MousePointerClick, Eye } from 'lucide-react';
import CountUp from '@/components/shared/CountUp';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [visitorsStats, setVisitorsStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [analytics, visData] = await Promise.all([
          dbService.getAnalytics(),
          dbService.getVisitorAnalytics()
        ]);
        setStats(analytics);
        setVisitorsStats(visData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading || !stats || !visitorsStats) {
    return <div className="h-40 flex items-center justify-center text-xs animate-pulse">Loading dashboard...</div>;
  }

  const statCards = [
    { name: 'Total Published Content', value: stats.totalPoems + stats.totalStories + (stats.totalQuotes || 0), icon: BookOpen, color: 'text-primary' },
    { name: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'text-rose-500' },
    { name: 'Total Shares', value: stats.totalShares, icon: Share2, color: 'text-sky-400' },
    { name: 'Total Visitors', value: visitorsStats.total, icon: Users, color: 'text-rose-400' },
    { name: 'Total Views', value: stats.totalViews || 0, icon: Eye, color: 'text-emerald-400' },
    { name: 'Unique Link Clicks', value: stats.uniqueLinkClicks || 0, icon: MousePointerClick, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.name} className="p-4 rounded-xl border border-border/40 bg-secondary/15 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-secondary shrink-0 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{card.name}</span>
              <strong className="block text-lg font-black text-foreground">
                <CountUp end={card.value} />
              </strong>
            </div>
          </div>
        ))}
      </div>


      {/* Double columns: Popular content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Popular Poem / Story */}
        <section className="p-5 rounded-2xl border border-border/40 bg-card space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
            Top Content Overview
          </h3>
          <div className="space-y-3 text-xs max-w-xl">
            <div className="flex justify-between border-b border-border/20 pb-2">
              <span className="text-muted-foreground">Most Popular Poem:</span>
              <span className="font-bold">{stats.mostPopularPoem ? stats.mostPopularPoem.title : 'None yet'}</span>
            </div>
            <div className="flex justify-between border-b border-border/20 pb-2">
              <span className="text-muted-foreground">Total Clicks & Content Views:</span>
              <span className="font-bold">{stats.totalViews} views</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
