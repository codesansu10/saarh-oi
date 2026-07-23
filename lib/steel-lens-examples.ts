import type { DealInput } from './types'

export type ExampleName = 'Mercedes' | 'BMW' | 'Volkswagen'

export const STEEL_LENS_EXAMPLES: Record<ExampleName, DealInput> = {
  // Strong, nearly-ready deal — mid volume, high premium, pending certification
  Mercedes: {
    companyName: 'Mercedes-Benz',
    dealId: 'D-MB-001',
    industry: 'Automotive',
    productName: 'EV chassis springs',
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
    carbonPrice: {
      value: 85,
      currency: 'EUR',
      effectiveDate: '2026-01-01',
      source: 'EU ETS Market Q4 2024',
    },
  },
  // Premium, fully certified, low-risk, smaller volume, immediate delivery
  BMW: {
    companyName: 'BMW Group',
    dealId: 'D-BMW-002',
    industry: 'Automotive',
    productName: 'Performance drivetrain bars',
    materialType: 'Bar Steel',
    annualSteelVolumeTonnes: 18500,
    conventionalSteelPricePerTonne: 760,
    greenPremiumPerTonne: 145,
    baselineCo2Intensity: 2.05,
    greenSteelCo2Intensity: 0.42,
    productUnits: 74000,
    proofItemsAvailable: 4,
    proofItemsRequired: 4,
    proofStatus: [
      'PCF available',
      'Certification available',
      'Third-party verification available',
      'Chain-of-custody available',
    ],
    certificationStatus: 'Certified',
    supplyReliability: 'High',
    deliveryTimeline: 'Immediate',
    technicalQualificationStatus: 'Qualified',
    regulatoryDeadline: '2026-06-30',
    salespersonNotes:
      'Premium performance line. Certification and chain-of-custody fully in place; fast close expected.',
    carbonPrice: {
      value: 95,
      currency: 'EUR',
      effectiveDate: '2026-01-01',
      source: 'EU ETS Market Q4 2024',
    },
  },
  // High-volume, price-sensitive, weak proof, high-risk, not qualified
  Volkswagen: {
    companyName: 'Volkswagen',
    dealId: 'D-VW-003',
    industry: 'Automotive',
    productName: 'Mass-market engineering steel',
    materialType: 'Engineering Steel',
    annualSteelVolumeTonnes: 54000,
    conventionalSteelPricePerTonne: 690,
    greenPremiumPerTonne: 210,
    baselineCo2Intensity: 1.88,
    greenSteelCo2Intensity: 0.55,
    productUnits: 260000,
    proofItemsAvailable: 1,
    proofItemsRequired: 5,
    proofStatus: ['PCF available'],
    certificationStatus: 'Not started',
    supplyReliability: 'Low',
    deliveryTimeline: 'Within 12 months',
    technicalQualificationStatus: 'Not qualified',
    regulatoryDeadline: '2028-01-01',
    salespersonNotes:
      'Very large volume opportunity but price-sensitive. Proof and certification not yet started; supply risk high.',
    carbonPrice: {
      value: 70,
      currency: 'EUR',
      effectiveDate: '2026-01-01',
      source: 'EU ETS Market Q4 2024',
    },
  },
}

export const EXAMPLE_NAMES: ExampleName[] = ['Mercedes', 'BMW', 'Volkswagen']
