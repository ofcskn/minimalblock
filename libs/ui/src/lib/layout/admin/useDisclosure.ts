import { useCallback, useState } from 'react';

interface UseDisclosureOptions {
  defaultOpen?: boolean;
}

export function useDisclosure(options: UseDisclosureOptions = {}) {
  const [isOpen, setIsOpen] = useState(options.defaultOpen ?? false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle,
  };
}
