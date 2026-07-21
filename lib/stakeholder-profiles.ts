import type { Stakeholder } from './types'

export interface StakeholderProfile {
  costSensitivity: number
  proofSensitivity: number
  claimRiskSensitivity: number
  strategicFocus: number
  supplySensitivity: number
  // Two additional documented features required for the remaining labels.
  technicalSensitivity: number
  urgencySensitivity: number
}

/**
 * Base stakeholder priority profiles.
 *
 * Deal-level values remain identical across stakeholders; these priority
 * weights are what cause the same deal to yield different objection
 * probabilities for each stakeholder.
 *
 * technicalSensitivity / urgencySensitivity carry documented defaults.
 */
export const STAKEHOLDER_PROFILES: Record<Stakeholder, StakeholderProfile> = {
  Procurement: {
    costSensitivity: 0.9,
    proofSensitivity: 0.5,
    claimRiskSensitivity: 0.3,
    strategicFocus: 0.5,
    supplySensitivity: 0.8,
    technicalSensitivity: 0.6, // procurement cares about qualification for supply continuity
    urgencySensitivity: 0.5,
  },
  Sustainability: {
    costSensitivity: 0.3,
    proofSensitivity: 0.9,
    claimRiskSensitivity: 0.85,
    strategicFocus: 0.7,
    supplySensitivity: 0.3,
    technicalSensitivity: 0.4,
    urgencySensitivity: 0.7, // driven by ESG reporting cycles
  },
  Management: {
    costSensitivity: 0.6,
    proofSensitivity: 0.5,
    claimRiskSensitivity: 0.5,
    strategicFocus: 0.95,
    supplySensitivity: 0.6,
    technicalSensitivity: 0.5,
    urgencySensitivity: 0.6,
  },
  Compliance: {
    costSensitivity: 0.2,
    proofSensitivity: 0.95,
    claimRiskSensitivity: 0.95,
    strategicFocus: 0.4,
    supplySensitivity: 0.3,
    technicalSensitivity: 0.7, // technical/documentary rigour
    urgencySensitivity: 0.9, // regulatory deadlines drive urgency
  },
}

export function getStakeholderProfile(
  stakeholder: Stakeholder,
): StakeholderProfile {
  return STAKEHOLDER_PROFILES[stakeholder]
}

export const PROFILE_FEATURE_LABELS: Record<
  keyof StakeholderProfile,
  string
> = {
  costSensitivity: 'Cost sensitivity',
  proofSensitivity: 'Proof sensitivity',
  claimRiskSensitivity: 'Claim-risk sensitivity',
  strategicFocus: 'Strategic focus',
  supplySensitivity: 'Supply sensitivity',
  technicalSensitivity: 'Technical sensitivity',
  urgencySensitivity: 'Urgency sensitivity',
}
