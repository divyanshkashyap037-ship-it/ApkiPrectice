import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GitHubActivity } from '@/components/ui/github-activity';
import { GlassCalendar } from '@/components/ui/glass-calendar';
import AdvancedStats from '@/components/ui/advanced-stats';
import { generateMockContributions, calculateStreak, calculateWeeklyVelocity, calculateMonthlyChange } from '@/lib/useQuestions';
import {
  Award,
  Target,
  Flame,
  Code2,
  CalendarDays,
  Sparkles,
  Zap,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export default function ProgressAnalytics({ questions = [], stats }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const monthlyChange = React.useMemo(
    () => calculateMonthlyChange(contributions),
    [contributions]
  );

  const repos = [
    {
      name: 'DSA',
      label: 'Data Structures & Algo',
      count: stats?.dsaCompleted || 0,
      href: 'https://leetcode.com',
    },
    {
      name: 'SYS',
      label: 'System Design & Technical',
      count: stats?.technicalCompleted || 0,
      href: 'https://github.com',
    },
    {
      name: 'GIT',
      label: 'Git & Tooling',
      count: stats?.gitCompleted || 0,
      href: 'https://github.com',
    },
  ];

  // Difficulty counts
  const easyCount = questions.filter(q => q.difficulty === 'Easy').length;
  const easyCompleted = questions.filter(q => q.difficulty === 'Easy' && q.status === 'Completed').length;
  const medCount = questions.filter(q => q.difficulty === 'Medium').length;
  const medCompleted = questions.filter(q => q.difficulty === 'Medium' && q.status === 'Completed').length;
  const hardCount = questions.filter(q => q.difficulty === 'Hard').length;
  const hardCompleted = questions.filter(q => q.difficulty === 'Hard' && q.status === 'Completed').length;

  // Extract all unique topic tags and count their occurrences
  const topicCounts = React.useMemo(() => {
    const map = {};
    questions.forEach(q => {
      if (Array.isArray(q.tags)) {
        q.tags.forEach(t => {
          map[t] = (map[t] || 0) + 1;
        });
      }
    });
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }, [questions]);

  return (
    <section aria-label="Progress & Analytics" className="w-full max-w-6xl mx-auto flex flex-col gap-8 py-4 pb-20">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Performance & Insights
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Progress & Analytics
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl leading-relaxed">
            Real-time interview preparation velocity, daily study calendar, and full domain mastery.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {streak}-Day Streak
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold">
            <Target className="w-3.5 h-3.5" />
            Target: 85%
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            {stats?.completed || 0}/{stats?.total || 0} Solved
          </div>
        </div>
      </div>

      {/* 2. Top Grid: Detailed Heatmap + Interactive Glass Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Full-Year Activity Heatmap (2 Cols) */}
        <GlassCard className="lg:col-span-2 p-6 sm:p-7 rounded-3xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-400" /> Daily Practice Heatmap
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                52-week rolling study activity and question commit volume
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-zinc-300 border border-white/10">
              {stats?.completed || 0} problems logged
            </span>
          </div>

          <div className="w-full flex justify-center overflow-x-auto py-2">
            <GitHubActivity
              variant="matte"
              months={12}
              showMonths
              showLegend
              cellSize={13}
              contributions={contributions}
              repos={repos}
              label="Domain contribution breakdown:"
              headingText={`${stats?.completed || 0} problems solved this year`}
              className="w-full max-w-full justify-center"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-zinc-200 font-medium">
            <span>Learn & Practice Frequency</span>
            <span className={`font-semibold flex items-center gap-1 ${monthlyChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {monthlyChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {monthlyChange >= 0 ? '+' : ''}{monthlyChange}% vs previous month
            </span>
          </div>
        </GlassCard>

        {/* Interactive Glass Calendar (1 Col) */}
        <div className="flex justify-center w-full">
          <GlassCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            questions={questions}
            className="w-full h-full shadow-2xl"
          />
        </div>
      </div>

      {/* 3. Advanced Stats & Velocity Section */}
      <AdvancedStats stats={stats} questions={questions} weeklyVelocity={weeklyVelocity} streak={streak} />

      {/* 4. Domain & Difficulty Mastery Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <GlassCard className="p-6 sm:p-7 rounded-3xl flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" /> Category Breakdown
            </h3>
            <span className="text-xs text-zinc-400 font-medium">Domain Health</span>
          </div>

          <div className="flex flex-col gap-4 mt-1">
            {/* DSA */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-zinc-200">Data Structures & Algorithms</span>
                <span className="text-blue-400 font-mono font-bold">
                  {stats?.dsaCompleted}/{stats?.dsaTotal} ({stats?.dsaTotal > 0 ? Math.round((stats.dsaCompleted / stats.dsaTotal) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-800/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                  style={{ width: `${stats?.dsaTotal > 0 ? (stats.dsaCompleted / stats.dsaTotal) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Technical */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-zinc-200">Technical & System Design</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {stats?.technicalCompleted}/{stats?.technicalTotal} ({stats?.technicalTotal > 0 ? Math.round((stats.technicalCompleted / stats.technicalTotal) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-800/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                  style={{ width: `${stats?.technicalTotal > 0 ? (stats.technicalCompleted / stats.technicalTotal) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Git */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-zinc-200">Git & Tooling</span>
                <span className="text-amber-400 font-mono font-bold">
                  {stats?.gitCompleted}/{stats?.gitTotal} ({stats?.gitTotal > 0 ? Math.round((stats.gitCompleted / stats.gitTotal) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-800/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                  style={{ width: `${stats?.gitTotal > 0 ? (stats.gitCompleted / stats.gitTotal) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Difficulty Breakdown */}
        <GlassCard className="p-6 sm:p-7 rounded-3xl flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" /> Difficulty Mastery
            </h3>
            <span className="text-xs text-zinc-400 font-medium">Difficulty Spread</span>
          </div>

          <div className="flex flex-col gap-4 mt-1">
            {/* Easy */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-emerald-400 font-bold">Easy</span>
                <span className="text-zinc-400 font-mono">
                  {easyCompleted}/{easyCount} ({easyCount > 0 ? Math.round((easyCompleted / easyCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-800/80 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                  style={{ width: `${easyCount > 0 ? (easyCompleted / easyCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-blue-400 font-bold">Medium</span>
                <span className="text-zinc-400 font-mono">
                  {medCompleted}/{medCount} ({medCount > 0 ? Math.round((medCompleted / medCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-800/80 overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                  style={{ width: `${medCount > 0 ? (medCompleted / medCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Hard */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-rose-400 font-bold">Hard</span>
                <span className="text-zinc-400 font-mono">
                  {hardCompleted}/{hardCount} ({hardCount > 0 ? Math.round((hardCompleted / hardCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-800/80 overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(251,113,133,0.5)]"
                  style={{ width: `${hardCount > 0 ? (hardCompleted / hardCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 5. Topic Tags Distribution Cloud */}
      {topicCounts.length > 0 && (
        <GlassCard className="p-6 sm:p-7 rounded-3xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">
              Topic Tags Arsenal
            </h3>
            <span className="text-xs text-zinc-400 font-medium">
              {topicCounts.length} active topics
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {topicCounts.map(([tag, count]) => (
              <div
                key={tag}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/20 border border-white/10 text-xs font-semibold text-zinc-200 transition-all hover:bg-white/10 hover:border-white/20"
              >
                <span>{tag}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-zinc-400">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </section>
  );
}
