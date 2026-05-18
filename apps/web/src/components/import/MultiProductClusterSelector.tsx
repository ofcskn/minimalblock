import { useState } from 'react';
import type { ImportedImageCandidate, ProductCluster } from '@minimalblock/core';

interface Props {
  clusters: ProductCluster[];
  imageCandidates: ImportedImageCandidate[];
  onAccept: (clusterId: string) => Promise<void>;
}

const CONFIDENCE_COLORS = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-orange-100 text-orange-700',
} as const;

export function MultiProductClusterSelector({ clusters, imageCandidates, onAccept }: Props) {
  const [accepting, setAccepting] = useState<string | null>(null);

  const handleAccept = async (clusterId: string) => {
    setAccepting(clusterId);
    try {
      await onAccept(clusterId);
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 flex items-start gap-2">
        <span className="mt-0.5 text-amber-500">⚠</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">Multiple products detected on this page</p>
          <p className="text-xs text-amber-700">Select which product you want to import. Each will become a separate listing.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {clusters.map((cluster) => {
          const clusterImages = cluster.imageIds
            .map((id) => imageCandidates.find((c) => c.id === id))
            .filter((c): c is ImportedImageCandidate => c !== undefined && !c.aiRejected);

          return (
            <div
              key={cluster.clusterId}
              className="flex flex-col rounded-lg border border-stone-200 bg-white p-3 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-stone-800">{cluster.clusterLabel}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${CONFIDENCE_COLORS[cluster.confidence]}`}>
                  {cluster.confidence}
                </span>
              </div>

              {clusterImages.length > 0 && (
                <div className="mb-2 flex gap-1.5 overflow-hidden">
                  {clusterImages.slice(0, 4).map((img) => (
                    <div key={img.id} className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-stone-100 bg-stone-50">
                      {img.url ? (
                        <img
                          src={img.url}
                          alt={img.alt ?? cluster.clusterLabel}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-400">No img</div>
                      )}
                    </div>
                  ))}
                  {clusterImages.length > 4 && (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-stone-100 bg-stone-50 text-xs text-stone-500">
                      +{clusterImages.length - 4}
                    </div>
                  )}
                </div>
              )}

              <div className="mb-3 space-y-0.5 text-[11px] text-stone-500">
                {cluster.fields.category?.value && (
                  <p>Category: <span className="font-medium text-stone-700">{cluster.fields.category.value}</span></p>
                )}
                {cluster.fields.materials?.value?.length ? (
                  <p>Materials: <span className="font-medium text-stone-700">{cluster.fields.materials.value.join(', ')}</span></p>
                ) : null}
                {cluster.fields.dimensions?.value && (
                  <p>Dimensions: <span className="font-medium text-stone-700">{cluster.fields.dimensions.value}</span></p>
                )}
                {cluster.materialFinish && cluster.materialFinish !== 'unknown' && (
                  <p>Finish: <span className="font-medium text-stone-700">{cluster.materialFinish}</span></p>
                )}
              </div>

              <button
                type="button"
                disabled={accepting !== null}
                onClick={() => handleAccept(cluster.clusterId)}
                className="mt-auto w-full rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {accepting === cluster.clusterId ? 'Importing…' : 'Import this product'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
