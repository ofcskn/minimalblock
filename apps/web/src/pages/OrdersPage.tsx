import { useState } from 'react';
import { Card, Button, Spinner } from '@minimalblock/ui';
import { useApp } from '../context/AppContext.js';
import { useOrders } from '../lib/trendyol/use-orders.js';
import type { SupabaseUser } from '../types.js';

interface OrdersPageProps {
  user: SupabaseUser;
}

const STATUS_LABELS: Record<string, string> = {
  Created: 'New',
  Picking: 'Picking',
  Invoiced: 'Invoiced',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
};

function statusColor(status: string): string {
  switch (status) {
    case 'Created':
      return 'bg-blue-50 text-blue-700';
    case 'Picking':
      return 'bg-amber-50 text-amber-700';
    case 'Invoiced':
      return 'bg-indigo-50 text-indigo-700';
    case 'Shipped':
      return 'bg-purple-50 text-purple-700';
    case 'Delivered':
      return 'bg-green-50 text-green-700';
    case 'Cancelled':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-gray-50 text-gray-600';
  }
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function OrdersPage({ user: _user }: OrdersPageProps) {
  const { apiClient } = useApp();
  const { orders, loading, error, totalElements, updatingPackageId, updateStatus, reload } = useOrders(apiClient);
  const [filter, setFilter] = useState('');

  const visible = filter
    ? orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(filter.toLowerCase()) ||
          o.shipmentPackageStatus.toLowerCase().includes(filter.toLowerCase()),
      )
    : orders;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          {totalElements > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">{totalElements} total packages</p>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => void reload()}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner size="lg" label="Loading orders…" />
        </div>
      ) : error ? (
        <Card>
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm">No orders yet.</p>
            <p className="text-xs mt-1">Orders from your Trendyol seller account will appear here.</p>
          </div>
        </Card>
      ) : (
        <>
          <div>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by order number or status…"
              className="block w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Cargo</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map((pkg) => {
                  const isUpdating = updatingPackageId === pkg.shipmentPackageId;
                  return (
                    <tr key={pkg.shipmentPackageId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{pkg.orderNumber}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(pkg.orderDate)}</td>
                      <td className="px-4 py-3 text-gray-600">{pkg.lines.length}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {pkg.grossAmount.toLocaleString('tr-TR')} {pkg.currencyCode}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(pkg.shipmentPackageStatus)}`}>
                          {STATUS_LABELS[pkg.shipmentPackageStatus] ?? pkg.shipmentPackageStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {pkg.cargo?.providerName ?? '—'}
                        {pkg.cargo?.trackingNumber && (
                          <span className="ml-1 text-gray-400">#{pkg.cargo.trackingNumber}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {pkg.shipmentPackageStatus === 'Created' || pkg.shipmentPackageStatus === 'Picking' ? (
                          <div className="flex gap-1">
                            <button
                              disabled={isUpdating}
                              onClick={() => void updateStatus(pkg.shipmentPackageId, 'Picking')}
                              className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-colors"
                            >
                              {isUpdating ? '…' : 'Picking'}
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => void updateStatus(pkg.shipmentPackageId, 'Invoiced')}
                              className="rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                            >
                              {isUpdating ? '…' : 'Invoice'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Line items detail cards */}
          <div className="space-y-3">
            {visible.map((pkg) => (
              <Card key={`detail-${pkg.shipmentPackageId}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">{pkg.orderNumber}</span>
                  {pkg.shipmentAddress && (
                    <span className="text-xs text-gray-400">
                      {pkg.shipmentAddress.fullName} · {pkg.shipmentAddress.city}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {pkg.lines.map((line) => (
                    <div key={line.lineId} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{line.product.title}</p>
                        <p className="text-[10px] text-gray-400">SKU: {line.merchantSku} · {line.product.brand.name}</p>
                      </div>
                      <span className="text-xs text-gray-600">×{line.quantity}</span>
                      <span className="text-xs font-medium text-gray-900">
                        {line.amount.toLocaleString('tr-TR')} {pkg.currencyCode}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
