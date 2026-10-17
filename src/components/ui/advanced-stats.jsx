'use client';
import { cn } from '@/lib/utils';
import React, { useRef } from 'react';
import { ClippedAreaChart } from '@/components/ui/advanced-stats-utils/charts';
import { TimelineAnimation } from '@/components/ui/advanced-stats-utils/timeline-animation';
import { CheckCircle2, Flame, Award, TrendingUp } from 'lucide-react';

export default function AdvancedStats({ stats, questions = [], weeklyVelocity: velocityProp, streak: streakProp }) {
  const timelineRef = useRef(null);

  const total = stats?.total || 0;
  const completed = stats?.completed || 0;
  const dsaCompleted = stats?.dsaCompleted || 0;
  const completionRate = stats?.completionRate || 0;

  const weeklyVelocity = velocityProp ?? 0;
  const streak = streakProp ?? 0;

  const kpis = [
    {
      label: 'Total Solved',
      value: total > 0 ? `${completed}/${total}` : '0',
      change: total > 0 ? `${completionRate}%` : 'Start now',
      status: completed > 0 ? 'up' : 'neutral',
      icon: CheckCircle2,
    },
    {
      label: 'DSA Mastered',
      value: `${dsaCompleted}`,
      change: dsaCompleted > 0 ? `${Math.round((dsaCompleted / Math.max(stats?.dsaTotal || 1, 1)) * 100)}%` : 'None yet',
      status: dsaCompleted > 0 ? 'up' : 'neutral',
      icon: Flame,
    },
    {
      label: 'Weekly Velocity',
      value: weeklyVelocity > 0 ? `${weeklyVelocity}/wk` : '0/wk',
      change: weeklyVelocity >= 10 ? 'Strong' : weeklyVelocity >= 5 ? 'Steady' : weeklyVelocity >= 1 ? 'Building' : 'Start',
      status: weeklyVelocity >= 5 ? 'up' : 'neutral',
      icon: TrendingUp,
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      change: completionRate >= 85 ? 'Target met!' : `${Math.max(0, 85 - completionRate)}% to go`,
      status: completionRate >= 85 ? 'up' : completionRate >= 40 ? 'up' : 'neutral',
      icon: Award,
    },
  ];

  return (
    <section
      ref={timelineRef}
      className="flex flex-col gap-6 py-2 w-full text-white"
    >
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Section */}
          <TimelineAnimation
            animationNum={1}
            timelineRef={timelineRef}
            className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-black/20 border border-white/10 backdrop-blur-xl shadow-2xl"
          >
            <ClippedAreaChart questions={questions} />
          </TimelineAnimation>

          {/* Breakdown Section */}
          <div className="flex flex-col gap-4">
            <TimelineAnimation
              animationNum={2}
              timelineRef={timelineRef}
              className="p-6 rounded-3xl bg-black/20 border border-white/10 text-white flex flex-col justify-between shadow-2xl backdrop-blur-xl"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">
                  Primary Prep Goal
                </p>
                <h4 className="text-xl font-bold tracking-tight">
                  FAANG & Product Mastery
                </h4>
              </div>
              <div className="mt-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-3xl font-semibold tracking-tighter text-blue-400">
                    {completionRate}%
                  </span>
                  <span className="text-xs font-medium text-zinc-400 mb-1">
                    Target: 85%
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, completionRate)}%` }}
                  />
                </div>
              </div>
            </TimelineAnimation>

            <TimelineAnimation
              animationNum={3}
              timelineRef={timelineRef}
              className="p-6 rounded-3xl bg-black/20 border border-white/10 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="font-bold text-white text-sm">Consistency Streak</h4>
              </div>
              <p className="text-xs text-zinc-400">
                You've logged practice sessions for <span className="text-emerald-400 font-semibold">{streak} consecutive day{streak !== 1 ? 's' : ''}</span>. {streak >= 7 ? 'Keep up the momentum!' : 'Build your streak by practicing daily!'}
              </p>
            </TimelineAnimation>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <TimelineAnimation
                animationNum={4 + index}
                timelineRef={timelineRef}
                key={kpi.label}
                className={cn(
                  'p-5 rounded-3xl border bg-black/20 border-white/10 backdrop-blur-xl shadow-xl transition-all hover:border-white/20 hover:scale-[1.02]'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    {kpi.label}
                  </p>
                  {Icon && <Icon className="w-4 h-4 text-zinc-500" />}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <p className="text-2xl font-black text-white tracking-tighter">
                    {kpi.value}
                  </p>
                  <span
                    className={cn(
                      'text-xs font-bold px-1.5 py-0.5 rounded',
                      kpi.status === 'up'
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                        : kpi.status === 'down'
                        ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                        : 'text-zinc-400 bg-zinc-700/30 border border-zinc-600/30'
                    )}
                  >
                    {kpi.change}
                  </span>
                </div>
              </TimelineAnimation>
            );
          })}
        </div>
      </div>
    </section>
  );
}
