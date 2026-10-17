import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';

export function MonthlyActivityHeatmap({
  questions = [],
  contributions = [],
  className,
}) {
  // Always use real current date
  const currentDate = React.useMemo(() => new Date(), []);

  // Count completions per date YYYY-MM-DD
  const countsByDate = React.useMemo(() => {
    const map = {};
    questions.forEach((q) => {
      if (q.completedAt) {
        map[q.completedAt] = (map[q.completedAt] || 0) + 1;
      }
    });
    contributions.forEach((c) => {
      if (c.date && c.count > 0 && !map[c.date]) {
        map[c.date] = c.count;
      }
    });
    return map;
  }, [questions, contributions]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Monday-first indexing: Mon=0 .. Sun=6
  const firstDayIndex = (getDay(monthStart) + 6) % 7;

  // Monthly stats
  const { totalSolvedMonth, activeDaysMonth, maxInADay } = React.useMemo(() => {
    let total = 0;
    let activeDays = 0;
    let maxCount = 0;

    daysInMonth.forEach((d) => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = countsByDate[dateStr] || 0;
      if (count > 0) {
        total += count;
        activeDays += 1;
        if (count > maxCount) maxCount = count;
      }
    });

    return { totalSolvedMonth: total, activeDaysMonth: activeDays, maxInADay: maxCount };
  }, [daysInMonth, countsByDate]);

  const getLevel = (count) => {
    if (!count || count <= 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count <= 4) return 3;
    return 4;
  };

  const getLevelStyles = (level) => {
    switch (level) {
      case 1:
        return 'bg-blue-600/50 border-blue-400/60 text-blue-100 shadow-[0_0_6px_rgba(59,130,246,0.35)]';
      case 2:
        return 'bg-blue-500/80 border-blue-300/70 text-white shadow-[0_0_8px_rgba(59,130,246,0.55)]';
      case 3:
        return 'bg-sky-400 border-sky-200 text-zinc-950 font-black shadow-[0_0_12px_rgba(56,189,248,0.7)]';
      case 4:
        return 'bg-cyan-300 border-white text-zinc-950 font-black shadow-[0_0_16px_rgba(103,232,249,0.9)]';
      default:
        return 'bg-white/[0.05] border-white/[0.08] text-zinc-300 hover:bg-white/[0.12] hover:text-white';
    }
  };

  const weekDayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className={cn('w-full flex flex-col sm:flex-row items-center justify-between gap-5 py-1', className)}>
      {/* Left: Monthly Metrics and Legend */}
      <div className="w-full sm:w-[40%] flex flex-col justify-around gap-4 h-full">
        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 flex flex-col">
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Solved</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-0.5">{totalSolvedMonth}</span>
            <span className="text-[10px] text-zinc-300 font-medium">problems</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 flex flex-col">
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Active</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{activeDaysMonth}</span>
            <span className="text-[10px] text-zinc-300 font-medium">days</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 flex flex-col">
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Max / Day</span>
            <span className="text-xl sm:text-2xl font-black text-blue-400 mt-0.5">{maxInADay}</span>
            <span className="text-[10px] text-zinc-300 font-medium">peak</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-zinc-200 font-semibold px-0.5">
          <span className="text-zinc-200">Activity Level</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-300 text-[10px]">Less</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-[3px] bg-white/[0.06] border border-white/[0.12]" />
              <div className="w-2.5 h-2.5 rounded-[3px] bg-blue-600/50" />
              <div className="w-2.5 h-2.5 rounded-[3px] bg-blue-500/80" />
              <div className="w-2.5 h-2.5 rounded-[3px] bg-sky-400" />
              <div className="w-2.5 h-2.5 rounded-[3px] bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.7)]" />
            </div>
            <span className="text-zinc-300 text-[10px]">More</span>
          </div>
        </div>
      </div>

      {/* Right: The 7-Column Month Heatmap Grid */}
      <div className="w-full sm:w-[60%] flex flex-col items-center">
        {/* Day-of-Week headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 w-full max-w-[270px] sm:max-w-[290px] mb-1.5 text-center">
          {weekDayLabels.map((lbl, i) => (
            <span key={i} className="text-[11px] font-extrabold text-zinc-200">
              {lbl}
            </span>
          ))}
        </div>

        {/* Day cells grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 w-full max-w-[270px] sm:max-w-[290px]">
          {/* Empty spacer cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="w-full aspect-square opacity-0 pointer-events-none" />
          ))}

          {/* Actual Month Days */}
          {daysInMonth.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const count = countsByDate[dateStr] || 0;
            const level = getLevel(count);
            const today = isToday(day);

            return (
              <div
                key={dateStr}
                className="relative group w-full aspect-square"
              >
                <div
                  className={cn(
                    'w-full h-full rounded-lg border flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-150 cursor-pointer select-none',
                    getLevelStyles(level),
                    today && 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-zinc-950 font-black scale-105 z-10'
                  )}
                >
                  {format(day, 'd')}
                </div>

                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-50 whitespace-nowrap">
                  <div className="px-2.5 py-1 rounded-lg bg-zinc-900/95 border border-white/20 text-white text-[10px] font-semibold shadow-2xl backdrop-blur-md">
                    {format(day, 'MMM d')}: <span className="text-emerald-400 font-bold">{count} {count === 1 ? 'problem' : 'problems'}</span>
                  </div>
                  <div className="w-2 h-1 border-x-4 border-x-transparent border-t-4 border-t-zinc-900" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MonthlyActivityHeatmap;
