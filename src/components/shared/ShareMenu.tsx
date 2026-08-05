'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Link as LinkIcon, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { dbService } from '@/services/db';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

interface ShareMenuProps {
  contentId: string;
  contentType: 'poem' | 'story';
  title: string;
}

export default function ShareMenu({ contentId, contentType, title }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/${contentType}/${contentId}`;
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
      await dbService.incrementShares(contentId, contentType);
      setIsOpen(false);
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await navigator.share({
          title,
          text: `Read this beautiful ${contentType} on Siragii!`,
          url
        });
        await dbService.incrementShares(contentId, contentType);
        setIsOpen(false);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareClick = (platform: string, shareLink: string) => {
    window.open(shareLink, '_blank');
    dbService.incrementShares(contentId, contentType);
    setIsOpen(false);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const url = encodeURIComponent(getShareUrl());
  const text = encodeURIComponent(`Check out "${title}" on Siragii!`);

  const platforms = [
    { name: 'WhatsApp', icon: MessageSquare, url: `https://api.whatsapp.com/send?text=${text}%20${url}`, color: 'hover:text-emerald-400' },
    { name: 'Facebook', icon: FacebookIcon, url: `https://www.facebook.com/sharer/sharer.php?u=${url}`, color: 'hover:text-blue-500' },
    { name: 'Twitter (X)', icon: TwitterIcon, url: `https://twitter.com/intent/tweet?text=${text}&url=${url}`, color: 'hover:text-sky-400' },
    { name: 'Telegram', icon: Send, url: `https://t.me/share/url?url=${url}&text=${text}`, color: 'hover:text-cyan-400' },
    { name: 'LinkedIn', icon: LinkedinIcon, url: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`, color: 'hover:text-blue-600' }
  ];

  const handleMainClick = () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      handleNativeShare();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={handleMainClick}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/40 text-xs font-bold hover:bg-secondary text-foreground transition-all cursor-pointer"
        title="Share"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border/40 bg-card p-2 shadow-2xl z-30 space-y-1">
          {/* Native Mobile Share */}
          {typeof window !== 'undefined' && (navigator as any).share && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-secondary/40 text-foreground transition-all font-semibold"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Native Share</span>
            </button>
          )}

          {/* Social Platforms */}
          {platforms.map(p => (
            <button
              key={p.name}
              onClick={() => handleShareClick(p.name, p.url)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-secondary/40 text-foreground transition-all font-semibold ${p.color}`}
            >
              <p.icon className="w-3.5 h-3.5" />
              <span>{p.name}</span>
            </button>
          ))}

          <hr className="border-border/30 my-1" />

          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-secondary/40 text-foreground transition-all font-semibold"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </button>
        </div>
      )}
    </div>
  );
}
