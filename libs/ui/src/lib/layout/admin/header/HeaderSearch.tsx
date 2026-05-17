import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '../icons.js';
import { useDismissable } from '../useDismissable.js';
import type { SearchScope } from '../admin.types.js';

interface HeaderSearchProps {
  placeholder?: string;
  defaultScope?: SearchScope;
  onSearch?: (query: string, scope: SearchScope) => void;
  /** Force mobile (icon-trigger) variant regardless of viewport. */
  variant?: 'inline' | 'mobile';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HeaderSearch({
  placeholder = 'Search products, orders, customers…',
  defaultScope = 'all',
  onSearch,
  variant = 'inline',
  open,
  onOpenChange,
}: HeaderSearchProps) {
  const [query, setQuery] = useState('');
  const [internalOpen, setInternalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLFormElement>(null);
  const isOpen = open ?? internalOpen;

  const setOpen = (nextOpen: boolean) => {
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  useDismissable({
    open: variant === 'mobile' && isOpen,
    onDismiss: () => setOpen(false),
    ref: dialogRef,
  });

  useEffect(() => {
    if (variant === 'mobile' && isOpen) inputRef.current?.focus();
  }, [isOpen, variant]);

  // ⌘K / Ctrl-K opens the search.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (variant === 'mobile') setOpen(true);
        else inputRef.current?.focus();
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [variant]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.(query.trim(), defaultScope);
  };

  if (variant === 'mobile') {
    return (
      <>
        <button
          type="button"
          aria-label="Open search"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <Icon name="search" className="h-[18px] w-[18px]" />
        </button>
        {isOpen && (
          <div
            role="dialog"
            aria-label="Search"
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <form
              ref={dialogRef}
              onSubmit={(e) => {
                handleSubmit(e);
                setOpen(false);
              }}
              className="mx-auto mt-16 flex max-w-lg items-center gap-2 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200"
            >
              <Icon
                name="search"
                className="ml-2 h-[18px] w-[18px] text-slate-400"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
              >
                Esc
              </button>
            </form>
          </div>
        )}
      </>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="group relative w-full max-w-md"
    >
      <Icon
        name="search"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600"
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-14 text-sm text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 lg:inline-flex">
        ⌘K
      </kbd>
    </form>
  );
}
