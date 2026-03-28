'use client';
import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { getPhaseColor, phaseProgress, daysBetween, formatDate, ganttMetrics, STATUS_MAP } from '@/lib/utils';

const PERCENT_OPTIONS = [0, 25, 50, 75, 100];

export default function TimelineView({ data, onStatusChange, project }) {
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

  const getPhaseBorderColor = (prog) => {
    if (prog === 100) return 'border-tertiary';
    if (prog > 0) return 'border-primary';
    return 'border-secondary-container';
  };

  // Find daily log entries referencing an activity
  const getActivityLogs = (actName) => {
    if (!project?.dailyLogs) return [];
    return project.dailyLogs
      .filter((log) => log.confirmed && log.parsedUpdates?.some((u) => u.activityName === actName || u.activityId === actName))
      .slice(0, 5);
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
          <div key={pi} className={`phase-card bg-surface-container-low animate-fade-in ${isFuture ? 'opacity-60' : ''}`}
            style={{ animationDelay: `${pi * 40}ms` }}>
            {/* Phase Header */}
            <button onClick={() => togglePhase(pi)}
              className={`w-full flex items-center justify-between p-4 cursor-pointer transition-colors duration-100 border-l-4 ${borderColor}
                ${isOpen ? 'bg-surface-container-high' : 'hover:bg-surface-container-high'}`}>
              <div className="flex items-center gap-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isOpen ? '#ffc174' : '#b7c8e1'} strokeWidth="2"
                  className={`transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <div>
                  <h4 className="font-headline font-bold text-sm tracking-tight uppercase text-on-surface text-left">
                    PHASE {String(pi + 1).padStart(2, '0')}: {phase.name}
                  </h4>
                  <p className="text-[10px] text-secondary font-bold tracking-widest text-left">
                    {isComplete ? `${phase.activities.length} ITEMS COMPLETED` : `${phase.activities.filter(a => a.status === 'in-progress').length} ACTIVE TASKS`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-0.5 text-[10px] font-bold tracking-tighter
                  ${isComplete ? 'bg-tertiary/20 text-tertiary' : prog > 0 ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-secondary'}`}>
                  {prog}% {isComplete ? 'COMPLETE' : 'PROGRESS'}
                </span>
                {isComplete && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#bfcde6" stroke="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
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
                  const startPct = gm.totalDays ? (daysBetween(gm.start, new Date(act.start)) / gm.totalDays) * 100 : 0;
                  const widthPct = gm.totalDays ? Math.max(2, (act.duration / gm.totalDays) * 100) : 10;
                  const isActive = act.status === 'in-progress';
                  const isCritical = act.isCriticalPath;

                  return (
                    <div key={ai}>
                      <button onClick={() => handleSelect(pi, ai)}
                        className={`w-full grid grid-cols-12 gap-4 items-center p-3
                          bg-surface-container-highest/40 hover:bg-surface-container-highest transition-none text-left
                          ${isCritical ? 'border-l-2 border-primary' : ''}`}>
                        <div className="col-span-12 md:col-span-4">
                          <div className="flex items-center gap-2">
                            {isCritical && <span className="w-1.5 h-1.5 bg-primary flex-shrink-0" title="Critical Path" />}
                            <h5 className="text-sm font-bold text-on-surface tracking-tight">{act.name}</h5>
                          </div>
                          <p className="text-[10px] text-secondary font-medium tracking-tight uppercase">
                            {act.owner} &middot; {act.duration} Days
                            {act.percentComplete > 0 && act.percentComplete < 100 && ` &middot; ${act.percentComplete}%`}
                          </p>
                        </div>
                        <div className="col-span-6 md:col-span-3 flex items-center gap-2">
                          <StatusBadge status={act.status} small />
                        </div>
                        <div className="col-span-6 md:col-span-5">
                          <div className="relative w-full h-4 bg-surface-container-high overflow-hidden">
                            <div className={`absolute h-full ${
                              isActive ? 'bg-gradient-to-r from-primary-container to-primary shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                : act.status === 'complete' ? 'bg-tertiary/40'
                                : act.status === 'delayed' ? 'bg-error/60'
                                : 'bg-surface-container-highest border-x border-outline-variant/40'}`}
                              style={{ left: `${startPct}%`, width: `${widthPct}%` }} />
                          </div>
                        </div>
                      </button>

                      {/* Enhanced Detail Panel */}
                      {isSelected && (
                        <div className="bg-on-surface text-surface p-6 md:p-8 space-y-6 shadow-2xl relative animate-slide-down">
                          <div className={`absolute top-0 left-0 w-full h-1 ${
                            act.status === 'complete' ? 'bg-[#4ade80]' : act.status === 'in-progress' ? 'bg-primary-container'
                              : act.status === 'delayed' ? 'bg-error' : 'bg-secondary'}`} />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left column */}
                            <div className="space-y-5">
                              <div>
                                <label className="block text-[10px] font-black text-surface-container-highest tracking-widest uppercase mb-1">Responsible Entity</label>
                                <p className="text-2xl font-headline font-extrabold tracking-tight uppercase">{act.owner}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-surface/5 p-4 border-l-2 border-surface">
                                  <label className="block text-[10px] font-black text-surface-container-highest tracking-widest uppercase mb-1">Start</label>
                                  <span className="text-xl font-headline font-bold uppercase">{formatDate(act.start)}</span>
                                </div>
                                <div className="bg-surface/5 p-4 border-l-2 border-surface">
                                  <label className="block text-[10px] font-black text-surface-container-highest tracking-widest uppercase mb-1">End</label>
                                  <span className="text-xl font-headline font-bold uppercase">{formatDate(act.projectedEnd || act.end)}</span>
                                  {act.projectedEnd && act.projectedEnd !== act.end && (
                                    <span className="block text-[10px] text-surface-container-highest line-through mt-0.5">{formatDate(act.end)}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between py-4 border-y border-surface/10">
                                <div><label className="text-[10px] font-black text-surface-container-highest tracking-widest uppercase">Duration</label>
                                  <span className="block text-3xl font-headline font-black">{act.duration} DAYS</span></div>
                                {act.delayDays > 0 && (
                                  <div className="text-right"><label className="text-[10px] font-black text-surface-container-highest tracking-widest uppercase">Delay</label>
                                    <span className="block text-xl font-headline font-bold text-error">+{act.delayDays}d</span></div>
                                )}
                              </div>

                              {/* Cost */}
                              {(act.budgetedCost > 0 || act.actualCost > 0) && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div><label className="block text-[10px] font-black text-surface-container-highest tracking-widest uppercase mb-1">Budgeted</label>
                                    <span className="text-lg font-headline font-bold">${(act.budgetedCost || 0).toLocaleString()}</span></div>
                                  <div><label className="block text-[10px] font-black text-surface-container-highest tracking-widest uppercase mb-1">Actual</label>
                                    <span className="text-lg font-headline font-bold">${(act.actualCost || 0).toLocaleString()}</span></div>
                                </div>
                              )}

                              {act.notes && (
                                <div><label className="block text-[10px] font-black text-surface-container-highest tracking-widest uppercase mb-2">Notes</label>
                                  <div className="bg-surface/5 p-4 font-medium text-sm leading-relaxed border border-surface/10">{act.notes}</div></div>
                              )}
                            </div>

                            {/* Right column */}
                            <div className="space-y-5">
                              {/* Progress slider */}
                              <div>
                                <label className="block text-[10px] font-black text-surface-container-highest tracking-widest uppercase mb-3">Progress</label>
                                <div className="flex gap-2">
                                  {PERCENT_OPTIONS.map((pct) => (
                                    <button key={pct} onClick={(e) => { e.stopPropagation(); /* percent update would go here */ }}
                                      className={`flex-1 py-2 text-center text-[10px] font-bold uppercase transition-colors
                                        ${(act.percentComplete || 0) >= pct ? 'bg-primary-container text-on-primary-container' : 'bg-surface/5 hover:bg-surface/10'}`}>
                                      {pct}%
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Status buttons */}
                              <div>
                                <label className="block text-[10px] font-black text-surface-container-highest tracking-widest uppercase mb-3">Update Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(STATUS_MAP).map(([skey, cfg]) => (
                                    <button key={skey} onClick={(e) => { e.stopPropagation(); onStatusChange(pi, ai, skey); }}
                                      className={`flex items-center justify-center gap-2 py-3 px-2 transition-colors text-[10px] font-bold uppercase tracking-tighter
                                        ${act.status === skey
                                          ? skey === 'delayed' ? 'bg-error-container text-on-error-container ring-2 ring-error ring-offset-2 ring-offset-on-surface'
                                            : 'bg-primary-container text-on-primary-container ring-2 ring-primary-container ring-offset-2 ring-offset-on-surface'
                                          : 'bg-surface/5 hover:bg-surface/10'}`}>
                                      {cfg.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Activity log history */}
                              {(() => {
                                const logs = getActivityLogs(act.name);
                                if (logs.length === 0) return null;
                                return (
                                  <div>
                                    <label className="block text-[10px] font-black text-surface-container-highest tracking-widest uppercase mb-3">Log History</label>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                      {logs.map((log) => (
                                        <div key={log.id} className="bg-surface/5 p-2 border-l-2 border-surface">
                                          <span className="text-[10px] font-bold">{log.date}</span>
                                          <p className="text-[10px] text-surface-container-highest mt-0.5 line-clamp-2">{log.rawInput}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Critical path badge */}
                              {act.isCriticalPath && (
                                <div className="bg-primary/10 px-3 py-2 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-primary" />
                                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">On Critical Path</span>
                                </div>
                              )}
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
