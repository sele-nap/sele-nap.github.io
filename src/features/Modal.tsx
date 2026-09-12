import { ReactNode, useCallback, useEffect, useRef } from 'react';

interface ModalProps {
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ onClose, closeLabel, children }: ModalProps) {
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement;
    const timer = setTimeout(() => {
      modalBoxRef.current?.focus();
    }, 50);

    // Make the rest of the page inert while the modal is open
    const root = document.getElementById('root');
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.setAttribute('inert', '');
    if (root) {
      // Mark header/footer inert via parent
      const header = root.querySelector('.ui-header');
      const footer = root.querySelector('.ui-footer');
      if (header) (header as HTMLElement).setAttribute('inert', '');
      if (footer) (footer as HTMLElement).setAttribute('inert', '');
    }

    return () => {
      clearTimeout(timer);
      if (mainEl) mainEl.removeAttribute('inert');
      if (root) {
        const header = root.querySelector('.ui-header');
        const footer = root.querySelector('.ui-footer');
        if (header) (header as HTMLElement).removeAttribute('inert');
        if (footer) (footer as HTMLElement).removeAttribute('inert');
      }
      triggerRef.current?.focus();
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const el = modalBoxRef.current;
      if (!el) return;
      const focusable = Array.from(
        el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="modal-overlay visible" onClick={onClose}>
      <div
        className="modal-box"
        ref={modalBoxRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label={closeLabel}
        >
          ✕
        </button>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
