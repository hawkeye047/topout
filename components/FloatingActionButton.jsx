'use client';

export default function FloatingActionButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed right-6 bottom-8 w-14 h-14 machine-gradient
                 text-surface-container-lowest shadow-2xl
                 flex items-center justify-center rounded-sm
                 active:scale-95 transition-transform z-40
                 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]"
      title="Add Daily Log"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}
