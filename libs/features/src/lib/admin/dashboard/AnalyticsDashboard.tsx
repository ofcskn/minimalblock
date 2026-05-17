import { useState } from 'react';
import {
  DashboardShell,
  type AdminSidebarLinkNode,
  type AdminSearchScope,
} from '@minimalblock/ui';
import { PageHeader } from './components/PageHeader.js';
import { MetricCard } from './components/MetricCard.js';
import { AnalyticsCard } from './components/AnalyticsCard.js';
import { RecentOrdersTable } from './components/RecentOrdersTable.js';
import { DateRangeSelector, type DateRange } from './components/DateRangeSelector.js';
import { EmptyState } from './components/EmptyState.js';
import {
  SAMPLE_BREADCRUMBS,
  SAMPLE_CURRENCY,
  SAMPLE_LANGUAGE,
  SAMPLE_METRICS,
  SAMPLE_NAV,
  SAMPLE_NOTIFICATIONS,
  SAMPLE_ORDERS,
  SAMPLE_OVERFLOW_ACTIONS,
  SAMPLE_PRIMARY_ACTION,
  SAMPLE_PROFILE_ACTIONS,
  SAMPLE_STORE,
  SAMPLE_STORES,
  SAMPLE_USER,
} from './sample-data.js';

const SAMPLE_SERIES = [4200, 5100, 4800, 6200, 7100, 6800, 8400];

interface AnalyticsDashboardProps {
  currentPath?: string;
}

export function AnalyticsDashboard({ currentPath = '/admin/analytics' }: AnalyticsDashboardProps) {
  const [range, setRange] = useState<DateRange>('30d');
  const isActive = (href: string) => currentPath === href;

  const handleNavigate = (node: AdminSidebarLinkNode) => {
    // The shell stays router-agnostic; consumers wire this to react-router etc.
    if (typeof window !== 'undefined' && node.href) {
      window.history.pushState({}, '', node.href);
    }
  };

  const handleSearch = (query: string, scope: AdminSearchScope) => {
    console.info('[admin] search', { query, scope });
  };

  return (
    <DashboardShell
      navigation={SAMPLE_NAV}
      isActive={isActive}
      brand={{ name: 'Minimal Block', tagline: 'Control center' }}
      store={SAMPLE_STORE}
      stores={SAMPLE_STORES}
      currency={SAMPLE_CURRENCY}
      language={SAMPLE_LANGUAGE}
      breadcrumbs={SAMPLE_BREADCRUMBS}
      primaryAction={SAMPLE_PRIMARY_ACTION}
      overflowActions={SAMPLE_OVERFLOW_ACTIONS}
      notifications={SAMPLE_NOTIFICATIONS}
      user={SAMPLE_USER}
      profileActions={SAMPLE_PROFILE_ACTIONS}
      onNavigate={handleNavigate}
      onSearch={handleSearch}
    >
      <PageHeader
        title="Analytics"
        description="Track revenue, orders, and conversion at a glance."
        actions={<DateRangeSelector value={range} onChange={setRange} />}
      />

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SAMPLE_METRICS.map((m) => (
          <MetricCard key={m.id} metric={m} />
        ))}
      </div>

      {/* Chart + secondary card */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalyticsCard
            title="Revenue"
            subtitle="Last 7 days"
            series={SAMPLE_SERIES}
            total="$42,610"
          />
        </div>
        <EmptyState
          title="Connect an ad source"
          description="Pull spend data from Meta or Google Ads to compute ROAS."
          action={
            <button
              type="button"
              className="inline-flex h-8 items-center rounded-md bg-slate-900 px-3 text-[12px] font-medium text-white hover:bg-slate-800"
            >
              Connect source
            </button>
          }
        />
      </div>

      {/* Recent orders */}
      <div className="mt-6">
        <RecentOrdersTable orders={SAMPLE_ORDERS} onViewAll={() => undefined} />
      </div>
    </DashboardShell>
  );
}
