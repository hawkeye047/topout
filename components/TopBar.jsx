'use client';

const ROLES = [
  { key: 'owner', label: 'OWNER' },
  { key: 'gc', label: 'GC' },
  { key: 'sub', label: 'SUB' },
];

export default function TopBar({ projectName, role, onRoleChange, notifCount, onNotifToggle, onReset }) {
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
          <span className="text-2xl font-black tracking-[0.2em] text-on-surface font-headline uppercase">
            TOPOUT<span className="text-primary-container">.</span>
          </span>
          {projectName && (
            <div className="ml-6 px-3 py-1 bg-surface-container-highest border-l-4 border-primary-container hidden md:block">
              <span className="font-headline font-bold text-sm tracking-tight text-on-surface uppercase">
                {projectName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: role toggle + notifications + reset */}
      <div className="flex items-center gap-6">
        {/* Role Toggle Pills */}
        <nav className="flex bg-surface-container-low p-1 rounded-sm">
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

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button
            onClick={onNotifToggle}
            className="relative cursor-pointer text-secondary hover:text-primary transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notifCount > 0 && (
              <span className="notification-dot" />
            )}
          </button>

          {/* Reset / Upload new */}
          <button
            onClick={onReset}
            className="text-secondary hover:text-primary transition-colors cursor-pointer"
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
