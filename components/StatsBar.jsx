'use client';
import ProgressRing from './ProgressRing';
import { daysBetween, formatDate } from '@/lib/utils';

export default function StatsBar({ stats, data, criticalPathStatus }) {
  if (!stats) return null;

  const today = new Date();
  const projStart = new Date(data.projectStart);
  const projEnd = new Date(data.projectEnd);
  const elapsed = Math.max(0, daysBetween(projStart, today));
  const timePct = stats.totalDays ? Math.min(100, Math.round((elapsed / stats.totalDays) * 100)) : 0;
  const onTrack = stats.pct >= timePct - 10;

  const cp = criticalPathStatus;

  return (
    <div className="px-6 py-6 flex gap-4 overflow-x-auto no-scrollbar">
      {/* Overall Progress */}
      <div className="stat-card flex items-center gap-4 min-w-[260px] border-l-2 border-primary">
        <ProgressRing value={stats.pct} />
        <div>
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Total Progress</p>
          <div className="flex items-end justify-between gap-4">
            <h3 className="text-2xl font-black font-headline tracking-tight text-on-surface">{stats.pct}%</h3>
            <span className="text-xs text-secondary mb-1">{stats.complete}/{stats.total} ACTIVITIES</span>
          </div>
          <div className="w-full h-1 bg-surface-container-highest mt-3">
            <div className="bg-primary h-full transition-all duration-500" style={{ width: `${stats.pct}%` }} />
          </div>
        </div>
      </div>

      {/* Critical Path */}
      {cp && (
        <div className="stat-card min-w-[160px] border-l-2 border-error">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Critical Path</p>
          {cp.onTrack ? (
            <>
              <h3 className="text-lg font-black font-headline tracking-tight text-tertiary uppercase">On Track</h3>
              <p className="text-xs text-secondary mt-1 tracking-tight uppercase">{cp.criticalCount} activities</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-black font-headline tracking-tight text-error uppercase">
                {cp.totalRiskDays}d At Risk
              </h3>
              <p className="text-xs text-error mt-1 tracking-tight uppercase">{cp.atRiskCount} behind pace</p>
            </>
          )}
        </div>
      )}

      {/* In Progress */}
      <div className="stat-card min-w-[140px]">
        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Active Work</p>
        <h3 className="text-2xl font-black font-headline tracking-tight text-on-surface">{stats.inProgress}</h3>
        <p className="text-xs text-secondary mt-1 tracking-tight uppercase">In Progress</p>
      </div>

      {/* Delayed */}
      <div className="stat-card min-w-[140px]">
        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Blockers</p>
        <h3 className={`text-2xl font-black font-headline tracking-tight ${stats.delayed > 0 ? 'text-error' : 'text-on-surface'}`}>
          {stats.delayed}
        </h3>
        <p className="text-xs text-secondary mt-1 tracking-tight uppercase">Delayed Items</p>
      </div>

      {/* Timeline */}
      <div className="stat-card min-w-[200px]">
        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Timeline Window</p>
        <h3 className="text-xl font-black font-headline tracking-tight text-on-surface uppercase">
          {formatDate(data.projectStart)} &rarr; {formatDate(data.projectEnd)}
        </h3>
        <p className="text-xs text-secondary mt-1 tracking-tight uppercase">{stats.totalDays} Total Days</p>
      </div>

      {/* Trades */}
      <div className="stat-card min-w-[120px]">
        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Active Trades</p>
        <h3 className="text-2xl font-black font-headline tracking-tight text-on-surface">{stats.subs.length}</h3>
        <p className="text-xs text-secondary mt-1 tracking-tight uppercase">Contractors</p>
      </div>
    </div>
  );
}
