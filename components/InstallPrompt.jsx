'use client';
import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Don't show immediately, wait a bit
      setTimeout(() => setShow(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-surface/60 z-40" />

      {/* Install Card */}
      <div className="install-banner z-50 md:flex md:justify-center md:pb-12">
        <div className="w-full max-w-md bg-surface-container-high border-t-4 border-primary shadow-2xl overflow-hidden animate-slide-up">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-surface-container-highest flex items-center justify-center border border-outline-variant/20 flex-shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffc174" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div>
                <h2 className="font-headline font-extrabold text-xl tracking-tight text-on-surface leading-none mb-1">
                  Install TopOut
                </h2>
                <p className="text-secondary text-sm leading-tight">
                  Add to home screen for quick access to site schedules and trades.
                </p>
              </div>
            </div>

            {/* Industrial detail */}
            <div className="bg-surface-container-low p-3 flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b7c8e1" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span className="text-[10px] font-headline font-bold uppercase tracking-[0.15em] text-secondary">
                Performance Mode Optimized
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-6 pt-2">
              <button
                onClick={() => setShow(false)}
                className="text-secondary font-headline font-bold text-sm uppercase tracking-widest
                           hover:text-on-surface transition-colors"
              >
                Later
              </button>
              <button
                onClick={handleInstall}
                className="machine-gradient text-surface-container-lowest
                           font-headline font-extrabold text-sm uppercase tracking-widest
                           px-8 py-4 active:scale-95 transition-transform duration-100"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
