import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductStats, HotspotStat, EmbedDomainStat } from '@minimalblock/data';
import { Card, Spinner, Button } from '@minimalblock/ui';
import { useApp } from '../context/AppContext.js';
import type { SupabaseUser } from '../types.js';

interface DashboardPageProps {
  user: SupabaseUser;
}

const EVENT_LABELS: Record<string, string> = {
  viewer_loaded: 'Views',
  model_rotated: 'Rotations',
  ar_opened: 'AR opens',
  hotspot_clicked: 'Hotspot clicks',
  embed_copied: 'Embed copies',
};

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-gray-50 px-4 py-3 text-center min-w-[80px]">
      <span className="text-2xl font-bold text-indigo-600">{value}</span>
      <span className="text-xs text-gray-500 mt-0.5">{label}</span>
    </div>
  );
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

function downloadCsv(stats: ProductStats[], names: Record<string, string>) {
  const header = ['Product', 'Views', 'Rotations', 'AR Opens', 'Hotspot Clicks', 'Embed Copies', 'Total'];
  const rows = stats.map(s => [
    `"${(names[s.productId] ?? s.productId).replace(/"/g, '""')}"`,
    s.counts['viewer_loaded'] ?? 0,
    s.counts['model_rotated'] ?? 0,
    s.counts['ar_opened'] ?? 0,
    s.counts['hotspot_clicked'] ?? 0,
    s.counts['embed_copied'] ?? 0,
    s.total,
  ]);
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function DashboardPage({ user }: DashboardPageProps) {
  const navigate = useNavigate();
  const { eventsRepo, productRepo, embedViewsRepo } = useApp();

  const [stats, setStats] = useState<ProductStats[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [hotspotStats, setHotspotStats] = useState<Record<string, HotspotStat[]>>({});
  const [embedDomains, setEmbedDomains] = useState<EmbedDomainStat[]>([]);
  const [avgSessions, setAvgSessions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      eventsRepo.getStatsForOwner(user.id),
      productRepo.findByOwnerId(user.id),
      eventsRepo.getHotspotStatsForOwner(user.id),
      embedViewsRepo.getDomainsForOwner(user.id),
      eventsRepo.getAvgSessionDuration(user.id),
    ]).then(([s, products, hStats, domains, sessions]) => {
      setStats(s.sort((a, b) => b.total - a.total));
      const nameMap: Record<string, string> = {};
      for (const p of products) nameMap[p.id] = p.name;
      setNames(nameMap);
      setHotspotStats(hStats);
      setEmbedDomains(domains);
      setAvgSessions(sessions);
    }).finally(() => setLoading(false));
  }, [eventsRepo, productRepo, embedViewsRepo, user.id]);

  const totalEvents = stats.reduce((s, p) => s + p.total, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        {stats.length > 0 && (
          <Button variant="secondary" size="sm" onClick={() => downloadCsv(stats, names)}>
            Export CSV
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" label="Loading stats…" />
        </div>
      ) : stats.length === 0 ? (
        <Card>
          <div className="py-10 text-center text-gray-400">
            <p className="text-sm">No interaction data yet.</p>
            <p className="text-xs mt-1">Start viewing your 3D products to generate analytics.</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Overview card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Total interactions</h2>
              <span className="text-2xl font-bold text-indigo-600">{totalEvents}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.keys(EVENT_LABELS).map(type => {
                const count = stats.reduce((s, p) => s + (p.counts[type as keyof typeof p.counts] ?? 0), 0);
                return <StatPill key={type} label={EVENT_LABELS[type]} value={count} />;
              })}
            </div>
          </Card>

          {/* Embed domain breakdown */}
          {embedDomains.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Top embed domains</h2>
              <div className="space-y-2">
                {embedDomains.map(({ domain, count }) => {
                  const pct = Math.round((count / embedDomains.reduce((s, d) => s + d.count, 0)) * 100);
                  return (
                    <div key={domain} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-40 truncate">{domain}</span>
                      <div className="flex-1 rounded-full bg-gray-100 h-2 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Per-product cards */}
          <h2 className="text-sm font-semibold text-gray-700">By product</h2>
          {stats.map(stat => {
            const productHotspots = hotspotStats[stat.productId] ?? [];
            const avgMs = avgSessions[stat.productId];

            return (
              <Card key={stat.productId}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <button
                      className="text-sm font-medium text-indigo-600 hover:underline text-left"
                      onClick={() => navigate(`/product/${stat.productId}`)}
                    >
                      {names[stat.productId] ?? stat.productId.slice(0, 8)}
                    </button>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-gray-400">{stat.total} interactions</p>
                      {avgMs !== undefined && (
                        <p className="text-xs text-gray-400">avg session: {formatMs(avgMs)}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {Object.keys(EVENT_LABELS).map(type => {
                    const count = stat.counts[type as keyof typeof stat.counts] ?? 0;
                    return <StatPill key={type} label={EVENT_LABELS[type]} value={count} />;
                  })}
                </div>

                {/* Hotspot heatmap */}
                {productHotspots.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">Hotspot clicks</p>
                    <div className="space-y-1.5">
                      {productHotspots.map(({ label, count }) => {
                        const max = productHotspots[0].count;
                        const pct = Math.round((count / max) * 100);
                        return (
                          <div key={label} className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-32 truncate">{label}</span>
                            <div className="flex-1 rounded-full bg-amber-100 h-1.5 overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}
