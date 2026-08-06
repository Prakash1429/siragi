'use client';

import React, { useEffect, useState } from 'react';
import { Quote, Comment } from '@/types';
import { dbService } from '@/services/db';
import { useStore } from '@/store/useStore';
import CommentCard from '@/components/poems/CommentCard';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { 
  Heart, Share2, MessageCircle, Calendar,
  Eye, Sparkles, Copy, CopyCheck, FolderHeart
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import AddToCollectionModal from '@/components/shared/AddToCollectionModal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function QuoteDetailPage({ params }: PageProps) {
  const { id } = React.use(params);
  const { user } = useStore();
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction stats
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    async function loadQuoteDetails() {
      try {
        const data = await dbService.getQuoteById(id);
        if (data) {
          setQuote(data);
          setLikesCount(data.likesCount || 0);
          
          const commentList = await dbService.getComments(id);
          setComments(commentList);
          
          // Increment view count & log visitor (with rate limiting to prevent accidental refreshes)
          const lastViewedKey = `siragii_last_viewed_quote_${id}`;
          const lastViewed = localStorage.getItem(lastViewedKey);
          const nowStr = Date.now().toString();
          
          if (!lastViewed || Date.now() - parseInt(lastViewed, 10) > 5000) {
            await dbService.incrementViews(id, 'quote');
            await dbService.logVisitor(`/quote/${id}`);
            localStorage.setItem(lastViewedKey, nowStr);
          }
          
          // ALWAYS record to unique visitor reading history profile
          const visitorId = user?.id || localStorage.getItem('siragii_visitor_id');
          if (visitorId) {
            await dbService.recordContentRead(visitorId, id, 'quote', `Quote by ${data.author}`);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadQuoteDetails();
  }, [id, user]);

  useEffect(() => {
    async function checkUserInteractions() {
      if (!user) return;
      try {
        const [liked, faved] = await Promise.all([
          dbService.hasLiked(id, user.id),
          dbService.hasFavorited(id, user.id)
        ]);
        setIsLiked(liked);
        setIsFavorited(faved);
      } catch (err) {
        console.error('Error checking user interactions:', err);
      }
    }
    checkUserInteractions();
  }, [id, user]);

  const handleFavorite = async () => {
    if (!user) {
      toast.error('Please configure your username to save thoughts.');
      return;
    }
    try {
      const faved = await dbService.favoriteQuote(id, user.id);
      setIsFavorited(faved);
      toast.success(faved ? 'Added to favorites' : 'Removed from favorites');
    } catch {
      toast.error('Failed to toggle favorite.');
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please configure your username to like thoughts.');
      return;
    }
    try {
      const liked = await dbService.likeContent(id, 'quote', user.id);
      setIsLiked(liked);
      setLikesCount(prev => liked ? prev + 1 : Math.max(0, prev - 1));
      toast.success(liked ? 'Added to liked thoughts' : 'Removed from liked thoughts');
    } catch {
      toast.error('Failed to toggle like.');
    }
  };

  const handleCopy = () => {
    if (!quote) return;
    navigator.clipboard.writeText(`"${quote.content}" — ${quote.author}`);
    setCopied(true);
    toast.success('Quote copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!quote) return;
    try {
      await dbService.incrementShares(id, 'quote');
    } catch (err) {
      console.error(err);
    }
    if (navigator.share) {
      navigator.share({
        title: `Quote by ${quote.author}`,
        text: `"${quote.content}" — ${quote.author}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      handleCopy();
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please configure your username to comment.');
      return;
    }
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const added = await dbService.addComment({
        contentId: id,
        contentType: 'quote',
        contentTitle: `Quote by ${quote?.author || 'Prakash'}`,
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
    try {
      await dbService.deleteComment(commentId, id, 'quote');
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

  if (!quote) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Quote not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4">
      <Breadcrumb
        items={[
          { label: 'Thoughts & Quotes', href: '/quotes' },
          { label: `Quote by ${quote.author}` },
        ]}
      />

      {/* Main Quote Card */}
      <motion.article 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 md:p-12 rounded-2xl glass-card gradient-border relative overflow-hidden flex flex-col justify-between min-h-[300px]"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="space-y-6 relative z-10">
          <span className="block text-[64px] text-primary/20 font-serif leading-none h-8">&ldquo;</span>
          <p className="text-xl md:text-2xl font-black text-foreground font-serif leading-relaxed pl-6 whitespace-pre-line">
            {quote.content}
          </p>
        </div>

        <div className="pt-8 border-t border-border/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 relative z-10">
          <div className="space-y-1">
            <span className="block text-sm font-bold text-foreground italic">— {quote.author}</span>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(quote.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {quote.viewsCount || 0} views
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-bold ${
                isLiked
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                  : 'bg-secondary/40 border-border/50 hover:bg-rose-500/5 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{likesCount} Likes</span>
            </button>

            {/* Save to Collection */}
            <button
              onClick={() => {
                if (!user) {
                  toast.error('Please configure your username first.');
                  return;
                }
                setShowCollectionModal(true);
              }}
              className="p-2 rounded-full bg-secondary/40 border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
              title="Add to Collection"
            >
              <FolderHeart className="w-4 h-4" />
            </button>

            {/* Favorite / Library */}
            <button
              onClick={handleFavorite}
              className="p-2 rounded-full bg-secondary/40 border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
              title={isFavorited ? "Remove from Library" : "Save to Library"}
            >
              <Heart className={`w-4 h-4 transition-all duration-300 ${isFavorited ? 'fill-rose-500 text-rose-500 animate-bounce' : ''}`} />
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-full bg-secondary/40 border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
              title="Copy quote text"
            >
              {copied ? <CopyCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-secondary/40 border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
              title="Share quote link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {quote.category && (
              <span className="px-3 py-1.5 rounded-full bg-secondary text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                {quote.category}
              </span>
            )}
          </div>
        </div>
      </motion.article>

      {/* Comments section */}
      <section className="space-y-6 pt-6">
        <h3 className="text-base font-black text-foreground flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Reader Discussion ({comments.length})
        </h3>

        {/* Comment form */}
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Write your thoughts about this quote..." : "Please configure your username in profile to join discussion."}
            disabled={!user || submittingComment}
            rows={3}
            className="w-full p-4 rounded-2xl bg-secondary/25 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground leading-relaxed resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!user || !newComment.trim() || submittingComment}
              className="h-9 px-5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs transition-all disabled:opacity-50"
            >
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>

        {/* Comments list */}
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
            <div className="p-8 text-center border border-dashed border-border/40 rounded-2xl text-xs text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </section>

      {showCollectionModal && (
        <AddToCollectionModal
          itemId={id}
          itemType="quote"
          onClose={() => setShowCollectionModal(false)}
        />
      )}
    </div>
  );
}
