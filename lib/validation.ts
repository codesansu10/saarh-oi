import type { DealInput } from './types'

export type ValidationErrors = Partial<Record<keyof DealInput, string>>

/**
 * Validate a DealInput. Returns a map of field -> message.
 * An empty object means the deal is valid.
 */
export function validateDeal(deal: DealInput): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!deal.companyName?.trim()) {
    errors.companyName = 'Company name is required.'
  }
  if (!deal.dealId?.trim()) {
    errors.dealId = 'Deal ID is required.'
  }
  if (!deal.productName?.trim()) {
    errors.productName = 'Product name is required.'
  }

  if (!(deal.annualSteelVolumeTonnes > 0)) {
    errors.annualSteelVolumeTonnes = 'Volume must be greater than zero.'
  }
  if (!(deal.productUnits > 0)) {
    errors.productUnits = 'Product units must be greater than zero.'
  }
  if (deal.conventionalSteelPricePerTonne < 0) {
    errors.conventionalSteelPricePerTonne =
      'Conventional price cannot be negative.'
  }
  if (deal.greenPremiumPerTonne < 0) {
    errors.greenPremiumPerTonne = 'Green premium cannot be negative.'
  }
  if (deal.baselineCo2Intensity < deal.greenSteelCo2Intensity) {
    errors.baselineCo2Intensity =
      'Baseline intensity must be greater than or equal to green intensity.'
  }
  if (!(deal.proofItemsRequired > 0)) {
    errors.proofItemsRequired = 'Required proof items must be greater than zero.'
  }
  if (deal.proofItemsAvailable > deal.proofItemsRequired) {
    errors.proofItemsAvailable =
      'Available proof items cannot exceed required proof items.'
  }
  if (deal.proofItemsAvailable < 0) {
    errors.proofItemsAvailable = 'Available proof items cannot be negative.'
  }

  return errors
}

export function isDealValid(deal: DealInput): boolean {
  return Object.keys(validateDeal(deal)).length === 0
}
