import type {
  BusinessValueOutput,
  DealInput,
  Stakeholder,
  StakeholderPrediction,
} from './types'

export type BriefItemProvenance =
  | 'Verified'
  | 'Assumed'
  | 'Missing'
  | 'AI-generated'
  | 'Calculated'

export interface BriefItem {
  text: string
  provenance: BriefItemProvenance
}

export interface SalesBrief {
  stakeholder: Stakeholder
  primaryObjection: string
  whyLikely: BriefItem[]
  conversationStrategy: BriefItem[]
  evidenceToBring: BriefItem[]
  claimsToAvoid: BriefItem[]
  followUpQuestions: BriefItem[]
  missingInformation: BriefItem[]
  recommendedOpening: string
  recommendedNextStep: string
}

export type BriefMode = 'llm' | 'template'

export interface BriefResult {
  mode: BriefMode
  brief: SalesBrief
}

export interface BriefRequest {
  deal: DealInput
  calculatorOutput: BusinessValueOutput
  prediction: StakeholderPrediction
  stakeholder: Stakeholder
}
