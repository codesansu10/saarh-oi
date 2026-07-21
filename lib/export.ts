import type {
  BusinessValueOutput,
  DealInput,
  PredictionResponse,
  Provenance,
} from './types'
import type { ModelFeatureRow } from './feature-engineering'
import type { SalesBrief } from './brief-schema'

export interface CaseExport {
  exportedAt: string
  deal: DealInput
  provenance: Record<string, Provenance>
  outputs: BusinessValueOutput | null
  engineeredFeatures: ModelFeatureRow[]
  modelVersion: string | null
  dataMode: string | null
  predictionSource: string | null
  probabilities: PredictionResponse['predictions'] | null
  brief: SalesBrief | null
}

export function buildCaseExport(args: {
  deal: DealInput
  output: BusinessValueOutput | null
  features: ModelFeatureRow[]
  prediction: PredictionResponse | null
  brief: SalesBrief | null
  provenance: Record<string, Provenance>
}): CaseExport {
  return {
    exportedAt: new Date().toISOString(),
    deal: args.deal,
    provenance: args.provenance,
    outputs: args.output,
    engineeredFeatures: args.features,
    modelVersion: args.prediction?.modelVersion ?? null,
    dataMode: args.prediction?.dataMode ?? null,
    predictionSource: args.prediction?.source ?? null,
    probabilities: args.prediction?.predictions ?? null,
    brief: args.brief,
  }
}

export function slugify(s: string): string {
  return (
    s
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'case'
  )
}

/** Trigger a client-side download of a JSON object. */
export function downloadJson(filename: string, data: unknown): void {
  if (typeof window === 'undefined') return
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
