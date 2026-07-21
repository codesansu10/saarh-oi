import { AlertTriangle, CircuitBoard, FlaskConical } from 'lucide-react'
import type { PredictionResponse } from '@/lib/types'

/**
 * Shows the true provenance of the current prediction:
 * - which engine produced it (Random Forest API vs deterministic fallback)
 * - the model version
 * - a permanent synthetic-data disclaimer
 */
export function ModelStatusBanner({
  prediction,
}: {
  prediction: PredictionResponse | null
}) {
  const isFallback = !prediction || prediction.source === 'fallback'

  return (
    <div className="space-y-2">
      {prediction ? (
        <div
          className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
            isFallback
              ? 'border-[var(--risk-medium)]/30 bg-[var(--risk-medium-soft)] text-[var(--risk-medium)]'
              : 'border-[var(--brand-green)]/30 bg-[var(--brand-green-soft)] text-[var(--brand-green-dark)]'
          }`}
          role="status"
        >
          {isFallback ? (
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          ) : (
            <CircuitBoard className="mt-0.5 size-4 shrink-0" aria-hidden />
          )}
          <div>
            {isFallback ? (
              <p className="font-medium">
                Rule-based demonstration fallback — Random Forest API
                unavailable.
              </p>
            ) : (
              <p className="font-medium">
                Random Forest prediction service active.
              </p>
            )}
            <p className="text-xs opacity-80">
              Model version: {prediction.modelVersion} · Data mode:{' '}
              {prediction.dataMode}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface-subtle px-3 py-2 text-xs text-muted-foreground">
        <FlaskConical className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <p>
          Academic prototype trained using synthetic data. Predictions
          demonstrate the technical mechanism and are not validated forecasts of
          actual customer behaviour.
        </p>
      </div>
    </div>
  )
}
