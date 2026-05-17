import type { ReactNode } from 'react';

interface MainContentProps {
  children?: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main
      id="admin-main"
      tabIndex={-1}
      className="flex-1 overflow-y-auto px-4 py-5 focus:outline-none sm:px-6 lg:px-8 lg:py-8"
    >
      <div className="mx-auto w-full max-w-[1180px]">{children}</div>
    </main>
  );
}
