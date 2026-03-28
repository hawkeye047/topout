'use client';

const ROLES = [
  { key: 'owner', label: 'OWNER' },
  { key: 'gc', label: 'GC' },
  { key: 'sub', label: 'SUB' },
];

export default function TopBar({
  projectName, role, onRoleChange, notifCount, onNotifToggle,
  onReset, onShare, onDailyLog, isReadOnly
}) {
  return (
    <header className="bg-[#0b1326] sticky top-0 z-50 flex justify-between items-center px-6 h-16 w-full safe-top">
      {/* Left: hamburger + brand + project name */}
      <div className="flex items-center gap-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffc174" strokeWidth="2" className="flex-shrink-0">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <div className="flex items-center">
          <a href="/" className="text-2xl font-black tracking-[0.2em] text-on-surface font-headline uppercase hover:opacity-80 transition-opacity">
            TOPOUT<span className="text-primary-container">.</span>
          </a>
          {projectName && (
            <div className="ml-6 px-3 py-1 bg-surface-container-highest border-l-4 border-primary-container hidden md:block">
              <span className="font-headline font-bold text-sm tracking-tight text-on-surface uppercase">
                {projectName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Role Toggle Pills */}
        {!isReadOnly && (
          <nav className="hidden sm:flex bg-surface-container-low p-1 rounded-sm">
            {ROLES.map((r) => (
              <button
                key={r.key}
                onClick={() => onRoleChange(r.key)}
                className={`
                  px-4 py-1 text-xs font-bold font-headline tracking-widest
                  transition-colors duration-100
                  ${role === r.key
                    ? 'bg-primary-container text-on-primary rounded-sm'
                    : 'text-secondary hover:bg-surface-container-highest'}
                `}
              >
                {r.label}
              </button>
            ))}
          </nav>
        )}

        {isReadOnly && (
          <span className="text-[10px] font-bold font-headline tracking-widest text-primary border border-primary px-3 py-1">
            OWNER
          </span>
        )}

        <div className="flex items-center gap-3">
          {/* Daily Log button */}
          {onDailyLog && (
            <button
              onClick={onDailyLog}
              className="text-secondary hover:text-primary transition-colors"
              title="Daily Log"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </button>
          )}

          {/* Share button */}
          {onShare && (
            <button
              onClick={onShare}
              className="text-secondary hover:text-primary transition-colors"
              title="Share Project"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={onNotifToggle}
            className="relative text-secondary hover:text-primary transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notifCount > 0 && <span className="notification-dot" />}
          </button>

          {/* Reset / Upload new */}
          <button
            onClick={onReset}
            className="text-secondary hover:text-primary transition-colors"
            title="New schedule"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
