'use client';
import { formatDate } from '@/lib/utils';

const PRIORITY_STYLES = {
  critical: {
    bg: 'bg-[#fef2f2]',
    border: 'border-[#ef4444]',
    label: 'text-[#991b1b]',
    labelBg: 'bg-[#fee2e2]',
    icon: 'error',
    iconColor: 'text-[#991b1b]',
  },
  high: {
    bg: 'bg-[#fffbeb]',
    border: 'border-[#f59e0b]',
    label: 'text-[#92400e]',
    labelBg: 'bg-[#fef3c7]',
    icon: 'warning',
    iconColor: 'text-[#92400e]',
  },
  medium: {
    bg: 'bg-[#eff6ff]',
    border: 'border-[#3b82f6]',
    label: 'text-[#1e40af]',
    labelBg: 'bg-[#dbeafe]',
    icon: 'info',
    iconColor: 'text-[#1e40af]',
  },
  low: {
    bg: 'bg-[#f8fafc]',
    border: 'border-[#94a3b8]',
    label: 'text-[#475569]',
    labelBg: 'bg-[#e2e8f0]',
    icon: 'info',
    iconColor: 'text-[#475569]',
  },
};

const TYPE_LABELS = {
  delayed: 'Delayed',
  'due-today': 'Due Today',
  upcoming: 'Starting Soon',
  milestone: 'Milestone',
};

export default function NotificationPanel({ notifications, onClose, onMarkRead, onClearAll }) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0b1326]/80 backdrop-blur-md z-[60] animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-on-surface text-surface z-[70]
                      flex flex-col shadow-2xl animate-slide-left">
        {/* Header */}
        <header className="bg-surface text-on-surface px-6 py-8 flex justify-between items-start border-b border-outline-variant/20">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tighter uppercase font-headline">
              Notifications
            </h2>
            <p className="text-primary font-bold text-xs tracking-widest mt-1 uppercase">
              {unread > 0 ? `${unread} Unread Alerts` : 'All Caught Up'}
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

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-on-surface">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-surface/50 px-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p className="font-headline font-bold text-sm uppercase tracking-wider">No notifications yet</p>
              <p className="text-xs mt-1 text-center opacity-60">
                Alerts for delays, milestones, and upcoming activities will appear here
              </p>
            </div>
          ) : (
            notifications.map((notif, i) => {
              const ps = PRIORITY_STYLES[notif.priority] || PRIORITY_STYLES.low;
              return (
                <button
                  key={notif.id || i}
                  onClick={() => onMarkRead(notif.id)}
                  className={`
                    group relative w-full text-left border-l-8 p-5
                    flex flex-col gap-2 transition-all hover:translate-x-1
                    ${notif.read ? 'bg-white/80 opacity-60' : ps.bg}
                    ${ps.border}
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span className={`${ps.label} font-black text-[10px] tracking-[0.1em] uppercase ${ps.labelBg} px-2 py-0.5`}>
                      {TYPE_LABELS[notif.type] || notif.type} &mdash; {notif.title}
                    </span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={ps.iconColor}>
                      {notif.priority === 'critical' && <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
                      {notif.priority === 'high' && <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}
                      {(notif.priority === 'medium' || notif.priority === 'low') && <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>}
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-surface font-headline font-extrabold text-lg leading-tight tracking-tight">
                      {notif.body}
                    </h3>
                    <p className="text-surface/70 font-bold text-xs uppercase mt-1">
                      {notif.phase} &middot; {formatDate(notif.date)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <footer className="p-8 border-t border-outline-variant/10 bg-on-surface">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
              }
            }}
            className="flex items-center justify-center gap-3 py-4 w-full
                       border-2 border-surface text-surface
                       font-black text-xs tracking-[0.2em] uppercase
                       hover:bg-surface hover:text-on-surface transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
              ? 'Push Notifications Enabled'
              : 'Enable Push Notifications'}
          </button>
        </footer>
      </div>
    </>
  );
}
