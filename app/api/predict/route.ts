// Objection prediction endpoint: tries the RF model service, else deterministic fallback.
import { NextResponse } from 'next/server'
import { buildFeatureRows } from '@/lib/feature-engineering'
import { predictFromRows } from '@/lib/prediction-engine'
import { validateDeal, isDealValid } from '@/lib/validation'
import { calculateBusinessValue } from '@/lib/value-calculator'
import { STAKEHOLDERS } from '@/lib/types'
import type {
  BusinessValueOutput,
  DealInput,
  PredictionResponse,
  Stakeholder,
  StakeholderPrediction,
} from '@/lib/types'

export const runtime = 'nodejs'

const FALLBACK_MODEL_VERSION = 'rule-based-fallback-v1'

interface PredictBody {
  deal: DealInput
  calculatorOutput?: BusinessValueOutput
  stakeholders?: Stakeholder[]
}

/**
 * Try the external Random Forest model service if MODEL_API_URL is configured.
 * Returns null on any failure so the caller can fall back to the deterministic
 * engine. The prediction is never silently faked: `source` records which path
 * produced the numbers.
 */
async function tryModelApi(
  body: PredictBody,
): Promise<PredictionResponse | null> {
  const base = process.env.MODEL_API_URL
  if (!base) return null
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(`${base.replace(/\/$/, '')}/predict`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const data = (await res.json()) as PredictionResponse
    return { ...data, source: 'model-api' }
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  let body: PredictBody
  try {
    body = (await request.json()) as PredictBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body?.deal) {
    return NextResponse.json({ error: 'Missing deal' }, { status: 400 })
  }

  if (!isDealValid(body.deal)) {
    return NextResponse.json(
      { error: 'Invalid deal', issues: validateDeal(body.deal) },
      { status: 422 },
    )
  }

  const stakeholders = body.stakeholders?.length
    ? body.stakeholders
    : STAKEHOLDERS
  const calculatorOutput =
    body.calculatorOutput ?? calculateBusinessValue(body.deal)

  const fromApi = await tryModelApi({
    deal: body.deal,
    calculatorOutput,
    stakeholders,
  })
  if (fromApi) {
    return NextResponse.json(fromApi)
  }

  const rows = buildFeatureRows(body.deal, calculatorOutput, stakeholders)
  const predictions: StakeholderPrediction[] = predictFromRows(rows)

  const response: PredictionResponse = {
    modelVersion: FALLBACK_MODEL_VERSION,
    dataMode: 'synthetic',
    source: 'fallback',
    predictions,
  }
  return NextResponse.json(response)
}
