import React from 'react';
import { cn } from '../utils/cn.js';

export interface AppShellProps {
  header: React.ReactNode;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
  mainClassName?: string;
}

export function AppShell({ header, children, sidebar, className, mainClassName }: AppShellProps) {
  return (
    <div className={cn('min-h-screen bg-slate-100', className)}>
      <div className="flex min-h-screen flex-col">
        {header}
        <div className="flex flex-1 overflow-hidden">
          {sidebar}
          <main className={cn('min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8', mainClassName)}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
