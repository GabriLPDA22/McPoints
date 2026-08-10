import { useEffect, useRef } from 'react';
import { Button } from './Button.jsx';
import { useTranslation } from '@/core/i18n/useTranslation.js';

export function BottomSheet({ open, onClose, title, children, showCancel = true }) {
  const { t } = useTranslation();
  const panelRef = useRef(null);
  // El cierre se lee desde una ref para que el efecto dependa solo de `open`.
  // Con `onClose` en las dependencias, cualquier padre que pase una función
  // nueva en cada render relanzaba el efecto en cada pulsación de tecla.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Solo se mueve el foco al panel si el contenido no lo tiene ya (un input
    // con autoFocus, por ejemplo): quitárselo cierra el teclado del móvil.
    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) panel.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open]);

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
