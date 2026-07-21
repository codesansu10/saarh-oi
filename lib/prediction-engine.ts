import type { ModelFeatureRow } from './feature-engineering'
import type {
  ObjectionLabel,
  RiskLevel,
  StakeholderPrediction,
} from './types'
import { OBJECTION_LABELS } from './types'
import { toRiskLevel } from './risk-level'

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x))
}

/**
 * Deterministic objection scoring.
 *
 * This mirrors the probabilistic business rules used to synthesise the
 * Random Forest training labels (see ml/generate_synthetic_data.py). It powers
 * the transparent rule-based fallback when the Random Forest API is
 * unavailable, and is intentionally deterministic (no random noise) so the UI
 * and tests are stable.
 */
export function scoreObjections(
  row: ModelFeatureRow,
): Record<ObjectionLabel, number> {
  const supplyRiskScore =
    row.supplyReliability === 'Low'
      ? 1
      : row.supplyReliability === 'Medium'
        ? 0.55
        : 0.15

  const certPending =
    row.certificationStatus === 'Pending' ||
    row.certificationStatus === 'Not started' ||
    row.certificationStatus === 'In audit'
      ? 1
      : 0

  const notQualified =
    row.technicalQualificationStatus === 'Not qualified'
      ? 1
      : row.technicalQualificationStatus === 'In qualification'
        ? 0.55
        : 0.1

  const timelineUrgency =
    row.deliveryTimeline === 'Immediate'
      ? 1
      : row.deliveryTimeline === 'Within 3 months'
        ? 0.75
        : row.deliveryTimeline === 'Within 6 months'
          ? 0.5
          : row.deliveryTimeline === 'Within 12 months'
            ? 0.3
            : 0.15

  const price =
    -1.6 + 4.2 * row.premiumPercentage * row.costSensitivity + 0.6 * (1 - row.strategicFocus)

  const proof =
    -1.4 + 3.4 * (1 - row.proofScore) * row.proofSensitivity + 1.1 * certPending * row.proofSensitivity

  const greenwashing =
    -1.5 + 3.0 * (1 - row.proofScore) * row.claimRiskSensitivity + 1.4 * certPending * row.claimRiskSensitivity

  const supply =
    -1.5 + 3.6 * supplyRiskScore * row.supplySensitivity

  // High total premium with weak strategic justification raises approval risk.
  const premiumMagnitude = clamp01(row.totalPremium / 6_000_000)
  const internal =
    -1.3 + 2.6 * premiumMagnitude * (1 - row.strategicFocus) + 1.4 * row.premiumPercentage

  const technical =
    -1.4 + 3.4 * notQualified * row.technicalSensitivity

  // Distant deadline + low urgency sensitivity + weak strategic pressure.
  const lowUrgency =
    -1.2 + 2.8 * (1 - timelineUrgency) * (1 - row.urgencySensitivity) + 1.0 * (1 - row.strategicFocus)

  const raw: Record<ObjectionLabel, number> = {
    price_objection: price,
    proof_certification_objection: proof,
    greenwashing_objection: greenwashing,
    supply_reliability_objection: supply,
    internal_approval_objection: internal,
    technical_quality_objection: technical,
    low_urgency_objection: lowUrgency,
  }

  const out = {} as Record<ObjectionLabel, number>
  for (const label of OBJECTION_LABELS) {
    out[label] = Number(clamp01(sigmoid(raw[label])).toFixed(4))
  }
  return out
}

export function predictFromRows(
  rows: ModelFeatureRow[],
): StakeholderPrediction[] {
  return rows.map((row) => {
    const probabilities = scoreObjections(row)
    const riskLevels = {} as Record<ObjectionLabel, RiskLevel>
    for (const label of OBJECTION_LABELS) {
      riskLevels[label] = toRiskLevel(probabilities[label])
    }
    return {
      stakeholder: row.stakeholder,
      probabilities,
      riskLevels,
    }
  })
}
