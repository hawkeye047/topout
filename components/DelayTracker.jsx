'use client';
import { useMemo } from 'react';
import { getDelaySummary, CAUSE_LABELS, CAUSE_COLORS } from '@/lib/delays';
import { formatDate } from '@/lib/utils';

export default function DelayTracker({ project, onResolveDelay, isReadOnly }) {
  const summary = useMemo(() => getDelaySummary(project), [project]);

  return (
    <div className="px-6 pb-6 space-y-6">
      {/* Summary Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant/10">
        <div className="bg-surface-container-low p-5">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Delayed Activities</p>
          <h3 className={`text-3xl font-black font-headline tracking-tight ${summary.delayedActivities > 0 ? 'text-error' : 'text-on-surface'}`}>
            {summary.delayedActivities}
          </h3>
        </div>
        <div className="bg-surface-container-low p-5">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Cumulative Days</p>
          <h3 className="text-3xl font-black font-headline tracking-tight text-on-surface">
            {summary.totalDelayDays}
          </h3>
        </div>
        <div className="bg-surface-container-low p-5">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Projected Completion</p>
          <h3 className="text-xl font-black font-headline tracking-tight text-on-surface uppercase">
            {formatDate(summary.projectedEnd)}
          </h3>
          {summary.projectDelayDays > 0 && (
            <p className="text-[10px] font-bold text-error mt-1">+{summary.projectDelayDays}d behind original</p>
          )}
        </div>
        <div className="bg-surface-container-low p-5">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Est. Cost Impact</p>
          <h3 className="text-xl font-black font-headline tracking-tight text-primary">
            ${summary.estimatedCostImpact.toLocaleString()}
          </h3>
          <p className="text-[10px] text-secondary mt-1">Extended gen. conditions</p>
        </div>
      </div>

      {/* Delay Cards */}
      {summary.delays.length === 0 ? (
        <div className="bg-surface-container-low p-12 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2d3449" strokeWidth="1.5" className="mx-auto mb-4">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h3 className="font-headline font-bold text-lg text-surface-container-highest uppercase">No Active Delays</h3>
          <p className="text-secondary text-sm mt-2">All activities are on track</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-secondary tracking-[0.3em] uppercase">Active Delays</h3>
          {summary.delays.map((delay) => (
            <div key={delay.activityId + delay.detectedDate} className="bg-surface-container-low border-l-4 border-error">
              <div className="p-5 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-headline font-bold text-sm text-on-surface tracking-tight uppercase">
                      {delay.activityName}
                    </h4>
                    <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mt-0.5">
                      {delay.responsibleParty}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-headline text-error">+{delay.delayDays}d</span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-wrap gap-3">
                  <div className="bg-surface-container-highest px-2 py-1">
                    <span className="text-[10px] font-bold text-on-surface uppercase">
                      Detected: {formatDate(delay.detectedDate)}
                    </span>
                  </div>
                  <div className="px-2 py-1" style={{ backgroundColor: (CAUSE_COLORS[delay.cause] || '#b7c8e1') + '20' }}>
                    <span className="text-[10px] font-bold uppercase" style={{ color: CAUSE_COLORS[delay.cause] || '#b7c8e1' }}>
                      {CAUSE_LABELS[delay.cause] || delay.cause}
                    </span>
                  </div>
                </div>

                {delay.causeDetail && delay.causeDetail !== 'Auto-detected: past planned end date' && (
                  <p className="text-xs text-secondary">{delay.causeDetail}</p>
                )}

                {/* Downstream impact */}
                {delay.downstreamActivities && delay.downstreamActivities.length > 0 && (
                  <div className="bg-error-container/10 px-3 py-2">
                    <p className="text-[10px] font-bold text-error uppercase">
                      Affects {delay.downstreamActivities.length} downstream activit{delay.downstreamActivities.length === 1 ? 'y' : 'ies'}
                    </p>
                  </div>
                )}

                {/* Resolve button */}
                {!isReadOnly && (
                  <button
                    onClick={() => onResolveDelay(delay)}
                    className="w-full py-2 bg-surface-container-highest text-on-surface
                               font-headline font-bold text-[10px] uppercase tracking-widest
                               hover:bg-tertiary/20 hover:text-tertiary transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cause Breakdown */}
      {summary.causeBreakdown.length > 0 && (
        <div>
          <h3 className="text-[10px] font-black text-secondary tracking-[0.3em] uppercase mb-4">Delay Causes</h3>
          <div className="bg-surface-container-low p-5 space-y-3">
            {summary.causeBreakdown.map(({ cause, count, pct }) => (
              <div key={cause}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-tight">
                    {CAUSE_LABELS[cause] || cause}
                  </span>
                  <span className="text-xs font-bold text-secondary">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-surface-container-highest overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: CAUSE_COLORS[cause] || '#b7c8e1' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
