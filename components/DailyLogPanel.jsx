'use client';
import { useState } from 'react';
import { addDailyLog, applyDailyLogUpdates, saveProject } from '@/lib/dataModel';

const STATUS_COLORS = {
  'complete': 'text-tertiary',
  'in-progress': 'text-primary',
  'not-started': 'text-secondary',
  'delayed': 'text-error',
};

export default function DailyLogPanel({ project, onClose, onSave }) {
  const [rawInput, setRawInput] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedLog, setParsedLog] = useState(null);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Flatten activities for API context
  const allActivities = project.schedule.phases.flatMap((p) =>
    p.activities.map((a) => ({
      id: a.id,
      name: a.name,
      owner: a.owner,
      status: a.status,
      percentComplete: a.percentComplete,
    }))
  );

  const handleParse = async () => {
    if (!rawInput.trim()) return;
    setParsing(true);
    setError('');

    try {
      const resp = await fetch('/api/daily-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput: rawInput.trim(), activities: allActivities }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed to parse');
      }

      const data = await resp.json();
      setParsedLog(data);
    } catch (err) {
      setError(err.message || 'Failed to parse daily log');
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = () => {
    const updated = JSON.parse(JSON.stringify(project));
    const log = addDailyLog(updated, {
      rawInput,
      parsedUpdates: parsedLog.parsedUpdates || [],
      weather: parsedLog.weather || '',
      crewCount: parsedLog.crewCount || 0,
    });
    applyDailyLogUpdates(updated, log.id);
    saveProject(updated);
    setConfirmed(true);
    onSave(updated);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#0b1326]/80 backdrop-blur-md z-[60]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-surface z-[70]
                      flex flex-col shadow-2xl animate-slide-left">
        {/* Header */}
        <header className="px-6 py-6 flex justify-between items-start border-b border-outline-variant/20">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tighter uppercase font-headline text-on-surface">
              Daily Log
            </h2>
            <p className="text-primary font-bold text-xs tracking-widest mt-1 uppercase">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-surface-container-highest p-2 hover:bg-primary hover:text-surface transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {confirmed ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-tertiary/20 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bfcde6" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="font-headline font-extrabold text-lg text-on-surface uppercase">
                Log Saved & Applied
              </h3>
              <p className="text-secondary text-sm mt-2">Schedule has been updated</p>
            </div>
          ) : !parsedLog ? (
            /* Input phase */
            <>
              <div>
                <label className="block text-[10px] font-black text-secondary tracking-widest uppercase mb-3">
                  What happened on site today?
                </label>
                <textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="e.g., Drywall crew finished hanging on the 3rd floor. HVAC rough-in is about 80% done. Plumber didn't show up today — might add 2 days to the schedule. Weather was clear, 14 workers on site."
                  className="w-full h-40 bg-surface-container-low p-4 text-on-surface text-sm
                             placeholder:text-secondary/40 resize-none
                             border-b-2 border-outline-variant focus:border-primary
                             focus:outline-none transition-colors"
                />
              </div>

              {error && (
                <div className="bg-error-container/20 border-l-4 border-error p-3 text-on-error-container text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleParse}
                disabled={parsing || !rawInput.trim()}
                className="w-full py-4 machine-gradient text-surface-container-lowest
                           font-headline font-extrabold text-sm uppercase tracking-[0.2em]
                           disabled:opacity-40 active:scale-[0.98] transition-transform
                           flex items-center justify-center gap-3"
              >
                {parsing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin" />
                    Parsing with AI...
                  </>
                ) : (
                  'Parse Daily Log'
                )}
              </button>

              {/* Previous logs */}
              {project.dailyLogs.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-secondary tracking-widest uppercase mb-3">
                    Recent Logs
                  </h4>
                  <div className="space-y-2">
                    {project.dailyLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="bg-surface-container-low p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-on-surface">{log.date}</span>
                          <span className={`text-[10px] font-bold uppercase ${log.confirmed ? 'text-tertiary' : 'text-secondary'}`}>
                            {log.confirmed ? 'Applied' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-secondary line-clamp-2">{log.rawInput}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Review phase */
            <>
              {parsedLog.summary && (
                <div className="bg-surface-container-low p-4 border-l-4 border-primary">
                  <p className="text-[10px] font-black text-secondary tracking-widest uppercase mb-1">AI Summary</p>
                  <p className="text-sm text-on-surface font-medium">{parsedLog.summary}</p>
                </div>
              )}

              {(parsedLog.weather || parsedLog.crewCount > 0) && (
                <div className="flex gap-4">
                  {parsedLog.weather && (
                    <div className="bg-surface-container-low p-3 flex-1">
                      <p className="text-[10px] font-black text-secondary tracking-widest uppercase mb-1">Weather</p>
                      <p className="text-sm text-on-surface">{parsedLog.weather}</p>
                    </div>
                  )}
                  {parsedLog.crewCount > 0 && (
                    <div className="bg-surface-container-low p-3 flex-1">
                      <p className="text-[10px] font-black text-secondary tracking-widest uppercase mb-1">Crew</p>
                      <p className="text-sm text-on-surface">{parsedLog.crewCount} workers</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-[10px] font-black text-secondary tracking-widest uppercase mb-3">
                  Parsed Updates ({parsedLog.parsedUpdates?.length || 0})
                </h4>
                <div className="space-y-2">
                  {(parsedLog.parsedUpdates || []).map((update, i) => (
                    <div key={i} className="bg-surface-container-low p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-sm font-bold text-on-surface tracking-tight">
                            {update.activityName}
                          </h5>
                          {update.activityId && (
                            <span className="text-[10px] text-secondary font-mono">{update.activityId}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[update.newStatus] || 'text-secondary'}`}>
                            {update.newStatus}
                          </span>
                          {update.percentComplete > 0 && (
                            <span className="block text-xs text-primary font-bold">{update.percentComplete}%</span>
                          )}
                        </div>
                      </div>
                      {update.note && (
                        <p className="text-xs text-secondary">{update.note}</p>
                      )}
                      {update.delayFlag && (
                        <div className="flex items-center gap-2 bg-error-container/10 px-2 py-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffb4ab" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                          <span className="text-[10px] font-bold text-error uppercase">
                            +{update.delayDays}d delay{update.delayCause ? ` — ${update.delayCause}` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setParsedLog(null)}
                  className="flex-1 py-3 bg-surface-container-highest text-on-surface
                             font-headline font-bold text-sm uppercase tracking-widest
                             active:scale-[0.98] transition-transform"
                >
                  Edit Input
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 machine-gradient text-surface-container-lowest
                             font-headline font-extrabold text-sm uppercase tracking-widest
                             active:scale-[0.98] transition-transform"
                >
                  Confirm & Apply
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
