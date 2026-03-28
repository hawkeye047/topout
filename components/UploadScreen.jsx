'use client';
import { useRef, useState } from 'react';

export default function UploadScreen({ onLoad, onDemo }) {
  const fileRef = useRef();
  const [parsing, setParsing] = useState(false);
  const [stage, setStage] = useState('');
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setParsing(true);
    setError(null);
    setStage('Reading PDF...');

    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(',')[1]);
        r.onerror = () => rej(new Error('Failed to read file'));
        r.readAsDataURL(file);
      });

      setStage('AI is parsing your schedule...');

      const resp = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64 }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Parse failed');
      }

      setStage('Building your dashboard...');
      const data = await resp.json();
      onLoad(data);
    } catch (err) {
      setError(err.message || 'Failed to parse schedule. Try again or use demo data.');
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 hero-bg relative overflow-hidden">
      {/* Dot grid texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dot-grid" />

      {/* Top brand anchor */}
      <header className="fixed top-0 w-full flex justify-between items-center px-8 h-20 z-50">
        <span className="text-2xl font-black tracking-[0.2em] text-on-surface font-headline uppercase">
          TOPOUT<span className="text-primary-container">.</span>
        </span>
      </header>

      <main className="w-full max-w-lg text-center relative z-10">
        {/* Amber dot */}
        <div className="w-1.5 h-1.5 bg-primary-container mx-auto mb-4" />

        <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-[-0.04em] text-on-surface leading-tight max-w-2xl mx-auto">
          Schedules that actually{' '}
          <span className="text-primary-container">make sense.</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-secondary max-w-xl mx-auto font-medium leading-relaxed opacity-80">
          Upload a PDF schedule and get a clean, role-based dashboard for owners, GCs, and subs.
        </p>

        {/* Error */}
        {error && (
          <div className="bg-error-container/40 border border-error/30 px-4 py-3 mt-6 mb-2
                          text-on-error-container text-sm text-left animate-fade-in">
            {error}
          </div>
        )}

        {/* Upload Zone */}
        <div className="w-full mt-8 group">
          <div
            onClick={() => !parsing && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className={`
              relative p-12 border-2 border-dashed cursor-pointer
              flex flex-col items-center justify-center
              transition-all duration-300
              ${dragOver
                ? 'border-primary-container bg-primary-container/5'
                : 'bg-surface-container-low border-outline-variant hover:border-primary-container'}
              ${parsing ? 'pointer-events-none opacity-80' : ''}
            `}
          >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-primary-container opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300" />

            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />

            {parsing ? (
              <div className="text-center animate-fade-in">
                <div className="w-6 h-6 border-2 border-transparent border-t-primary
                                rounded-full mx-auto mb-4 animate-spin" />
                <div className="text-on-surface font-headline font-bold text-sm tracking-tight uppercase">{stage}</div>
                <div className="text-secondary text-xs mt-2 opacity-60">This may take 10-15 seconds</div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mb-6 flex items-center justify-center bg-surface-container-highest">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <h3 className="font-headline font-bold text-lg tracking-tight text-on-surface uppercase">
                  Upload Schedule PDF
                </h3>
                <p className="text-secondary text-xs mt-2 font-medium uppercase tracking-widest opacity-60">
                  P6, MS Project, or Excel Exports
                </p>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-px flex-1 bg-outline-variant opacity-30" />
            <span className="text-[10px] font-bold text-outline uppercase tracking-[0.3em]">OR</span>
            <div className="h-px flex-1 bg-outline-variant opacity-30" />
          </div>

          {/* Demo Button */}
          <button
            onClick={onDemo}
            disabled={parsing}
            className="w-full py-4 border border-secondary text-secondary font-bold text-sm
                       tracking-widest uppercase
                       hover:bg-secondary hover:text-surface
                       transition-colors duration-200
                       flex items-center justify-center gap-3
                       active:scale-[0.98] disabled:opacity-50"
          >
            Load Demo Schedule
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>

      {/* Footer role labels */}
      <footer className="fixed bottom-12 w-full flex justify-center items-center gap-8 md:gap-16">
        {[
          { icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', label: 'Owner View' },
          { icon: 'M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7', label: 'GC View' },
          { icon: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z', label: 'Sub View' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffc174" strokeWidth="2">
              <path d={item.icon} />
            </svg>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.15em]">{item.label}</span>
          </div>
        ))}
      </footer>
    </div>
  );
}
