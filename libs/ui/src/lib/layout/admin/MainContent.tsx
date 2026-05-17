import type { ReactNode } from 'react';

interface MainContentProps {
  children?: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main
      id="admin-main"
      tabIndex={-1}
      className="flex-1 overflow-y-auto px-4 py-5 focus:outline-none sm:px-6 lg:px-6 lg:py-6"
    >
      {children}
    </main>
  );
}
