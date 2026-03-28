'use client';
import { STATUS_MAP } from '@/lib/utils';

const BADGE_STYLES = {
  'complete': 'bg-surface-container-highest text-on-surface border border-outline-variant/30',
  'in-progress': 'bg-primary text-on-primary',
  'not-started': 'bg-surface-container-highest text-secondary',
  'delayed': 'bg-error-container text-on-error-container',
};

export default function StatusBadge({ status, small = false }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP['not-started'];
  const style = BADGE_STYLES[status] || BADGE_STYLES['not-started'];

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-sm
      font-black uppercase tracking-widest
      ${style}
      ${small ? 'text-[10px] px-2 py-0.5' : 'text-[10px] px-3 py-1'}
    `}>
      {cfg.label}
    </span>
  );
}
