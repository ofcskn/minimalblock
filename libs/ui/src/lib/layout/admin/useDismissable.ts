import { useEffect, type RefObject } from 'react';

interface UseDismissableOptions {
  open: boolean;
  onDismiss: () => void;
  ref: RefObject<HTMLElement | null>;
}

/** Closes on Escape and on outside pointer events. Returns focus on close is left to the caller. */
export function useDismissable({ open, onDismiss, ref }: UseDismissableOptions) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    const handlePointer = (e: PointerEvent) => {
      const node = ref.current;
      if (!node) return;
      if (node.contains(e.target as Node)) return;
      onDismiss();
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('pointerdown', handlePointer);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('pointerdown', handlePointer);
    };
  }, [open, onDismiss, ref]);
}
