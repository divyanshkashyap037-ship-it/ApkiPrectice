import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function DigitalClock({ className }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = format(time, 'HH');
  const minutes = format(time, 'mm');
  const seconds = format(time, 'ss');
  const date = format(time, 'EEE, MMM d, yyyy');

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {/* Digital Clock Display */}
      <div className="flex items-center gap-1">
        <div className="flex flex-col items-center">
          <div className="relative font-mono text-4xl md:text-5xl font-black text-white tracking-tight tabular-nums">
            <span className="drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]">
              {hours}
            </span>
          </div>
        </div>
        
        <span className="text-3xl md:text-4xl font-black text-blue-400 animate-pulse mb-1">
          :
        </span>
        
        <div className="flex flex-col items-center">
          <div className="relative font-mono text-4xl md:text-5xl font-black text-white tracking-tight tabular-nums">
            <span className="drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]">
              {minutes}
            </span>
          </div>
        </div>

        <span className="text-3xl md:text-4xl font-black text-blue-400 animate-pulse mb-1">
          :
        </span>
        
        <div className="flex flex-col items-center">
          <div className="relative font-mono text-4xl md:text-5xl font-black text-blue-300 tracking-tight tabular-nums">
            <span className="drop-shadow-[0_0_20px_rgba(147,197,253,0.6)]">
              {seconds}
            </span>
          </div>
        </div>
      </div>

      {/* Date Display */}
      <div className="mt-2 text-xs md:text-sm font-bold text-zinc-300 tracking-wider">
        {date}
      </div>

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        <div className="absolute top-1/2 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent" />
      </div>
    </div>
  );
}

export default DigitalClock;
