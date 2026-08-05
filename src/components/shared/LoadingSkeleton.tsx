'use client';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'profile';
  count?: number;
}

export default function LoadingSkeleton({ type = 'card', count = 3 }: LoadingSkeletonProps) {
  const arr = Array.from({ length: count });

  if (type === 'list') {
    return (
      <div className="space-y-3 w-full">
        {arr.map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border/30 bg-secondary/10 animate-pulse flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-secondary/80 rounded w-1/3" />
              <div className="h-3 bg-secondary/60 rounded w-1/4" />
            </div>
            <div className="w-12 h-4 bg-secondary/60 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="rounded-2xl border border-border/30 p-6 bg-secondary/15 animate-pulse flex flex-col md:flex-row items-center gap-6 w-full">
        <div className="w-24 h-24 rounded-full bg-secondary" />
        <div className="flex-1 space-y-3 w-full text-center md:text-left">
          <div className="h-6 bg-secondary rounded w-1/4 mx-auto md:mx-0" />
          <div className="h-3 bg-secondary/85 rounded w-1/6 mx-auto md:mx-0" />
          <div className="h-4 bg-secondary/60 rounded w-2/3 mx-auto md:mx-0" />
          <div className="flex justify-center md:justify-start gap-4">
            <div className="w-16 h-4 bg-secondary/80 rounded" />
            <div className="w-16 h-4 bg-secondary/80 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {arr.map((_, i) => (
        <div key={i} className="p-5 rounded-2xl border border-border/30 bg-secondary/15 animate-pulse space-y-4 h-[340px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-secondary" />
                <div className="space-y-1.5">
                  <div className="h-3 bg-secondary rounded w-16" />
                  <div className="h-2 bg-secondary/80 rounded w-10" />
                </div>
              </div>
              <div className="w-12 h-3 bg-secondary/80 rounded" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-5 bg-secondary rounded w-2/3" />
              <div className="space-y-1 pt-2">
                <div className="h-3.5 bg-secondary/80 rounded w-full" />
                <div className="h-3.5 bg-secondary/80 rounded w-5/6" />
                <div className="h-3.5 bg-secondary/80 rounded w-4/5" />
              </div>
            </div>
          </div>
          <div className="border-t border-border/30 pt-4 flex items-center justify-between">
            <div className="w-12 h-4 bg-secondary rounded" />
            <div className="flex gap-2">
              <div className="w-7 h-7 bg-secondary rounded" />
              <div className="w-7 h-7 bg-secondary rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
