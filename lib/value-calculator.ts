import type { BusinessValueOutput, DealInput } from './types'

/**
 * Pure business-value calculation module.
 *
 * All formulas preserve full numeric precision internally.
 * Callers should round only for display.
 */
export function calculateBusinessValue(deal: DealInput): BusinessValueOutput {
  const {
    annualSteelVolumeTonnes,
    greenPremiumPerTonne,
    productUnits,
    conventionalSteelPricePerTonne,
    baselineCo2Intensity,
    greenSteelCo2Intensity,
    proofItemsAvailable,
    proofItemsRequired,
    carbonPrice,
  } = deal

  const totalPremium = annualSteelVolumeTonnes * greenPremiumPerTonne

  const premiumPerProduct = productUnits > 0 ? totalPremium / productUnits : 0

  const premiumPercentage =
    conventionalSteelPricePerTonne > 0
      ? greenPremiumPerTonne / conventionalSteelPricePerTonne
      : 0

  const co2Saved =
    annualSteelVolumeTonnes * (baselineCo2Intensity - greenSteelCo2Intensity)

  const proofScore =
    proofItemsRequired > 0 ? proofItemsAvailable / proofItemsRequired : 0

  const greenSteelPricePerTonne =
    conventionalSteelPricePerTonne + greenPremiumPerTonne

  const conventionalContractValue =
    annualSteelVolumeTonnes * conventionalSteelPricePerTonne

  const greenSteelContractValue =
    annualSteelVolumeTonnes * greenSteelPricePerTonne

  // Indicative carbon-cost exposure = avoided emissions * carbon price.
  // This is an illustrative modelled value, NOT a guaranteed saving.
  const indicativeCarbonValue = co2Saved * (carbonPrice?.value ?? 0)

  // ---- Deal Readiness (composite 0..1) ----
  // A transparent weighted score. Every sub-score is a fraction in [0,1],
  // so each input below directly and logically moves the final KPI.
  const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

  // 1. Proof completeness (35%): how much of the required evidence exists.
  const proofSubScore = clamp01(proofScore)

  // 2. Certification maturity (25%): certified deals are audit-ready.
  const certSubScore =
    deal.certificationStatus === 'Certified'
      ? 1
      : deal.certificationStatus === 'In audit'
        ? 0.6
        : deal.certificationStatus === 'Pending'
          ? 0.5
          : 0.2 // 'Not started'

  // 3. Supply reliability (20%): can we actually deliver at volume.
  const supplySubScore =
    deal.supplyReliability === 'High'
      ? 1
      : deal.supplyReliability === 'Medium'
        ? 0.6
        : 0.2 // 'Low'

  // 4. Price competitiveness (20%): a smaller green premium is easier to
  //    approve. A premium of 0% scores 1.0; a premium of >=30% scores 0.
  const priceSubScore = clamp01(1 - premiumPercentage / 0.3)

  const dealReadiness = clamp01(
    0.35 * proofSubScore +
      0.25 * certSubScore +
      0.2 * supplySubScore +
      0.2 * priceSubScore,
  )

  return {
    totalPremium,
    premiumPerProduct,
    premiumPercentage,
    co2Saved,
    proofScore,
    supplyRisk: deal.supplyReliability,
    conventionalContractValue,
    greenSteelContractValue,
    greenSteelPricePerTonne,
    indicativeCarbonValue,
    dealReadiness,
  }
}

// ---- Display helpers (round only for display) ----

export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

export function fmtDecimal(n: number, digits = 1): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function fmtCurrency(n: number, currency = 'EUR'): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })
}

export function fmtCurrencyPrecise(n: number, currency = 'EUR'): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function fmtPercent(fraction: number, digits = 0): string {
  return `${(fraction * 100).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`
}
