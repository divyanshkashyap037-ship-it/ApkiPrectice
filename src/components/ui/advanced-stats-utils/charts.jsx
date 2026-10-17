import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * Build weekly cumulative velocity data from real questions.
 * Returns last N weeks, each with running total per category.
 */
function buildVelocityData(questions, numWeeks = 8) {
  if (!questions || questions.length === 0) return [];

  const today = new Date();
  const weeks = [];

  for (let w = numWeeks - 1; w >= 0; w--) {
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - w * 7);
    weeks.push(weekEnd);
  }

  const rows = weeks.map((weekEnd, idx) => {
    const cutoff = weekEnd.toISOString().slice(0, 10);

    const dsaCum = questions.filter(
      q => q.category === 'DSA' && q.status === 'Completed' && q.completedAt && q.completedAt <= cutoff
    ).length;

    const techCum = questions.filter(
      q => q.category === 'Technical' && q.status === 'Completed' && q.completedAt && q.completedAt <= cutoff
    ).length;

    const gitCum = questions.filter(
      q => q.category === 'Git' && q.status === 'Completed' && q.completedAt && q.completedAt <= cutoff
    ).length;

    return {
      week: `W${idx + 1}`,
      dsa: dsaCum,
      tech: techCum,
      git: gitCum,
    };
  });

  return rows;
}

const EmptyVelocity = () => (
  <div className="w-full h-[200px] flex flex-col items-center justify-center gap-3 text-center">
    <div className="text-4xl opacity-30">📈</div>
    <p className="text-sm font-semibold text-zinc-300">No completed questions yet</p>
    <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
      Mark questions as <span className="text-emerald-400 font-semibold">Completed</span> in the Question Tracker and your velocity will chart here in real-time.
    </p>
  </div>
);

export function ClippedAreaChart({ questions = [] }) {
  const data = React.useMemo(() => buildVelocityData(questions, 8), [questions]);

  const hasData = questions.some(q => q.status === 'Completed' && q.completedAt);

  return (
    <div className="w-full h-[280px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-bold text-white tracking-tight">Practice Velocity</h4>
          <p className="text-xs text-zinc-400">Cumulative questions completed across domains</p>
        </div>
        {hasData && (
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> DSA
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Technical
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Git
            </span>
          </div>
        )}
      </div>

      {!hasData ? (
        <EmptyVelocity />
      ) : (
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDsa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorGit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" stroke="#71717a" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              allowDecimals={false}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                borderColor: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
              labelFormatter={(label) => `Up to ${label}`}
            />
            <Area
              type="monotone"
              dataKey="dsa"
              name="DSA"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDsa)"
            />
            <Area
              type="monotone"
              dataKey="tech"
              name="Technical"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTech)"
            />
            <Area
              type="monotone"
              dataKey="git"
              name="Git"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGit)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ClippedAreaChart;
