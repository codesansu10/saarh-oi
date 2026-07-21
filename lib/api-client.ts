import type {
  BusinessValueOutput,
  DealInput,
  PredictionResponse,
  Stakeholder,
} from './types'
import { STAKEHOLDERS } from './types'
import type { BriefResult } from './brief-schema'

export async function fetchPrediction(
  deal: DealInput,
  calculatorOutput: BusinessValueOutput,
  stakeholders: Stakeholder[] = STAKEHOLDERS,
): Promise<PredictionResponse> {
  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ deal, calculatorOutput, stakeholders }),
  })
  if (!res.ok) {
    throw new Error(`Prediction request failed (${res.status})`)
  }
  return (await res.json()) as PredictionResponse
}

export async function fetchBrief(
  deal: DealInput,
  calculatorOutput: BusinessValueOutput,
  prediction: PredictionResponse['predictions'][number],
  stakeholder: Stakeholder,
): Promise<BriefResult> {
  const res = await fetch('/api/brief', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ deal, calculatorOutput, prediction, stakeholder }),
  })
  if (!res.ok) {
    throw new Error(`Brief request failed (${res.status})`)
  }
  return (await res.json()) as BriefResult
}
