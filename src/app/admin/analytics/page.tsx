'use client';

import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { BarChart3, TrendingUp, Sparkles, Languages, Globe2, Monitor, Route, MousePointerClick } from 'lucide-react';
import CountUp from '@/components/shared/CountUp';
import { 
  ResponsiveContainer, 
  AreaChart, Area, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, Legend 
} from 'recharts';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [stats, visData] = await Promise.all([
          dbService.getAnalytics(),
          dbService.getVisitorAnalytics()
        ]);
        setData({
          ...stats,
          ...visData,
          visitorCountries: [
            { name: 'India', value: visData.total },
            { name: 'United States', value: 0 },
            { name: 'Singapore', value: 0 }
          ]
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading || !data) {
    return <div className="h-40 flex items-center justify-center text-xs animate-pulse">Loading Analytics Dashboard...</div>;
  }

  const PRIMARY_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
  const TRAFFIC_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e'];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Analytics' },
        ]}
      />

      <div className="border-b border-border/40 pb-4">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Master System Analytics
        </h1>
        <p className="text-xs text-muted-foreground mt-2">
          Live visitor traffic growth, category split, device usage, and geographic visitor distribution.
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Unique Link Clicks */}
        <div className="p-5 rounded-2xl border border-border/40 bg-secondary/15 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary text-purple-400 shrink-0">
            <MousePointerClick className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Unique Link Clicks</span>
            <strong className="block text-2xl font-black text-foreground mt-1">
              <CountUp end={data.uniqueLinkClicks || 0} />
            </strong>
            <p className="text-[10px] text-muted-foreground mt-1">Counts only one click per unique device or browser per link.</p>
          </div>
        </div>

        {/* Total Visitors */}
        <div className="p-5 rounded-2xl border border-border/40 bg-secondary/15 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary text-emerald-400 shrink-0">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Visitors</span>
            <strong className="block text-2xl font-black text-foreground mt-1">
              <CountUp end={data.total || 0} />
            </strong>
            <p className="text-[10px] text-muted-foreground mt-1">Total unique devices or browsers that visited the platform.</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Daily Views & Visitors Area chart */}
        <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-4">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-primary" />
            Daily Visitors & Views
          </h4>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.visitorTrends}>
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0f111a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="visitors" stroke="#8b5cf6" fill="rgba(139, 92, 246, 0.1)" strokeWidth={2} />
                <Area type="monotone" dataKey="views" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.05)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Uploads Trend Bar chart */}
        <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-4">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Poem Submissions Growth
          </h4>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.visitorTrends}>
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0f111a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                <Bar dataKey="likes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories split Pie chart */}
        <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-4">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
            <Languages className="w-4 h-4 text-emerald-400" />
            Top Poetry Categories
          </h4>
          <div className="h-60 w-full text-xs flex flex-col justify-between">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    dataKey="value"
                  >
                    {data.categoryStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PRIMARY_COLORS[index % PRIMARY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f111a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-around gap-2 text-[9px] font-bold text-muted-foreground mt-2">
              {data.categoryStats.map((item: any, idx: number) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIMARY_COLORS[idx % PRIMARY_COLORS.length] }} />
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geo Countries Bar chart */}
        <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-4">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
            <Globe2 className="w-4 h-4 text-sky-400" />
            Visitor Countries split
          </h4>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.visitorCountries} layout="vertical">
                <XAxis type="number" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={9} width={80} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0f111a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device split Pie chart */}
        <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-4">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
            <Monitor className="w-4 h-4 text-indigo-400" />
            Device Distribution
          </h4>
          <div className="h-60 w-full flex flex-col justify-between">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.deviceUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.deviceUsage.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PRIMARY_COLORS[index % PRIMARY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f111a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around text-[9px] font-bold text-muted-foreground mt-2">
              {data.deviceUsage.map((item: any, idx: number) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIMARY_COLORS[idx % PRIMARY_COLORS.length] }} />
                  <span>{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Sources Bar chart */}
        <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-4">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
            <Route className="w-4 h-4 text-rose-400" />
            Traffic Sources Overview
          </h4>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trafficSources}>
                <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0f111a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
