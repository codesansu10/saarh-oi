import type {
  BusinessValueOutput,
  DealInput,
  Stakeholder,
} from './types'
import { STAKEHOLDERS } from './types'
import {
  getStakeholderProfile,
  type StakeholderProfile,
} from './stakeholder-profiles'

export interface ModelFeatureRow {
  // identity
  companyName: string
  dealId: string
  stakeholder: Stakeholder

  // categorical
  industry: string
  materialType: string
  proofStatus: string
  certificationStatus: string
  supplyReliability: string
  technicalQualificationStatus: string
  deliveryTimeline: string

  // numerical (deal + calculator)
  annualSteelVolumeTonnes: number
  conventionalSteelPricePerTonne: number
  greenPremiumPerTonne: number
  totalPremium: number
  premiumPerProduct: number
  premiumPercentage: number
  baselineCo2Intensity: number
  greenSteelCo2Intensity: number
  co2Saved: number
  proofScore: number
  carbonPrice: number
  indicativeCarbonValue: number

  // stakeholder profile
  costSensitivity: number
  proofSensitivity: number
  claimRiskSensitivity: number
  strategicFocus: number
  supplySensitivity: number
  technicalSensitivity: number
  urgencySensitivity: number
}

function buildRow(
  deal: DealInput,
  output: BusinessValueOutput,
  stakeholder: Stakeholder,
  profile: StakeholderProfile,
): ModelFeatureRow {
  return {
    companyName: deal.companyName,
    dealId: deal.dealId,
    stakeholder,

    industry: deal.industry,
    materialType: deal.materialType,
    // Collapse the multi-select proof list into a stable representative token.
    proofStatus: deal.proofStatus.length
      ? deal.proofStatus.join(' | ')
      : 'None',
    certificationStatus: deal.certificationStatus,
    supplyReliability: deal.supplyReliability,
    technicalQualificationStatus: deal.technicalQualificationStatus,
    deliveryTimeline: deal.deliveryTimeline,

    annualSteelVolumeTonnes: deal.annualSteelVolumeTonnes,
    conventionalSteelPricePerTonne: deal.conventionalSteelPricePerTonne,
    greenPremiumPerTonne: deal.greenPremiumPerTonne,
    totalPremium: output.totalPremium,
    premiumPerProduct: output.premiumPerProduct,
    premiumPercentage: output.premiumPercentage,
    baselineCo2Intensity: deal.baselineCo2Intensity,
    greenSteelCo2Intensity: deal.greenSteelCo2Intensity,
    co2Saved: output.co2Saved,
    proofScore: output.proofScore,
    carbonPrice: deal.carbonPrice?.value ?? 0,
    indicativeCarbonValue: output.indicativeCarbonValue,

    costSensitivity: profile.costSensitivity,
    proofSensitivity: profile.proofSensitivity,
    claimRiskSensitivity: profile.claimRiskSensitivity,
    strategicFocus: profile.strategicFocus,
    supplySensitivity: profile.supplySensitivity,
    technicalSensitivity: profile.technicalSensitivity,
    urgencySensitivity: profile.urgencySensitivity,
  }
}

/**
 * Convert one DealInput + BusinessValueOutput into four stakeholder-specific
 * ModelFeatureRow objects (Procurement, Sustainability, Management, Compliance).
 *
 * Deal-level numeric values are identical across rows; only stakeholder
 * profile values change.
 */
export function buildFeatureRows(
  deal: DealInput,
  output: BusinessValueOutput,
  stakeholders: Stakeholder[] = STAKEHOLDERS,
): ModelFeatureRow[] {
  return stakeholders.map((s) =>
    buildRow(deal, output, s, getStakeholderProfile(s)),
  )
}
