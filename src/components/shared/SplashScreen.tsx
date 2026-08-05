'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [showContent, setShowContent] = useState(false);
  const [loadStatus, setLoadStatus] = useState('Loading your poetic journey...');

  useEffect(() => {
    // Reveal splash screen animations
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 400);

    // After 10 seconds (loading phase completes), change status text
    const statusTimer = setTimeout(() => {
      setLoadStatus('All verses loaded. Enjoy the moment...');
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearTimeout(statusTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden select-none pointer-events-none">
      <style>{`
        @keyframes float-bubble {
          0% {
            transform: translateY(-20vh) translateX(0px) scale(0.6) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.55;
          }
          90% {
            opacity: 0.55;
          }
          100% {
            transform: translateY(110vh) translateX(25px) scale(1.1) rotate(180deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Floating Transparent Bubbles */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => {
          const size = Math.random() * 20 + 8; // 8px to 28px
          return (
            <div
              key={i}
              className="absolute rounded-full border border-white/20 bg-gradient-to-tr from-white/5 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.05),inset_0_0_8px_rgba(255,255,255,0.1)]"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                animation: `float-bubble ${Math.random() * 5 + 4}s infinite linear`,
                animationDelay: `${Math.random() * 6}s`
              }}
            >
              {/* Highlight dot inside bubble */}
              <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
          );
        })}
      </div>

      {/* Main Splash Content */}
      <AnimatePresence>
        {showContent && (
          <div className="flex flex-col items-center justify-center text-center z-20 space-y-7 max-w-xl px-6">
            
            {/* Cinematic Logo Wrapper with Multi-layered Glowing Halos */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              className="relative w-56 h-56 flex items-center justify-center bg-transparent overflow-hidden"
            >
              <video
                src="/images/intro-animation.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-full border border-[#d4af37]/35 shadow-2xl"
              />
            </motion.div>

            {/* Typography Section */}
            <div className="space-y-4">
              {/* Tamil Subtitle/Verse */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1.5 }}
                className="text-sm md:text-base font-bold tracking-wide text-transparent bg-gradient-to-r from-[#ffd89b] via-[#d4af37] to-[#ffd89b] bg-clip-text font-serif leading-relaxed drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)] px-4"
              >
                என் இதயம்  உன்னிடம் பேச மடல் எழுதிய கரங்கள் ....
              </motion.div>

              {/* English App Title */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 1.4 }}
                className="text-3xl md:text-4xl font-black tracking-[0.3em] uppercase font-serif bg-gradient-to-r from-[#fef8e2] via-[#d4af37] to-[#fff8e7] bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(212,175,55,0.35)]"
              >
                Siragii
              </motion.h1>

              {/* Tagline Quote */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 1.5 }}
                className="text-xs md:text-sm font-semibold tracking-widest italic font-sans text-transparent bg-gradient-to-r from-[#fff] via-[#e5c07b] to-[#fff] bg-clip-text drop-shadow-[0_1px_5px_rgba(255,255,255,0.15)] relative overflow-hidden"
              >
                &ldquo;Where Every Word Becomes an Emotion.&rdquo;
                {/* Shimmer sweeping highlights */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer-sweep" />
              </motion.p>
            </div>

            {/* Premium Loader Bar (10s progress load) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8 }}
              className="w-56 space-y-3 pt-6"
            >
              <div className="h-0.5 w-full bg-[#141224] rounded-full overflow-hidden relative">
                <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#d4af37] via-[#f3e3a4] to-[#d4af37] rounded-full animate-progress-bar-10s" />
              </div>
              <span className="block text-[9px] uppercase font-black tracking-[0.2em] text-[#d4af37]/85 animate-pulse">
                {loadStatus}
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Splash Animations Styling */}
      <style jsx global>{`
        @keyframes float-particle {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-250px) translateX(45px) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes draw-ink {
          0% {
            stroke-dasharray: 450;
            stroke-dashoffset: 450;
          }
          100% {
            stroke-dasharray: 450;
            stroke-dashoffset: 0;
          }
        }
        .animate-draw-ink {
          animation: draw-ink 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes quill-float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-6px) rotate(2.5deg) scale(1.02);
          }
        }
        .animate-quill-float {
          animation: quill-float 5s ease-in-out infinite;
        }
        @keyframes shimmer-sweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer-sweep {
          animation: shimmer-sweep 4s infinite ease-in-out;
        }
        @keyframes progress-bar-10s {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress-bar-10s {
          animation: progress-bar-10s 10s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .animate-spin-slow {
          animation: spin 30s linear infinite;
        }
        .animate-reverse-spin-slow {
          animation: reverse-spin-slow 35s linear infinite;
        }
        @keyframes reverse-spin-slow {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
