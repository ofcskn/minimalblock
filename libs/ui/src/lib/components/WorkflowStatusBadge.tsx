import type { ProductWorkflowStatusValue } from '@minimalblock/core';

const CONFIG: Record<ProductWorkflowStatusValue, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
  analyzing: { label: 'Analyzing…', className: 'bg-blue-100 text-blue-700 animate-pulse' },
  failed_qa: { label: 'Visual QA Failed', className: 'bg-red-100 text-red-700' },
  needs_fix: { label: 'Needs Fix', className: 'bg-amber-100 text-amber-700' },
  ready_for_review: { label: 'Ready for Review', className: 'bg-indigo-100 text-indigo-700' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700' },
  published: { label: 'Published', className: 'bg-green-100 text-green-700' },
};

export interface WorkflowStatusBadgeProps {
  status: ProductWorkflowStatusValue;
}

export function WorkflowStatusBadge({ status }: WorkflowStatusBadgeProps) {
  const { label, className } = CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
