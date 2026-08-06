'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, X, Circle, CheckCircle, ExternalLink } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { dbService } from '@/services/db';
import { Notification } from '@/types';
import { toast } from 'sonner';

export default function NotificationCenter() {
  const { user } = useStore();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const list = await dbService.getNotifications(user.id);
      setNotifications(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 8000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      await dbService.markSingleNotificationRead(notif.id, true);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
    setIsOpen(false);

    if (notif.poemId) {
      if (notif.poemId === 'write-yours') {
        router.push('/write-yours');
      } else if (notif.poemId === 'quotes' || notif.poemId === 'thoughts') {
        router.push('/quotes');
      } else if (notif.poemId.startsWith('story-')) {
        router.push(`/story/${notif.poemId}`);
      } else if (notif.poemId.startsWith('poem-')) {
        router.push(`/poem/${notif.poemId}`);
      } else if (notif.poemId.startsWith('qte-')) {
        router.push(`/quote/${notif.poemId}`);
      } else {
        router.push(`/${notif.type}/${notif.poemId}`);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await dbService.markNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await dbService.clearAllNotifications(user.id);
      setNotifications([]);
      toast.success('All notifications cleared.');
      setIsOpen(false);
    } catch {
      toast.error('Failed to clear notifications.');
    }
  };

  const handleToggleRead = async (e: React.MouseEvent, notif: Notification) => {
    e.stopPropagation();
    try {
      const nextRead = !notif.read;
      await dbService.markSingleNotificationRead(notif.id, nextRead);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: nextRead } : n))
      );
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    try {
      await dbService.deleteNotification(notifId);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch {
      toast.error('Failed to delete notification.');
    }
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diff = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days === 1) return 'Yesterday';
      return `${days} days ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-lg bg-secondary/80 text-foreground border border-border/40 hover:bg-secondary transition-all shrink-0 w-[38px] h-[38px] flex items-center justify-center relative cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5 text-foreground/80 shrink-0" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground font-black text-[9px] flex items-center justify-center animate-pulse border border-background shadow">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-[320px] sm:w-[360px] rounded-2xl glass-card border border-border/40 shadow-2xl p-4 space-y-3 z-50 overflow-hidden text-left bg-background/95 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-bold">
                    {unreadCount} New
                  </span>
                )}
              </h4>
            </div>
            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-primary hover:underline"
                  title="Mark all as read"
                >
                  Mark all read
                </button>
                <span className="text-[10px] text-muted-foreground/60">•</span>
                <button
                  onClick={handleClearAll}
                  className="text-[10px] font-bold text-rose-400 hover:underline"
                  title="Clear all"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1.5 -mr-1.5">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 rounded-xl border transition-all flex gap-2.5 items-start cursor-pointer relative group ${
                    notif.read
                      ? 'bg-secondary/15 border-border/30 hover:bg-secondary/25'
                      : 'bg-primary/5 border-primary/20 hover:bg-primary/10 shadow-sm shadow-primary/5'
                  }`}
                >
                  <button
                    onClick={(e) => handleToggleRead(e, notif)}
                    className="mt-0.5 text-muted-foreground hover:text-primary transition-all shrink-0"
                    title={notif.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {notif.read ? (
                      <CheckCircle className="w-3.5 h-3.5 text-muted-foreground/60" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-primary fill-primary" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className={`text-xs text-foreground/90 leading-relaxed font-sans ${notif.read ? 'font-medium' : 'font-bold'}`}>
                      {notif.message}
                    </p>
                    {notif.poemTitle && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-primary tracking-wide">
                        {notif.poemTitle} <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <span className="block text-[8px] text-muted-foreground font-semibold">
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteNotification(e, notif.id)}
                    className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 space-y-1.5 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto text-muted-foreground/35 animate-bounce" />
                <p className="text-xs font-semibold">No notifications yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
