import { useState, useEffect, useRef, useCallback } from 'react';
import type { MerchantApiClient, TrendyolPackage } from '../merchant-api-client.js';

const REFRESH_INTERVAL_MS = 30_000;

export interface UseOrdersState {
  orders: TrendyolPackage[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  updatingPackageId: number | null;
}

export function useOrders(apiClient: MerchantApiClient) {
  const [state, setState] = useState<UseOrdersState>({
    orders: [],
    loading: true,
    error: null,
    totalElements: 0,
    updatingPackageId: null,
  });

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await apiClient.getTrendyolOrders({ page: 0, size: 50 });
      setState((s) => ({
        ...s,
        orders: data.content,
        totalElements: data.totalElements,
        loading: false,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load orders',
      }));
    }
  }, [apiClient]);

  function scheduleRefresh() {
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const data = await apiClient.getTrendyolOrders({ page: 0, size: 50 });
        setState((s) => ({ ...s, orders: data.content, totalElements: data.totalElements }));
      } catch {
        // silently ignore refresh errors
      }
      scheduleRefresh();
    }, REFRESH_INTERVAL_MS);
  }

  useEffect(() => {
    void load();
    scheduleRefresh();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const updateStatus = useCallback(
    async (packageId: number, status: 'Picking' | 'Invoiced') => {
      setState((s) => ({ ...s, updatingPackageId: packageId }));
      try {
        await apiClient.updateTrendyolOrderStatus(packageId, status);
        setState((s) => ({
          ...s,
          updatingPackageId: null,
          orders: s.orders.map((pkg) =>
            pkg.shipmentPackageId === packageId
              ? { ...pkg, shipmentPackageStatus: status }
              : pkg,
          ),
        }));
      } catch {
        setState((s) => ({ ...s, updatingPackageId: null }));
      }
    },
    [apiClient],
  );

  return { ...state, updateStatus, reload: load };
}
