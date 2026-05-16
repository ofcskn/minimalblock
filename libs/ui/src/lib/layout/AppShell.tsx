import React from 'react';

export interface AppShellProps {
  header: React.ReactNode;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function AppShell({ header, children, sidebar }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">{header}</header>
      <div className="flex flex-1">
        {sidebar && <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">{sidebar}</aside>}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
