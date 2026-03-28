'use client';
import { useState, useEffect, useRef } from 'react';
import { getSession, setSession, verifyPassword } from '@/lib/dataModel';

export default function ProjectGate({ project, children }) {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState(null);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef([]);

  // Check existing session
  useEffect(() => {
    const session = getSession();
    if (session && session.projectId === project.id) {
      setAuthed(true);
      setRole(session.role);
    }
  }, [project.id]);

  // Auto-focus first input
  useEffect(() => {
    if (!authed && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [authed]);

  const handleDigitChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    if (value && !/^\d$/.test(value)) return;

    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit on 6th digit
    if (value && index === 5) {
      const code = next.join('');
      attemptLogin(code);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split('');
      setDigits(next);
      attemptLogin(pasted);
    }
  };

  const attemptLogin = (code) => {
    if (attempts >= 5) return;

    const verifiedRole = verifyPassword(project, code);
    if (verifiedRole) {
      setSession(project.id, verifiedRole);
      setRole(verifiedRole);
      setAuthed(true);
    } else {
      setAttempts((prev) => prev + 1);
      setShake(true);
      setError(attempts >= 4 ? 'Contact your PM for access' : 'Invalid code');
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        setShake(false);
        inputRefs.current[0]?.focus();
      }, 500);
    }
  };

  if (authed) {
    return typeof children === 'function' ? children(role) : children;
  }

  const locked = attempts >= 5;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 hero-bg relative overflow-hidden">
      {/* Dot grid texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dot-grid" />

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Wordmark */}
        <span className="text-2xl font-black tracking-[0.2em] text-on-surface font-headline uppercase">
          TOPOUT<span className="text-primary-container">.</span>
        </span>

        {/* Lock icon */}
        <div className="mt-8 mb-6 flex justify-center">
          <div className="w-16 h-16 bg-surface-container-highest flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={locked ? '#ffb4ab' : '#b7c8e1'} strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        {/* Project name */}
        <h2 className="font-headline font-bold text-lg text-on-surface uppercase tracking-tight mb-2">
          {project.name}
        </h2>

        <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-8">
          Enter Project Code
        </p>

        {/* PIN Input */}
        <div
          className={`flex justify-center gap-3 mb-6 ${shake ? 'animate-shake' : ''}`}
          onPaste={handlePaste}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              disabled={locked}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`
                w-12 h-14 text-center text-2xl font-headline font-extrabold
                bg-surface-container-low border-b-2
                text-on-surface focus:outline-none
                transition-colors duration-100
                ${d ? 'border-primary' : 'border-outline-variant'}
                ${locked ? 'opacity-40 cursor-not-allowed' : 'focus:border-primary'}
              `}
              style={{ caretColor: '#ffc174' }}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className={`text-xs font-bold uppercase tracking-wider animate-fade-in ${
            locked ? 'text-error' : 'text-error'
          }`}>
            {error}
          </p>
        )}

        {/* Hint */}
        {!locked && !error && (
          <p className="text-[10px] text-secondary opacity-60">
            Ask your project manager for the access code
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 50%, 90% { transform: translateX(-4px); }
          30%, 70% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
