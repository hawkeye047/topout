'use client';
import StatusBadge from './StatusBadge';
import { getPhaseColor, formatDate, STATUS_MAP } from '@/lib/utils';

export default function ListView({ data, onStatusChange }) {
  return (
    <div className="px-6 pb-6">
      <div className="bg-surface-container-low overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:table-header-group">
          <div className="bg-surface-container-highest grid grid-cols-[2fr_1fr_1fr_80px_120px] items-center">
            {['Activity', 'Responsible', 'Dates', 'Duration', 'Status'].map((h) => (
              <div key={h} className="px-6 py-4 text-[10px] uppercase tracking-widest text-secondary font-extrabold">
                {h}
              </div>
            ))}
          </div>
        </div>

        {data.phases.map((phase, pi) => {
          if (phase.activities.length === 0) return null;
          const pc = getPhaseColor(phase.name);
          return (
            <div key={pi}>
              {/* Phase divider row */}
              <div className="bg-secondary-container/20 border-l-4 border-primary px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary-container/20 px-2 py-0.5">
                    Phase {String(pi + 1).padStart(2, '0')}
                  </span>
                  <span className="font-bold text-sm tracking-tight text-on-surface uppercase">{phase.name}</span>
                </div>
              </div>

              {/* Activity rows */}
              {phase.activities.map((act, ai) => (
                <div
                  key={ai}
                  className={`
                    md:grid md:grid-cols-[2fr_1fr_1fr_80px_120px] items-center
                    px-6 py-4 group
                    ${ai % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-low'}
                    hover:bg-surface-container-high transition-colors duration-100
                  `}
                >
                  {/* Activity name */}
                  <div>
                    <div className="font-bold text-on-surface tracking-tight">{act.name}</div>
                    {/* Mobile-only meta */}
                    <div className="md:hidden flex flex-wrap gap-2 mt-1">
                      <span className="text-[10px] text-secondary font-bold uppercase">{act.owner}</span>
                      <span className="text-[10px] text-secondary opacity-60">
                        &middot; {formatDate(act.start)} &mdash; {formatDate(act.end)}
                      </span>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="hidden md:block text-xs font-semibold text-secondary uppercase tracking-wider">
                    {act.owner}
                  </div>

                  {/* Dates */}
                  <div className="hidden md:block text-xs font-medium text-secondary">
                    {formatDate(act.start)} &mdash; {formatDate(act.end)}
                  </div>

                  {/* Duration */}
                  <div className="hidden md:block text-xs font-mono text-secondary">
                    {act.duration} Days
                  </div>

                  {/* Status */}
                  <div className="mt-2 md:mt-0">
                    <select
                      value={act.status}
                      onChange={(e) => onStatusChange(pi, ai, e.target.value)}
                      className="bg-transparent text-[10px] font-black uppercase tracking-widest
                                 rounded-sm px-3 py-1 border-none cursor-pointer appearance-none
                                 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      style={{
                        backgroundImage: 'none',
                        backgroundColor: act.status === 'in-progress' ? '#ffc174'
                          : act.status === 'complete' ? '#2d3449'
                          : act.status === 'delayed' ? '#93000a'
                          : '#2d3449',
                        color: act.status === 'in-progress' ? '#472a00'
                          : act.status === 'delayed' ? '#ffdad6'
                          : '#dae2fd',
                      }}
                    >
                      {Object.entries(STATUS_MAP).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
