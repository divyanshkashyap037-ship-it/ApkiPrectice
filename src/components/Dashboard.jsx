import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GitHubActivity } from '@/components/ui/github-activity';
import { MonthlyActivityHeatmap } from '@/components/ui/monthly-activity-heatmap';
import { DigitalClock } from '@/components/ui/digital-clock';
import { generateMockContributions, calculateStreak, calculateWeeklyVelocity, getVelocityLabel } from '@/lib/useQuestions';
import {
  Code,
  CheckCircle2,
  GitBranch,
  Terminal,
  ArrowRight,
  Flame,
  Sparkles,
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({
  questions = [],
  stats,
  onNavigateToTracker,
}) {
  const contributions = React.useMemo(
    () => generateMockContributions(questions),
    [questions]
  );

  const streak = React.useMemo(
    () => calculateStreak(contributions),
    [contributions]
  );

  const weeklyVelocity = React.useMemo(
    () => calculateWeeklyVelocity(contributions),
    [contributions]
  );

  const velocityLabel = React.useMemo(
    () => getVelocityLabel(weeklyVelocity),
    [weeklyVelocity]
  );

  const rate = stats?.completionRate || 0;
  // Circumference for r=35 is ~220
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * rate) / 100;

  return (
    <section aria-label="Dashboard" className="dashboard-stage">
      {/* 1. Hero Card (Top-Left) */}
      <GlassCard className="dashboard-card-hero">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs font-bold mb-3 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
            <Sparkles className="w-3.5 h-3.5" />
            Interview Preparation
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-sm">
            Track, Master & Crack Interviews
          </h2>
          <p className="text-sm text-zinc-200 mt-2 line-clamp-2 leading-relaxed font-medium">
            Consistently solve DSA, Technical, and Git interview questions. Build your competitive edge.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-hero-cta"
          onClick={onNavigateToTracker}
        >
          Manage Questions <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </GlassCard>

      {/* 2. Digital Clock Widget */}
      <GlassCard className="dashboard-card-clock">
        <DigitalClock />
      </GlassCard>

      {/* 3. Prep Pulse Card (Top-Right) */}
      <GlassCard className="dashboard-card-pulse">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Prep Pulse
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-extrabold shadow-[0_0_16px_rgba(245,158,11,0.3)]">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{streak}d Streak</span>
          </div>
        </div>

        {/* Center: Radial Progress Meter + Metrics */}
        <div className="flex items-center justify-between gap-4 my-auto">
          {/* Circular Ring Meter */}
          <div className="dashboard-pulse-ring-wrap">
            <svg width="86" height="86" className="transform -rotate-90">
              <circle
                cx="43"
                cy="43"
                r={radius}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="43"
                cy="43"
                r={radius}
                stroke="url(#pulseGradient)"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white tracking-tight leading-none drop-shadow">
                {rate}%
              </span>
              <span className="text-[10px] text-zinc-300 font-bold uppercase mt-0.5 tracking-wider">
                Ready
              </span>
            </div>
          </div>

          {/* Right Metrics */}
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white">Interview Readiness</span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/25 text-blue-200 border border-blue-400/40">
                Target: 85%
              </span>
            </div>
            <p className="text-xs text-zinc-200 font-medium">
              <strong className="text-white font-extrabold text-sm">{stats?.completed || 0}</strong> of{' '}
              <strong className="text-zinc-100 font-extrabold text-sm">{stats?.total || 0}</strong> questions mastered
            </p>
            <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse shadow-[0_0_8px_#34d399]"></span>
              Velocity: {velocityLabel}
            </span>
          </div>
        </div>

        {/* Bottom Progress Bar */}
        <div className="w-full h-2 bg-zinc-800/90 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
            style={{ width: `${rate}%` }}
          />
        </div>
      </GlassCard>

      {/* 4. Stat Card A - Total Questions */}
      <GlassCard className="dashboard-card-stat-a">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-zinc-100 uppercase tracking-wider">
            Total Questions
          </span>
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm">
            <Terminal className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <span className="dashboard-stat-num stat-num-total">
            {stats?.total || 0}
          </span>
          <span className="text-xs text-zinc-200 font-semibold">
            {stats?.inProgress || 0} in progress
          </span>
        </div>
      </GlassCard>

      {/* 5. Stat Card B - DSA Solved */}
      <GlassCard className="dashboard-card-stat-b">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-zinc-100 uppercase tracking-wider">
            DSA Solved
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/25 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <Code className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <span className="dashboard-stat-num stat-num-dsa">
            {stats?.dsaCompleted || 0}
          </span>
          <span className="text-xs text-zinc-200 font-semibold">
            of {stats?.dsaTotal || 0} problems
          </span>
        </div>
      </GlassCard>

      {/* 6. Stat Card C - Technical / System */}
      <GlassCard className="dashboard-card-stat-c">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-zinc-100 uppercase tracking-wider">
            Technical / System
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <span className="dashboard-stat-num stat-num-tech">
            {stats?.technicalCompleted || 0}
          </span>
          <span className="text-xs text-zinc-200 font-semibold">
            of {stats?.technicalTotal || 0} topics
          </span>
        </div>
      </GlassCard>

      {/* 7. Stat Card D - Git & Tooling */}
      <GlassCard className="dashboard-card-stat-d">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-zinc-100 uppercase tracking-wider">
            Git & Tooling
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/25 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            <GitBranch className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <span className="dashboard-stat-num stat-num-git">
            {stats?.gitCompleted || 0}
          </span>
          <span className="text-xs text-zinc-200 font-semibold">
            of {stats?.gitTotal || 0} mastered
          </span>
        </div>
      </GlassCard>

      {/* 8. Wide Card (Current Month Practice Heatmap) */}
      <GlassCard className="dashboard-card-wide">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              Monthly Practice Activity • <span className="text-blue-400 font-black">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            </h3>
            <p className="text-xs text-zinc-200 font-medium">
              Daily habit tracker and problem solving velocity
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/35 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            Active Habit
          </span>
        </div>

        {/* Cohesive single-month heatmap & metrics */}
        <div className="w-full flex-1 flex items-center py-1">
          <MonthlyActivityHeatmap
            questions={questions}
            contributions={contributions}
          />
        </div>
      </GlassCard>

      {/* 9. Stream Card (Domain Progress) */}
      <GlassCard className="dashboard-card-stream">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Domain Progress
            </h3>
            <p className="text-xs text-zinc-200 font-medium">
              Completion across interview tracks
            </p>
          </div>
          <button
            type="button"
            className="text-xs font-bold text-blue-300 hover:text-white hover:underline cursor-pointer flex items-center gap-1"
            onClick={onNavigateToTracker}
          >
            View all &rarr;
          </button>
        </div>

        <div className="flex flex-col gap-3 my-auto">
          {/* DSA */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-white">Data Structures & Algo</span>
              <span className="text-blue-300 font-mono font-extrabold text-sm">
                {stats?.dsaTotal > 0 ? Math.round((stats.dsaCompleted / stats.dsaTotal) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800/90 overflow-hidden border border-white/5">
              <div
                className="h-full progress-bar-dsa rounded-full transition-all duration-500"
                style={{ width: `${stats?.dsaTotal > 0 ? (stats.dsaCompleted / stats.dsaTotal) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Technical */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-white">Technical & System Design</span>
              <span className="text-emerald-300 font-mono font-extrabold text-sm">
                {stats?.technicalTotal > 0 ? Math.round((stats.technicalCompleted / stats.technicalTotal) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800/90 overflow-hidden border border-white/5">
              <div
                className="h-full progress-bar-tech rounded-full transition-all duration-500"
                style={{ width: `${stats?.technicalTotal > 0 ? (stats.technicalCompleted / stats.technicalTotal) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Git */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-white">Git & Tooling</span>
              <span className="text-amber-300 font-mono font-extrabold text-sm">
                {stats?.gitTotal > 0 ? Math.round((stats.gitCompleted / stats.gitTotal) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800/90 overflow-hidden border border-white/5">
              <div
                className="h-full progress-bar-git rounded-full transition-all duration-500"
                style={{ width: `${stats?.gitTotal > 0 ? (stats.gitCompleted / stats.gitTotal) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-zinc-200 font-semibold">
          <span>Target: 85% Completion</span>
          <span className="text-emerald-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#34d399]"></span>
            On Track
          </span>
        </div>
      </GlassCard>
    </section>
  );
}
