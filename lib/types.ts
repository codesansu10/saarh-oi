// ============================================================
// Core domain types for the Saarstahl Green-Steel Sales Pipeline
// ============================================================

export type Stakeholder =
  | 'Procurement'
  | 'Sustainability'
  | 'Management'
  | 'Compliance'

export const STAKEHOLDERS: Stakeholder[] = [
  'Procurement',
  'Sustainability',
  'Management',
  'Compliance',
]

export type Industry =
  | 'Automotive'
  | 'Renewable Energy'
  | 'Infrastructure'
  | 'Machinery'
  | 'Construction'

export const INDUSTRIES: Industry[] = [
  'Automotive',
  'Renewable Energy',
  'Infrastructure',
  'Machinery',
  'Construction',
]

export type MaterialType =
  | 'Wire Rod'
  | 'Bar Steel'
  | 'Spring Steel'
  | 'Engineering Steel'
  | 'Forged Components'

export const MATERIAL_TYPES: MaterialType[] = [
  'Wire Rod',
  'Bar Steel',
  'Spring Steel',
  'Engineering Steel',
  'Forged Components',
]

export type SupplyReliability = 'Low' | 'Medium' | 'High'
export const SUPPLY_RELIABILITY: SupplyReliability[] = ['Low', 'Medium', 'High']

export type CertificationStatus =
  | 'Certified'
  | 'Pending'
  | 'Not started'
  | 'In audit'

export const CERTIFICATION_STATUSES: CertificationStatus[] = [
  'Certified',
  'Pending',
  'Not started',
  'In audit',
]

export type TechnicalQualificationStatus =
  | 'Qualified'
  | 'In qualification'
  | 'Not qualified'

export const TECHNICAL_QUALIFICATION_STATUSES: TechnicalQualificationStatus[] = [
  'Qualified',
  'In qualification',
  'Not qualified',
]

export type DeliveryTimeline =
  | 'Immediate'
  | 'Within 3 months'
  | 'Within 6 months'
  | 'Within 12 months'
  | 'Beyond 12 months'

export const DELIVERY_TIMELINES: DeliveryTimeline[] = [
  'Immediate',
  'Within 3 months',
  'Within 6 months',
  'Within 12 months',
  'Beyond 12 months',
]

// Proof items are represented as a multi-select checklist.
export type ProofItem =
  | 'PCF available'
  | 'Certification available'
  | 'Certification pending'
  | 'Third-party verification available'
  | 'Chain-of-custody available'
  | 'Customer-reporting format available'

export const PROOF_ITEMS: ProofItem[] = [
  'PCF available',
  'Certification available',
  'Certification pending',
  'Third-party verification available',
  'Chain-of-custody available',
  'Customer-reporting format available',
]

export interface CarbonPrice {
  value: number
  currency: string
  effectiveDate: string
  source: string
}

export interface DealInput {
  companyName: string
  dealId: string
  industry: Industry
  productName: string
  materialType: MaterialType
  annualSteelVolumeTonnes: number
  conventionalSteelPricePerTonne: number
  greenPremiumPerTonne: number
  baselineCo2Intensity: number
  greenSteelCo2Intensity: number
  productUnits: number
  proofItemsAvailable: number
  proofItemsRequired: number
  proofStatus: ProofItem[]
  certificationStatus: CertificationStatus
  supplyReliability: SupplyReliability
  deliveryTimeline: DeliveryTimeline
  technicalQualificationStatus: TechnicalQualificationStatus
  regulatoryDeadline: string
  salespersonNotes: string
  carbonPrice: CarbonPrice
}

export type Provenance = 'Verified' | 'Assumed' | 'Missing' | 'Calculated'

export interface BusinessValueOutput {
  totalPremium: number
  premiumPerProduct: number
  premiumPercentage: number
  co2Saved: number
  proofScore: number
  supplyRisk: SupplyReliability
  conventionalContractValue: number
  greenSteelContractValue: number
  greenSteelPricePerTonne: number
  indicativeCarbonValue: number
}

// ============================================================
// Objection labels + prediction contract
// ============================================================

export type ObjectionLabel =
  | 'price_objection'
  | 'proof_certification_objection'
  | 'greenwashing_objection'
  | 'supply_reliability_objection'
  | 'internal_approval_objection'
  | 'technical_quality_objection'
  | 'low_urgency_objection'

export const OBJECTION_LABELS: ObjectionLabel[] = [
  'price_objection',
  'proof_certification_objection',
  'greenwashing_objection',
  'supply_reliability_objection',
  'internal_approval_objection',
  'technical_quality_objection',
  'low_urgency_objection',
]

export const OBJECTION_TITLES: Record<ObjectionLabel, string> = {
  price_objection: 'Price / Premium',
  proof_certification_objection: 'Proof & Certification',
  greenwashing_objection: 'Greenwashing Risk',
  supply_reliability_objection: 'Supply Reliability',
  internal_approval_objection: 'Internal Approval',
  technical_quality_objection: 'Technical Quality',
  low_urgency_objection: 'Low Urgency',
}

export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface StakeholderPrediction {
  stakeholder: Stakeholder
  probabilities: Record<ObjectionLabel, number>
  riskLevels: Record<ObjectionLabel, RiskLevel>
}

export type DataMode = 'synthetic'
export type PredictionSource = 'model-api' | 'fallback'

export interface PredictionResponse {
  modelVersion: string
  dataMode: DataMode
  source: PredictionSource
  predictions: StakeholderPrediction[]
}
