import type { ConversionStatusValue } from '@minimalblock/core';

const statusConfig: Record<ConversionStatusValue, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', className: 'bg-blue-100 text-blue-800 animate-pulse' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-800' },
};

export interface StatusBadgeProps {
  status: ConversionStatusValue;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = statusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
