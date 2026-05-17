import type { OrderStatus, OrderSummary } from '@minimalblock/ui';

interface RecentOrdersTableProps {
  orders: OrderSummary[];
  onViewAll?: () => void;
  onSelectOrder?: (id: string) => void;
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: 'bg-slate-100 text-slate-700',
  processing: 'bg-amber-50 text-amber-700',
  shipped: 'bg-sky-50 text-sky-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
  refunded: 'bg-slate-100 text-slate-600',
};

function formatTotal(order: OrderSummary): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: order.currency,
    }).format(order.total);
  } catch {
    return `${order.currency} ${order.total.toFixed(2)}`;
  }
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ' +
        STATUS_STYLE[status]
      }
    >
      <span aria-hidden="true" className="mr-1 inline-block h-1 w-1 rounded-full bg-current" />
      {status[0].toUpperCase() + status.slice(1)}
    </span>
  );
}

export function RecentOrdersTable({
  orders,
  onViewAll,
  onSelectOrder,
}: RecentOrdersTableProps) {
  return (
    <section
      aria-label="Recent orders"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white"
    >
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold text-slate-900">Recent orders</h2>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-[13px] font-medium text-slate-600 hover:text-slate-900"
          >
            View all
          </button>
        )}
      </header>

      {/* Desktop / tablet: table */}
      <div className="hidden sm:block">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead>
            <tr className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-slate-500">
              <th scope="col" className="px-5 py-2.5">Order</th>
              <th scope="col" className="px-5 py-2.5">Customer</th>
              <th scope="col" className="px-5 py-2.5">Placed</th>
              <th scope="col" className="px-5 py-2.5 text-right">Total</th>
              <th scope="col" className="px-5 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="cursor-pointer transition-colors hover:bg-slate-50/60"
                onClick={() => onSelectOrder?.(order.id)}
              >
                <td className="px-5 py-3 font-medium text-slate-900">{order.id}</td>
                <td className="px-5 py-3 text-slate-700">{order.customer}</td>
                <td className="px-5 py-3 text-slate-500">{order.placedAt}</td>
                <td className="px-5 py-3 text-right font-medium tabular-nums text-slate-900">
                  {formatTotal(order)}
                </td>
                <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list */}
      <ul className="divide-y divide-slate-100 sm:hidden">
        {orders.map((order) => (
          <li key={order.id}>
            <button
              type="button"
              onClick={() => onSelectOrder?.(order.id)}
              className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50/60"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-slate-900">{order.id}</p>
                <p className="truncate text-[12px] text-slate-500">{order.customer}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{order.placedAt}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[13px] font-medium tabular-nums text-slate-900">
                  {formatTotal(order)}
                </span>
                <StatusBadge status={order.status} />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
