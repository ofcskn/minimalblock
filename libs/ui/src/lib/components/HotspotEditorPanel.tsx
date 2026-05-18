import { useState, useCallback } from 'react';
import type { Hotspot, ProductCategory, SuggestedHotspotType } from '@minimalblock/core';
import { HotspotQuality } from '@minimalblock/core';
import type { HotspotQualityReport } from '@minimalblock/core';
import { Button } from './Button.js';
import { Card } from './Card.js';

export interface HotspotEditorPanelProps {
  hotspots: Hotspot[];
  category?: ProductCategory;
  onUpdate: (id: string, patch: Partial<Omit<Hotspot, 'id'>>) => void;
  onDelete: (id: string) => void;
  onApprovalToggle: (id: string, approved: boolean) => void;
  onValidate?: () => void;
  onGenerateBetter?: () => void;
  generatingHotspots?: boolean;
  /** F.19 — parent can pass whether publish is currently blocked */
  publishBlocked?: boolean;
}

const TYPE_OPTIONS: { value: SuggestedHotspotType; label: string }[] = [
  { value: 'material', label: 'Material' },
  { value: 'dimension', label: 'Dimension' },
  { value: 'feature', label: 'Feature' },
  { value: 'warning', label: 'Warning' },
  { value: 'assembly', label: 'Assembly' },
];

function QualityDot({ status }: { status: HotspotQualityReport['status'] }) {
  // F.17/F.18 — invalid = red, warning = amber, valid = green
  const classes = {
    valid: 'bg-emerald-500',
    warning: 'bg-amber-400',
    invalid: 'bg-red-500',
  }[status];
  const label = { valid: 'Valid', warning: 'Warning', invalid: 'Invalid' }[status];
  return (
    <span title={label} className={`inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full ${classes}`} aria-label={label} />
  );
}

function IssueList({ report }: { report: HotspotQualityReport }) {
  if (report.issues.length === 0) return null;
  return (
    <ul className="mt-1.5 space-y-0.5">
      {report.issues.map((issue) => (
        <li
          key={issue.code}
          className={`text-[11px] leading-tight ${issue.severity === 'invalid' ? 'text-red-600' : 'text-amber-600'}`}
        >
          {issue.message}
        </li>
      ))}
    </ul>
  );
}

interface HotspotRowProps {
  hotspot: Hotspot;
  report: HotspotQualityReport;
  onUpdate: (patch: Partial<Omit<Hotspot, 'id'>>) => void;
  onDelete: () => void;
  onApprovalToggle: (approved: boolean) => void;
}

function HotspotRow({ hotspot, report, onUpdate, onDelete, onApprovalToggle }: HotspotRowProps) {
  const [editing, setEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(hotspot.label);
  const [draftDesc, setDraftDesc] = useState(hotspot.description ?? '');
  const [draftType, setDraftType] = useState<SuggestedHotspotType | ''>(hotspot.type ?? '');

  const commitEdit = useCallback(() => {
    onUpdate({
      label: draftLabel.trim(),
      description: draftDesc.trim() || undefined,
      type: draftType || undefined,
    });
    setEditing(false);
  }, [draftLabel, draftDesc, draftType, onUpdate]);

  const cancelEdit = useCallback(() => {
    setDraftLabel(hotspot.label);
    setDraftDesc(hotspot.description ?? '');
    setDraftType(hotspot.type ?? '');
    setEditing(false);
  }, [hotspot]);

  const rowBorderClass = {
    valid: 'border-emerald-200 bg-emerald-50/40',
    warning: 'border-amber-200 bg-amber-50/40',
    invalid: 'border-red-200 bg-red-50/40',
  }[report.status];

  return (
    <li className={`rounded-xl border p-3 transition-colors ${rowBorderClass}`}>
      <div className="flex items-start gap-2">
        {/* F.17/F.18 — status dot */}
        <div className="pt-0.5">
          <QualityDot status={report.status} />
        </div>

        <div className="min-w-0 flex-1">
          {editing ? (
            /* --- Edit form --- */
            <div className="space-y-2">
              {/* F.2 — label editing */}
              <div>
                <label className="mb-0.5 block text-[11px] font-medium text-gray-500">Label</label>
                <input
                  type="text"
                  value={draftLabel}
                  onChange={(e) => setDraftLabel(e.target.value)}
                  placeholder="Hotspot label…"
                  className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              {/* F.3 — description editing */}
              <div>
                <label className="mb-0.5 block text-[11px] font-medium text-gray-500">Description (buyer-facing)</label>
                <textarea
                  value={draftDesc}
                  onChange={(e) => setDraftDesc(e.target.value)}
                  placeholder="Explain what makes this detail matter to the buyer…"
                  rows={2}
                  className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* F.4 — type selection */}
              <div>
                <label className="mb-0.5 block text-[11px] font-medium text-gray-500">Type</label>
                <select
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value as SuggestedHotspotType | '')}
                  className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">— select type —</option>
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={commitEdit} disabled={!draftLabel.trim()}>Save</Button>
                <Button size="sm" variant="secondary" onClick={cancelEdit}>Cancel</Button>
              </div>
            </div>
          ) : (
            /* --- Read view --- */
            <div>
              <p className="text-sm font-medium text-gray-900 leading-snug">{hotspot.label}</p>
              {hotspot.description && (
                <p className="mt-0.5 text-xs text-gray-500 leading-snug">{hotspot.description}</p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {hotspot.type && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 uppercase tracking-wide">
                    {hotspot.type}
                  </span>
                )}
                {!hotspot.position && (
                  <span className="text-[11px] text-amber-600">No 3D placement</span>
                )}
              </div>
              <IssueList report={report} />
            </div>
          )}
        </div>

        {/* Actions */}
        {!editing && (
          <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
            {/* F.5 — approval toggle */}
            <button
              onClick={() => onApprovalToggle(!hotspot.approved)}
              title={hotspot.approved ? 'Approved — click to revoke' : 'Click to approve for public display'}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                hotspot.approved
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {hotspot.approved ? 'Approved' : 'Approve'}
            </button>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              Edit
            </button>
            {/* F.6 — deletion */}
            <button
              onClick={onDelete}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export function HotspotEditorPanel({
  hotspots,
  category,
  onUpdate,
  onDelete,
  onApprovalToggle,
  onValidate,
  onGenerateBetter,
  generatingHotspots = false,
  publishBlocked = false,
}: HotspotEditorPanelProps) {
  // F.8 — compute quality status for every hotspot
  const reports = HotspotQuality.validateAll(hotspots, category);
  const reportMap = new Map(reports.map((r) => [r.hotspotId, r]));

  const invalidCount = reports.filter((r) => r.status === 'invalid').length;
  const warningCount = reports.filter((r) => r.status === 'warning').length;

  return (
    <Card>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">Hotspot QA</p>
          <span className="text-xs text-gray-400">{hotspots.length} hotspot{hotspots.length !== 1 ? 's' : ''}</span>
          {invalidCount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
              {invalidCount} invalid
            </span>
          )}
          {warningCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              {warningCount} warning{warningCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* F.20/F.21 — action buttons */}
        <div className="flex gap-2">
          {onValidate && (
            <Button size="sm" variant="secondary" onClick={onValidate}>
              Validate hotspots
            </Button>
          )}
          {onGenerateBetter && (
            <Button size="sm" variant="secondary" onClick={onGenerateBetter} loading={generatingHotspots}>
              Generate better
            </Button>
          )}
        </div>
      </div>

      {/* F.19 — publish block banner */}
      {publishBlocked && invalidCount > 0 && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <strong>Publish blocked.</strong> Fix {invalidCount} invalid hotspot{invalidCount !== 1 ? 's' : ''} before publishing.
        </div>
      )}

      {hotspots.length === 0 ? (
        <p className="text-sm text-gray-400">No hotspots yet. Click on the 3D model to place one, or generate hotspots from AI suggestions.</p>
      ) : (
        /* F.1 — clear hotspot list */
        <ul className="space-y-2">
          {hotspots.map((hotspot) => {
            const report = reportMap.get(hotspot.id) ?? { hotspotId: hotspot.id, status: 'warning' as const, issues: [] };
            return (
              <HotspotRow
                key={hotspot.id}
                hotspot={hotspot}
                report={report}
                onUpdate={(patch) => onUpdate(hotspot.id, patch)}
                onDelete={() => onDelete(hotspot.id)}
                onApprovalToggle={(approved) => onApprovalToggle(hotspot.id, approved)}
              />
            );
          })}
        </ul>
      )}
    </Card>
  );
}
