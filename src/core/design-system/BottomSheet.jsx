import { useEffect, useRef } from 'react';
import { Button } from './Button.jsx';
import { useTranslation } from '@/core/i18n/useTranslation.js';

export function BottomSheet({ open, onClose, title, children, showCancel = true }) {
  const { t } = useTranslation();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 animate-fade-in"
        aria-label={t('common.close')}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="relative w-full max-w-lg rounded-t-lg bg-surface p-6 pb-8 shadow-soft animate-slide-up focus:outline-none"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
        {title && (
          <h2 id="sheet-title" className="text-heading-lg text-ink mb-4">
            {title}
          </h2>
        )}
        {children}
        {showCancel && (
          <Button variant="ghost" className="w-full mt-4" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </div>
  );
}
