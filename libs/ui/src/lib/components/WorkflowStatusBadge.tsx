import type { ProductWorkflowStatusValue } from '@minimalblock/core';

const CONFIG: Record<ProductWorkflowStatusValue, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
  url_submitted: { label: 'URL Submitted', className: 'bg-sky-100 text-sky-700' },
  scraping: { label: 'Scraping', className: 'bg-blue-100 text-blue-700 animate-pulse' },
  scrape_failed: { label: 'Scrape Failed', className: 'bg-red-100 text-red-700' },
  extraction_review_needed: { label: 'Review Extracted Data', className: 'bg-indigo-100 text-indigo-700' },
  autofill_ready: { label: 'Autofill Ready', className: 'bg-violet-100 text-violet-700' },
  imported_source_images_ready: { label: 'Imported Images Ready', className: 'bg-cyan-100 text-cyan-700' },
  source_readiness_pending: { label: 'Source Readiness Pending', className: 'bg-amber-100 text-amber-700' },
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
