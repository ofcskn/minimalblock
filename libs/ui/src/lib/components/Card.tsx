import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
