'use client';
import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { getPhaseColor, phaseProgress, daysBetween, formatDate, ganttMetrics, STATUS_MAP } from '@/lib/utils';

export default function TimelineView({ data, onStatusChange }) {
  const [expanded, setExpanded] = useState(() => {
    const init = {};
    data.phases.forEach((_, i) => (init[i] = true));
    return init;
  });
  const [selected, setSelected] = useState(null);

  const gm = ganttMetrics(data);

  const togglePhase = (i) => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));

  const handleSelect = (pi, ai) => {
    const key = `${pi}-${ai}`;
    setSelected(selected === key ? null : key);
  };

  // Phase border colors based on progress
  const getPhaseBorderColor = (prog) => {
    if (prog === 100) return 'border-tertiary';
    if (prog > 0) return 'border-primary';
    return 'border-secondary-container';
  };

  return (
    <div className="px-6 pb-6 space-y-4">
      {data.phases.map((phase, pi) => {
        if (phase.activities.length === 0) return null;
        const prog = phaseProgress(phase);
        const isOpen = expanded[pi];
        const borderColor = getPhaseBorderColor(prog);
        const isComplete = prog === 100;
        const isFuture = prog === 0;

        return (
          <div
            key={pi}
            className={`phase-card bg-surface-container-low animate-fade-in ${isFuture ? 'opacity-60' : ''}`}
            style={{ animationDelay: `${pi * 40}ms` }}
          >
            {/* Phase Header */}
            <button
              onClick={() => togglePhase(pi)}
              className={`
                w-full flex items-center justify-between p-4 cursor-pointer
                transition-colors duration-100 border-l-4 ${borderColor}
                ${isOpen ? 'bg-surface-container-high' : 'hover:bg-surface-container-high'}
              `}
            >
              <div className="flex items-center gap-4">
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke={isOpen ? '#ffc174' : '#b7c8e1'} strokeWidth="2"
                  className={`transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <div>
                  <h4 className="font-headline font-bold text-sm tracking-tight uppercase text-on-surface text-left">
                    PHASE {String(pi + 1).padStart(2, '0')}: {phase.name}
                  </h4>
                  <p className="text-[10px] text-secondary font-bold tracking-widest text-left">
                    {isComplete
                      ? `${phase.activities.length} ITEMS COMPLETED`
                      : `${phase.activities.filter(a => a.status === 'in-progress').length} ACTIVE TASKS`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-0.5 text-[10px] font-bold tracking-tighter
                  ${isComplete
                    ? 'bg-tertiary/20 text-tertiary'
                    : prog > 0
                      ? 'bg-primary/20 text-primary'
                      : 'bg-surface-container-highest text-secondary'
                  }`}>
                  {prog}% {isComplete ? 'COMPLETE' : 'PROGRESS'}
                </span>
                {isComplete && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#bfcde6" stroke="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                )}
                {isFuture && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b7c8e1" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
              </div>
            </button>

            {/* Activity Rows */}
            {isOpen && (
              <div className="p-4 space-y-px bg-surface-container-low">
                {phase.activities.map((act, ai) => {
                  const key = `${pi}-${ai}`;
                  const isSelected = selected === key;
                  const startPct = gm.totalDays
                    ? (daysBetween(gm.start, new Date(act.start)) / gm.totalDays) * 100
                    : 0;
                  const widthPct = gm.totalDays
                    ? Math.max(2, (act.duration / gm.totalDays) * 100)
                    : 10;
                  const isActive = act.status === 'in-progress';

                  return (
                    <div key={ai}>
                      <button
                        onClick={() => handleSelect(pi, ai)}
                        className={`
                          w-full grid grid-cols-12 gap-4 items-center p-3
                          bg-surface-container-highest/40
                          hover:bg-surface-container-highest
                          transition-none text-left
                        `}
                      >
                        {/* Activity Name + Owner */}
                        <div className="col-span-12 md:col-span-4">
                          <h5 className="text-sm font-bold text-on-surface tracking-tight">{act.name}</h5>
                          <p className="text-[10px] text-secondary font-medium tracking-tight uppercase">
                            {act.owner} &middot; {act.duration} Days Estimated
                          </p>
                        </div>

                        {/* Status */}
                        <div className="col-span-6 md:col-span-3 flex items-center gap-2">
                          <StatusBadge status={act.status} small />
                        </div>

                        {/* Gantt Bar */}
                        <div className="col-span-6 md:col-span-5">
                          <div className="relative w-full h-4 bg-surface-container-high overflow-hidden">
                            <div
                              className={`absolute h-full ${
                                isActive
                                  ? 'bg-gradient-to-r from-primary-container to-primary shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                  : act.status === 'complete'
                                    ? 'bg-tertiary/40'
                                    : 'bg-surface-container-highest border-x border-outline-variant/40'
                              }`}
                              style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                            />
                          </div>
                        </div>
                      </button>

                      {/* Expanded Detail Panel */}
                      {isSelected && (
                        <div className="bg-on-surface text-surface p-6 md:p-8 space-y-6 shadow-2xl relative animate-slide-down">
                          {/* Top color strip */}
                          <div className={`absolute top-0 left-0 w-full h-1 ${
                            act.status === 'complete' ? 'bg-[#4ade80]'
                              : act.status === 'in-progress' ? 'bg-primary-container'
                              : act.status === 'delayed' ? 'bg-error'
                              : 'bg-secondary'
                          }`} />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: Core Info */}
                            <div className="space-y-6">
                              <div>
                                <label className="block text-[10px] font-black text-surface-container-highest tracking-widest uppercase mb-1">
                                  Responsible Entity
                                </label>
                                <p className="text-2xl font-headline font-extrabold tracking-tight uppercase">
                                  {act.owner}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-surface/5 p-4 border-l-2 border-surface">
                                  <label className="block text-[10px] font-black text-surface-container-highest tracking-widest uppercase mb-1">
                                    Start Date
                                  </label>
                                  <span className="text-xl font-headline font-bold uppercase">{formatDate(act.start)}</span>
                                </div>
                                <div className="bg-surface/5 p-4 border-l-2 border-surface">
                                  <label className="block text-[10px] font-black text-surface-container-highest tracking-widest uppercase mb-1">
                                    End Date
                                  </label>
                                  <span className="text-xl font-headline font-bold uppercase">{formatDate(act.end)}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between py-4 border-y border-surface/10">
                                <div className="flex flex-col">
                                  <label className="text-[10px] font-black text-surface-container-highest tracking-widest uppercase">
                                    Total Duration
                                  </label>
                                  <span className="text-3xl font-headline font-black">{act.duration} DAYS</span>
                                </div>
                              </div>
                              {act.notes && (
                                <div>
                                  <label className="block text-[10px] font-black text-surface-container-highest tracking-widest uppercase mb-2">
                                    Notes
                                  </label>
                                  <div className="bg-surface/5 p-4 font-medium text-sm leading-relaxed border border-surface/10">
                                    {act.notes}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right: Status Update */}
                            <div className="space-y-6">
                              <div>
                                <label className="block text-[10px] font-black text-surface-container-highest tracking-widest uppercase mb-3">
                                  Update Status
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(STATUS_MAP).map(([key, cfg]) => (
                                    <button
                                      key={key}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onStatusChange(pi, ai, key);
                                      }}
                                      className={`
                                        flex items-center justify-center gap-2 py-3 px-2
                                        transition-colors text-[10px] font-bold uppercase tracking-tighter
                                        ${act.status === key
                                          ? key === 'delayed'
                                            ? 'bg-error-container text-on-error-container ring-2 ring-error ring-offset-2 ring-offset-on-surface'
                                            : 'bg-primary-container text-on-primary-container ring-2 ring-primary-container ring-offset-2 ring-offset-on-surface'
                                          : 'bg-surface/5 hover:bg-surface/10'}
                                      `}
                                    >
                                      {cfg.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
