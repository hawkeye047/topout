'use client';
import { useState } from 'react';

export default function ShareModal({ project, onClose }) {
  const [copied, setCopied] = useState(false);

  const projectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/project/${project.id}`
    : `/project/${project.id}`;

  const handleCopy = async () => {
    const text = `TopOut Schedule: ${project.name}\n\nLink: ${projectUrl}\nGC Code: ${project.password}\nOwner Code: ${project.ownerPassword}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#0b1326]/80 backdrop-blur-md z-[60]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface-container-high shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20">
            <h2 className="font-headline font-extrabold text-xl tracking-tight text-on-surface uppercase">
              Share Project
            </h2>
            <button
              onClick={onClose}
              className="bg-surface-container-highest p-2 hover:bg-primary hover:text-surface transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Project URL */}
            <div>
              <label className="block text-[10px] font-black text-secondary tracking-widest uppercase mb-2">
                Project Link
              </label>
              <div className="bg-surface-container-low p-3 text-sm text-primary font-mono break-all">
                {projectUrl}
              </div>
            </div>

            {/* Codes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-secondary tracking-widest uppercase mb-2">
                  GC Code (Full Access)
                </label>
                <div className="bg-surface-container-low p-3 text-center">
                  <span className="text-2xl font-headline font-extrabold text-primary tracking-[0.2em]">
                    {project.password}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-secondary tracking-widest uppercase mb-2">
                  Owner Code (Read-Only)
                </label>
                <div className="bg-surface-container-low p-3 text-center">
                  <span className="text-2xl font-headline font-extrabold text-secondary tracking-[0.2em]">
                    {project.ownerPassword}
                  </span>
                </div>
              </div>
            </div>

            {/* Info text */}
            <p className="text-[10px] text-secondary leading-relaxed">
              Share this link and code with your team. Anyone with the code can access the schedule.
              The GC code grants full editing access. The Owner code is read-only.
            </p>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={`
                w-full py-4 font-headline font-extrabold text-sm uppercase tracking-[0.2em]
                transition-all duration-200 active:scale-[0.98]
                ${copied
                  ? 'bg-tertiary text-surface'
                  : 'machine-gradient text-surface-container-lowest'}
              `}
            >
              {copied ? 'Copied to Clipboard' : 'Copy Link + Codes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
