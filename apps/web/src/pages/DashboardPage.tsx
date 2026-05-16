import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductStats } from '@minimalblock/data';
import { Card, Spinner } from '@minimalblock/ui';
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

export function DashboardPage({ user }: DashboardPageProps) {
  const navigate = useNavigate();
  const { eventsRepo, productRepo } = useApp();

  const [stats, setStats] = useState<ProductStats[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      eventsRepo.getStatsForOwner(user.id),
      productRepo.findByOwnerId(user.id),
    ]).then(([s, products]) => {
      setStats(s.sort((a, b) => b.total - a.total));
      const nameMap: Record<string, string> = {};
      for (const p of products) nameMap[p.id] = p.name;
      setNames(nameMap);
    }).finally(() => setLoading(false));
  }, [eventsRepo, productRepo, user.id]);

  const totalEvents = stats.reduce((s, p) => s + p.total, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
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
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Total interactions across all products</h2>
              <span className="text-2xl font-bold text-indigo-600">{totalEvents}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.keys(EVENT_LABELS).map(type => {
                const count = stats.reduce((s, p) => s + (p.counts[type as keyof typeof p.counts] ?? 0), 0);
                return <StatPill key={type} label={EVENT_LABELS[type]} value={count} />;
              })}
            </div>
          </Card>

          <h2 className="text-sm font-semibold text-gray-700">By product</h2>
          {stats.map(stat => (
            <Card key={stat.productId}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <button
                    className="text-sm font-medium text-indigo-600 hover:underline text-left"
                    onClick={() => navigate(`/product/${stat.productId}`)}
                  >
                    {names[stat.productId] ?? stat.productId.slice(0, 8)}
                  </button>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.total} total interactions</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(EVENT_LABELS).map(type => {
                  const count = stat.counts[type as keyof typeof stat.counts] ?? 0;
                  return <StatPill key={type} label={EVENT_LABELS[type]} value={count} />;
                })}
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
