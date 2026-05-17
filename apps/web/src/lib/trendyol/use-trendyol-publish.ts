import { useState, useCallback, useRef } from 'react';
import type { MerchantApiClient, TrendyolProductDraft } from '../merchant-api-client.js';

type PublishPhase = 'idle' | 'generating' | 'reviewing' | 'publishing' | 'polling' | 'done' | 'error';

export interface UseTrendyolPublishState {
  phase: PublishPhase;
  draft: TrendyolProductDraft | null;
  batchRequestId: string | null;
  batchStatus: 'IN_PROGRESS' | 'DONE' | 'FAILED' | null;
  error: string | null;
}

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 10;

export function useTrendyolPublish(apiClient: MerchantApiClient) {
  const [state, setState] = useState<UseTrendyolPublishState>({
    phase: 'idle',
    draft: null,
    batchRequestId: null,
    batchStatus: null,
    error: null,
  });

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollAttempts = useRef(0);

  const clearPoll = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    pollAttempts.current = 0;
  };

  const generateListing = useCallback(
    async (productId: string) => {
      clearPoll();
      setState({ phase: 'generating', draft: null, batchRequestId: null, batchStatus: null, error: null });
      try {
        const { draft } = await apiClient.generateTrendyolListing(productId);
        setState((s) => ({ ...s, phase: 'reviewing', draft }));
      } catch (err) {
        setState((s) => ({ ...s, phase: 'error', error: err instanceof Error ? err.message : 'Generation failed' }));
      }
    },
    [apiClient],
  );

  const updateDraft = useCallback((patch: Partial<TrendyolProductDraft>) => {
    setState((s) => (s.draft ? { ...s, draft: { ...s.draft, ...patch } } : s));
  }, []);

  const publish = useCallback(
    async (draft: TrendyolProductDraft, imageUrl: string, barcode: string) => {
      setState((s) => ({ ...s, phase: 'publishing', error: null }));
      try {
        const item = {
          barcode,
          title: draft.title,
          productMainId: barcode,
          brandId: 1,
          categoryId: draft.categoryId,
          quantity: 10,
          stockCode: barcode,
          description: draft.description,
          currencyType: 'TRY',
          listPrice: draft.listPrice,
          salePrice: draft.salePrice,
          vatRate: 18,
          images: [{ url: imageUrl }],
          attributes: [],
        };
        const { batchRequestId } = await apiClient.createTrendyolProducts([item]);
        setState((s) => ({ ...s, phase: 'polling', batchRequestId }));
        schedulePoll(batchRequestId);
      } catch (err) {
        setState((s) => ({
          ...s,
          phase: 'error',
          error: err instanceof Error ? err.message : 'Publish failed',
        }));
      }
    },
    [apiClient], // eslint-disable-line react-hooks/exhaustive-deps
  );

  function schedulePoll(batchRequestId: string) {
    pollAttempts.current += 1;
    if (pollAttempts.current > MAX_POLL_ATTEMPTS) {
      setState((s) => ({ ...s, phase: 'done', batchStatus: 'IN_PROGRESS' }));
      return;
    }
    pollTimerRef.current = setTimeout(async () => {
      try {
        const { batch } = await apiClient.pollTrendyolBatch(batchRequestId);
        if (batch.status === 'IN_PROGRESS') {
          setState((s) => ({ ...s, batchStatus: 'IN_PROGRESS' }));
          schedulePoll(batchRequestId);
        } else {
          setState((s) => ({ ...s, phase: 'done', batchStatus: batch.status }));
        }
      } catch {
        setState((s) => ({ ...s, phase: 'done', batchStatus: 'DONE' }));
      }
    }, POLL_INTERVAL_MS);
  }

  const reset = useCallback(() => {
    clearPoll();
    setState({ phase: 'idle', draft: null, batchRequestId: null, batchStatus: null, error: null });
  }, []);

  return { ...state, generateListing, updateDraft, publish, reset };
}
