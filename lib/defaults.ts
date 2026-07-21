import type { CarbonPrice, DealInput } from './types'

export const DEFAULT_CARBON_PRICE: CarbonPrice = {
  value: 85,
  currency: 'EUR',
  effectiveDate: '2026-01-01',
  source: 'Illustrative EU ETS assumption',
}

export function createEmptyDeal(): DealInput {
  return {
    companyName: '',
    dealId: '',
    industry: 'Automotive',
    productName: '',
    materialType: 'Spring Steel',
    annualSteelVolumeTonnes: 0,
    conventionalSteelPricePerTonne: 0,
    greenPremiumPerTonne: 0,
    baselineCo2Intensity: 0,
    greenSteelCo2Intensity: 0,
    productUnits: 0,
    proofItemsAvailable: 0,
    proofItemsRequired: 1,
    proofStatus: [],
    certificationStatus: 'Not started',
    supplyReliability: 'Medium',
    deliveryTimeline: 'Within 6 months',
    technicalQualificationStatus: 'In qualification',
    regulatoryDeadline: '',
    salespersonNotes: '',
    carbonPrice: { ...DEFAULT_CARBON_PRICE },
  }
}

/**
 * Mercedes seed example. Verified expected calculator outputs:
 *   totalPremium       = 5,616,000
 *   premiumPerProduct  = 46.80
 *   premiumPercentage  = 0.25 (25%)
 *   co2Saved           = 49,358.4 t CO2
 *   proofScore         = 0.75
 */
export function createMercedesExample(): DealInput {
  return {
    companyName: 'Mercedes',
    dealId: 'D001',
    industry: 'Automotive',
    productName: 'EV chassis / springs',
    materialType: 'Spring Steel',
    annualSteelVolumeTonnes: 31200,
    conventionalSteelPricePerTonne: 720,
    greenPremiumPerTonne: 180,
    baselineCo2Intensity: 1.921,
    greenSteelCo2Intensity: 0.339,
    productUnits: 120000,
    proofItemsAvailable: 3,
    proofItemsRequired: 4,
    proofStatus: ['PCF available', 'Certification pending'],
    certificationStatus: 'Pending',
    supplyReliability: 'Medium',
    deliveryTimeline: 'Within 6 months',
    technicalQualificationStatus: 'In qualification',
    regulatoryDeadline: '2027-01-01',
    salespersonNotes:
      'Long-standing OEM relationship. Sustainability team driving low-carbon sourcing targets.',
    carbonPrice: { ...DEFAULT_CARBON_PRICE },
  }
}
