'use client';

import { useEffect, useState } from 'react';

interface CountUpProps {
  end: number;
  duration?: number; // duration in ms
}

export default function CountUp({ end, duration = 1500 }: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing out function
      const easeOutQuad = (t: number) => t * (2 - t);
      
      setCount(Math.floor(easeOutQuad(percentage) * end));

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return <>{count}</>;
}
