'use client';
import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'success', onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = {
    success: 'bg-tertiary/20 text-tertiary border-l-4 border-tertiary',
    error: 'bg-error-container/20 text-error border-l-4 border-error',
    info: 'bg-primary/20 text-primary border-l-4 border-primary',
  };

  return (
    <div
      className={`
        fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[80]
        p-4 shadow-2xl transition-all duration-300
        ${colors[type] || colors.info}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <p className="text-sm font-bold">{message}</p>
    </div>
  );
}
