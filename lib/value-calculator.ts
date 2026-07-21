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
