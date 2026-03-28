'use client';

export default function SubFilterBar({ subs, activeFilter, onFilterChange }) {
  return (
    <section className="bg-surface-container-low px-6 py-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-primary-container font-headline font-bold text-xs uppercase tracking-wider">
          Filter by trade:
        </span>
      </div>

      <div className="flex overflow-x-auto gap-2 no-scrollbar">
        <button
          onClick={() => onFilterChange('all')}
          className={`
            whitespace-nowrap px-4 py-1.5 font-headline font-extrabold text-[11px]
            tracking-tighter uppercase rounded-sm flex-shrink-0
            transition-colors duration-100
            ${activeFilter === 'all'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-highest text-secondary hover:bg-surface-container-high'}
          `}
        >
          All Trades
        </button>

        {subs.map((sub) => (
          <button
            key={sub}
            onClick={() => onFilterChange(sub)}
            className={`
              whitespace-nowrap px-4 py-1.5 font-headline font-bold text-[11px]
              tracking-tighter uppercase rounded-sm flex-shrink-0
              transition-colors duration-100
              ${activeFilter === sub
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-highest text-secondary hover:bg-surface-container-high'}
            `}
          >
            {sub}
          </button>
        ))}
      </div>
    </section>
  );
}
