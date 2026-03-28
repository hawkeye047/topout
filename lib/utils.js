// Phase colors (dark theme - tonal machining)
export const PHASE_COLORS = {
  preconstruction: { bg: 'bg-surface-container-high', bar: 'bg-tertiary', text: 'text-tertiary', hex: '#bfcde6', border: 'border-tertiary' },
  demolition:      { bg: 'bg-surface-container-high', bar: 'bg-primary', text: 'text-primary', hex: '#ffc174', border: 'border-primary' },
  'rough-in':      { bg: 'bg-surface-container-high', bar: 'bg-emerald-400', text: 'text-emerald-400', hex: '#4ade80', border: 'border-emerald-400' },
  framing:         { bg: 'bg-surface-container-high', bar: 'bg-primary-container', text: 'text-primary', hex: '#f59e0b', border: 'border-primary-container' },
  ceiling:         { bg: 'bg-surface-container-high', bar: 'bg-purple-400', text: 'text-purple-400', hex: '#A855F7', border: 'border-purple-400' },
  finishes:        { bg: 'bg-surface-container-high', bar: 'bg-rose-400', text: 'text-rose-400', hex: '#F43F5E', border: 'border-rose-400' },
  'mep trim':      { bg: 'bg-surface-container-high', bar: 'bg-teal-400', text: 'text-teal-400', hex: '#2dd4bf', border: 'border-teal-400' },
  millwork:        { bg: 'bg-surface-container-high', bar: 'bg-fuchsia-400', text: 'text-fuchsia-400', hex: '#D946EF', border: 'border-fuchsia-400' },
  'ff&e':          { bg: 'bg-surface-container-high', bar: 'bg-sky-400', text: 'text-sky-400', hex: '#38bdf8', border: 'border-sky-400' },
  closeout:        { bg: 'bg-surface-container-high', bar: 'bg-secondary', text: 'text-secondary', hex: '#b7c8e1', border: 'border-secondary' },
};

export function getPhaseColor(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, val] of Object.entries(PHASE_COLORS)) {
    if (lower.includes(key)) return val;
  }
  return PHASE_COLORS.closeout;
}

// Status config (dark industrial theme)
export const STATUS_MAP = {
  'complete':     { label: 'Complete',     icon: '✓', tw: 'bg-[#2d3449] text-[#dae2fd]', dot: 'bg-tertiary' },
  'in-progress':  { label: 'In Progress',  icon: '◉', tw: 'bg-[#ffc174] text-[#472a00]', dot: 'bg-primary' },
  'not-started':  { label: 'Not Started',  icon: '○', tw: 'bg-[#2d3449] text-[#b7c8e1]', dot: 'bg-secondary' },
  'delayed':      { label: 'Delayed',      icon: '!', tw: 'bg-[#93000a] text-[#ffdad6]', dot: 'bg-error' },
};

// Date helpers
export function daysBetween(a, b) {
  return Math.max(0, Math.ceil((new Date(b) - new Date(a)) / 86400000));
}

export function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateFull(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Stats calculator
export function calcStats(data) {
  if (!data?.phases) return null;
  let total = 0, complete = 0, inProgress = 0, delayed = 0;
  const subs = new Set();
  data.phases.forEach((p) =>
    p.activities.forEach((a) => {
      total++;
      if (a.status === 'complete') complete++;
      if (a.status === 'in-progress') inProgress++;
      if (a.status === 'delayed') delayed++;
      if (a.owner) subs.add(a.owner);
    })
  );
  const pct = total ? Math.round((complete / total) * 100) : 0;
  const totalDays = daysBetween(data.projectStart, data.projectEnd);
  return { total, complete, inProgress, delayed, pct, totalDays, subs: [...subs].sort() };
}

// Phase progress
export function phaseProgress(phase) {
  const total = phase.activities.length;
  if (!total) return 0;
  const done = phase.activities.filter((a) => a.status === 'complete').length;
  return Math.round((done / total) * 100);
}

// Gantt helpers
export function ganttMetrics(data) {
  if (!data) return { start: null, end: null, totalDays: 0, weeks: [] };
  const s = new Date(data.projectStart);
  const e = new Date(data.projectEnd);
  const totalDays = daysBetween(s, e) + 14;
  return { start: s, end: e, totalDays };
}
