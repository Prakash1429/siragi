'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Poem, Comment } from '@/types';
import { dbService } from '@/services/db';
import { useStore } from '@/store/useStore';
import CommentCard from '@/components/poems/CommentCard';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import PoemCard from '@/components/poems/PoemCard';
import { 
  Heart, Share2, MessageCircle, Calendar, FolderHeart,
  Maximize2, Minimize2, Eye, EyeOff, Sparkles, Copy, Download, Image as ImageIcon, CopyCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ShareMenu from '@/components/shared/ShareMenu';
import AddToCollectionModal from '@/components/shared/AddToCollectionModal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PoemDetailPage({ params }: PageProps) {
  const { id } = React.use(params);
  const { user, setCurrentTrack } = useStore();
  
  const [poem, setPoem] = useState<Poem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Recommendations
  const [similarPoems, setSimilarPoems] = useState<Poem[]>([]);
  
  // Focus Mode configuration states
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [lineHeight, setLineHeight] = useState<'relaxed' | 'loose' | 'extra'>('relaxed');
  const [focusTheme, setFocusTheme] = useState<'dark' | 'light'>('dark');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // Interaction stats
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // 1. Initial Page Load & Analytics Logging (only runs once per id)
  useEffect(() => {
    async function loadPoemDetails() {
      try {
        const data = await dbService.getPoemById(id);
        if (data) {
          setPoem(data);
          setLikesCount(data.likesCount);
          
          const [commentList, related] = await Promise.all([
            dbService.getComments(id),
            dbService.getRelatedPoems(id)
          ]);
          setComments(commentList);
          setSimilarPoems(related);
          
          // Increment view count & log visitor (with rate limiting to prevent accidental refreshes)
          const lastViewedKey = `siragii_last_viewed_poem_${id}`;
          const lastViewed = localStorage.getItem(lastViewedKey);
          const nowStr = Date.now().toString();
          
          if (!lastViewed || Date.now() - parseInt(lastViewed, 10) > 5000) {
            await dbService.incrementViews(id, 'poem');
            await dbService.logVisitor(`/poem/${id}`);
            localStorage.setItem(lastViewedKey, nowStr);
          }
          
          // ALWAYS record to unique visitor reading history profile
          const visitorId = user?.id || localStorage.getItem('siragii_visitor_id');
          if (visitorId) {
            await dbService.recordContentRead(visitorId, id, 'poem', data.title);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPoemDetails();
  }, [id, user]);

  // 2. User Session-specific checks (liked, favorited states)
  useEffect(() => {
    async function checkUserInteractions() {
      if (!user) return;
      try {
        const [liked, fav] = await Promise.all([
          dbService.hasLikedContent(id, user.id),
          dbService.hasFavorited(id, user.id)
        ]);
        setIsLiked(liked);
        setIsFavorited(fav);
      } catch (err) {
        console.error('Error checking user interactions:', err);
      }
    }
    checkUserInteractions();
  }, [id, user]);

  // Teleprompter Auto-Scroll Effect
  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollInterval.current = setInterval(() => {
        window.scrollBy({ top: 1, behavior: 'smooth' });
      }, 40);
    } else {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    }
    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, [isAutoScrolling]);

  const handleLike = async () => {
    if (!user || !poem) {
      toast.error('Please login to like poems.');
      return;
    }
    const liked = await dbService.likeContent(poem.id, 'poem', user.id);
    setIsLiked(liked);
    setLikesCount((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
    toast.success(liked ? 'Liked!' : 'Removed like.');
  };

  const handleFavorite = async () => {
    if (!user || !poem) {
      toast.error('Please login to save favorites.');
      return;
    }
    const fav = await dbService.favoritePoem(poem.id, user.id);
    setIsFavorited(fav);
    toast.success(fav ? 'Added to library!' : 'Removed from library.');
  };


  const handleCopy = () => {
    if (!poem) return;
    navigator.clipboard.writeText(`${poem.title}\n\n${poem.content}\n\n— By ${poem.authorName}`);
    toast.success('Poem content copied!');
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleDownloadPNG = async (scale: number = 1.5) => {
    if (!exportRef.current || !poem) return;
    toast.info('Generating image...');
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(exportRef.current, { 
        cacheBust: true, 
        pixelRatio: scale 
      });
      const link = document.createElement('a');
      link.download = `${poem.title.toLowerCase().replace(/\s+/g, '_')}_siragii.png`;
      link.href = dataUrl;
      link.click();
      toast.success('PNG downloaded successfully!');
      await dbService.incrementDownloads(poem.id, 'poem');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export as image.');
    }
  };

  const handleCopyImage = async () => {
    if (!exportRef.current) return;
    toast.info('Copying to clipboard...');
    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(exportRef.current, { pixelRatio: 2 });
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        toast.success('Image copied to clipboard!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to copy image.');
    }
  };



  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !poem) {
      toast.error('Please login to comment.');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const added = await dbService.addComment({
        contentId: poem.id,
        contentType: 'poem',
        contentTitle: poem.title,
        userId: user.id,
        userName: user.name,
        userUsername: user.username,
        userAvatar: user.avatarUrl,
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, added]);
      setNewComment('');
      toast.success('Comment posted!');
    } catch {
      toast.error('Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!poem) return;
    try {
      await dbService.deleteComment(commentId, poem.id, 'poem');
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted.');
    } catch {
      toast.error('Failed to delete comment.');
    }
  };

  const handleDeleteCommentReply = async (commentId: string, replyId: string) => {
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;
      const updatedReplies = (comment.replies || []).filter(r => r.id !== replyId);
      await dbService.updateCommentStatus(commentId, { replies: updatedReplies });
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, replies: updatedReplies } : c));
      toast.success('Reply deleted.');
    } catch {
      toast.error('Failed to delete reply.');
    }
  };

  if (loading) {
    return <LoadingSkeleton type="profile" />;
  }

  if (!poem) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Poem not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      <Breadcrumb
        items={[
          { label: 'Category', href: `/category/${poem.categorySlug}` },
          { label: poem.title },
        ]}
      />

      {/* Control Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-2xl glass border border-border/40">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={cn(
              "h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              isFocusMode ? "bg-primary text-primary-foreground" : "bg-secondary/60 hover:bg-secondary text-foreground"
            )}
          >
            {isFocusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}</span>
          </button>
          <button
            onClick={handleFullscreenToggle}
            className="h-10 px-4 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground text-xs font-bold transition-all flex items-center gap-2"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>Fullscreen</span>
          </button>
          <button
            onClick={handleCopy}
            className="h-10 px-4 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground text-xs font-bold transition-all flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Text</span>
          </button>
        </div>

        {/* PNG Export Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleDownloadPNG(1.5)}
            className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={() => handleDownloadPNG(3.0)}
            className="h-10 px-4 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground text-xs font-bold transition-all flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            <span>HD Image</span>
          </button>
          <button
            onClick={handleCopyImage}
            className="h-10 px-4 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground text-xs font-bold transition-all flex items-center gap-2"
          >
            <CopyCheck className="w-4 h-4" />
            <span>Copy as Image</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Poem area */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {isFocusMode ? (
              <motion.div
                key="focus"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={cn(
                  "p-8 md:p-16 rounded-3xl border shadow-2xl transition-colors duration-300 relative",
                  focusTheme === 'dark' 
                    ? "bg-slate-950 border-slate-800 text-slate-100" 
                    : "bg-white border-slate-200 text-slate-900"
                )}
              >
                {/* Focus controls menu toolbar */}
                <div className="absolute top-4 right-4 flex items-center gap-3 bg-secondary/30 backdrop-blur px-3 py-1.5 rounded-xl border border-border/20 z-20">
                  <button 
                    onClick={() => setFocusTheme(focusTheme === 'dark' ? 'light' : 'dark')}
                    className="p-1.5 hover:bg-secondary/50 rounded-lg text-xs font-bold"
                  >
                    {focusTheme === 'dark' ? 'Light Theme' : 'Dark Theme'}
                  </button>

                  <div className="w-[1px] h-4 bg-border/40" />

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setFontSize('sm')} 
                      className={cn("px-2 py-0.5 rounded text-[10px]", fontSize === 'sm' && "bg-primary text-white")}
                    >
                      A-
                    </button>
                    <button 
                      onClick={() => setFontSize('xl')} 
                      className={cn("px-2 py-0.5 rounded text-[10px]", fontSize === 'xl' && "bg-primary text-white")}
                    >
                      A+
                    </button>
                  </div>

                  <div className="w-[1px] h-4 bg-border/40" />

                  <button 
                    onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : fontFamily === 'sans' ? 'mono' : 'serif')}
                    className="p-1 text-xs font-serif"
                  >
                    {fontFamily.toUpperCase()}
                  </button>
                </div>

                <div className="text-center max-w-xl mx-auto space-y-10 py-6">
                  <h1 className="text-3xl md:text-4xl font-black">{poem.title}</h1>
                  <div className={cn(
                    "poem-text leading-loose italic whitespace-pre-wrap",
                    fontSize === 'sm' && 'text-sm',
                    fontSize === 'md' && 'text-base',
                    fontSize === 'lg' && 'text-xl',
                    fontSize === 'xl' && 'text-2xl',
                    fontFamily === 'serif' && 'font-serif',
                    fontFamily === 'sans' && 'font-sans',
                    fontFamily === 'mono' && 'font-mono',
                    lineHeight === 'relaxed' && 'leading-relaxed',
                    lineHeight === 'loose' && 'leading-loose',
                    lineHeight === 'extra' && 'leading-[2.5]'
                  )}>
                    {poem.content}
                  </div>
                  <span className="block text-xs opacity-75 border-t border-border/20 pt-4">
                    — Author: {poem.authorName}
                  </span>
                </div>
              </motion.div>
            ) : (
              <article className="rounded-3xl border border-border/40 glass-card p-6 md:p-10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-primary/10 blur-3xl -z-10" />

                {/* Metadata Header */}
                <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${poem.authorUsername}`}
                      alt={poem.authorName}
                      className="w-10 h-10 rounded-full bg-secondary object-cover"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{poem.authorName}</h3>
                      <p className="text-xs text-muted-foreground">@{poem.authorUsername}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs font-semibold text-primary">
                      {poem.categoryName}
                    </span>
                    <div className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(poem.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Poem Content */}
                <div className="text-center py-4">
                  <h1 className="text-2xl md:text-3xl font-black text-foreground mb-8">
                    {poem.title}
                  </h1>
                  <div className="poem-text text-lg italic text-foreground/95 select-none font-serif leading-relaxed whitespace-pre-wrap">
                    {poem.content}
                  </div>
                </div>

                {/* Interaction Toolbar */}
                <div className="border-t border-border/40 pt-6 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleLike}
                      className={cn(
                        "flex items-center gap-2 text-sm font-bold transition-all hover:scale-105",
                        isLiked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
                      )}
                    >
                      <Heart className={cn("w-5 h-5", isLiked && "fill-rose-500")} />
                      <span>{likesCount} Likes</span>
                    </button>
                    <span className="text-sm text-muted-foreground font-semibold flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      <span>{comments.length} Comments</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <ShareMenu contentId={poem.id} contentType="poem" title={poem.title} />
                    <button
                      onClick={() => setShowCollectionModal(true)}
                      className="p-2.5 rounded-xl border border-border/40 text-white hover:text-primary bg-slate-950/40 transition-all hover:scale-110 active:scale-95 shadow-md backdrop-blur-sm"
                      title="Add to Collection"
                    >
                      <FolderHeart className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={handleFavorite}
                      className={cn(
                        "p-2.5 rounded-xl border transition-all hover:scale-110 active:scale-95 shadow-md backdrop-blur-sm",
                        isFavorited
                          ? "bg-rose-500/10 border-rose-500/25 text-rose-500"
                          : "border-border/40 text-white hover:text-rose-500 bg-slate-950/40"
                      )}
                      title={isFavorited ? "Remove from Library" : "Save to Library"}
                    >
                      <Heart className={cn("w-4.5 h-4.5 transition-all duration-300", isFavorited && "fill-rose-500")} />
                    </button>
                  </div>
                </div>
              </article>
            )}
          </AnimatePresence>

          {/* Discussions */}
          <section className="space-y-6">
            <h3 className="text-lg font-black text-foreground">Discussions</h3>
            <form onSubmit={handleAddComment} className="flex flex-col gap-3">
              <textarea
                placeholder="Add to the conversation..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-2xl bg-secondary/40 border border-border/50 text-sm focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition-all text-foreground"
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="self-end px-5 py-2.5 bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-primary-foreground font-bold text-xs rounded-xl transition-all shadow-md"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>

            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    onDelete={handleDeleteComment}
                    onRefresh={async () => {
                      const list = await dbService.getComments(id);
                      setComments(list);
                    }}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No comments yet.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar recommendations */}
        <aside className="space-y-6 lg:col-span-1">
          <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
              Related Poems
            </h3>
            <div className="space-y-4">
              {similarPoems.map((p) => (
                <PoemCard key={p.id} poem={p} />
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Hidden 1080x1350 Instagram styled PNG template container */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div 
          ref={exportRef}
          style={{
            width: '1080px',
            height: '1350px',
            background: focusTheme === 'dark' ? 'linear-gradient(135deg, #090d16 0%, #03050a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
            color: focusTheme === 'dark' ? '#f8fafc' : '#0f172a',
            padding: '100px 80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6, fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px' }}>
            <span>Siragii</span>
            <span>{poem.categoryName}</span>
          </div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '60px', padding: '0 40px' }}>
            <h1 style={{ fontSize: '56px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>{poem.title}</h1>
            <p style={{ 
              fontSize: '34px', 
              fontStyle: 'italic', 
              lineHeight: 1.8, 
              whiteSpace: 'pre-wrap', 
              fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : fontFamily === 'sans' ? 'sans-serif' : 'monospace',
              margin: '0 auto' 
            }}>
              {poem.content}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: focusTheme === 'dark' ? '2px solid rgba(255,255,255,0.08)' : '2px solid rgba(0,0,0,0.08)', paddingTop: '40px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>— {poem.authorName}</span>
            <span style={{ fontSize: '18px', opacity: 0.5 }}>siragii.com</span>
          </div>
        </div>
      </div>

      {showCollectionModal && (
        <AddToCollectionModal
          itemId={poem.id}
          itemType="poem"
          onClose={() => setShowCollectionModal(false)}
        />
      )}
    </div>
  );
}
