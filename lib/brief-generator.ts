import type { BriefRequest, SalesBrief } from './brief-schema'
import { OBJECTION_TITLES, type ObjectionLabel } from './types'
import { fmtCurrency, fmtPercent, fmtInt, fmtDecimal } from './value-calculator'

function topObjection(req: BriefRequest): ObjectionLabel {
  const entries = Object.entries(req.prediction.probabilities) as [
    ObjectionLabel,
    number,
  ][]
  entries.sort((a, b) => b[1] - a[1])
  return entries[0][0]
}

function certLabel(status: string): string {
  return status === 'Certified' ? 'certified' : status.toLowerCase()
}

/**
 * Deterministic template-based sales brief.
 *
 * Uses ONLY supplied deal facts and calculated / model outputs. It never
 * invents customer facts, guarantees, or compliance. This powers the
 * template-fallback mode so the "Generate Sales Brief" button works in every
 * environment (no LLM key required).
 */
export function generateTemplateBrief(req: BriefRequest): SalesBrief {
  const { deal, calculatorOutput: out, prediction, stakeholder } = req
  const primary = topObjection(req)
  const primaryProb = prediction.probabilities[primary]
  const risks = prediction.riskLevels

  const proofComplete = out.proofScore >= 1
  const certPending = deal.certificationStatus !== 'Certified'

  const whyLikely: SalesBrief['whyLikely'] = []
  whyLikely.push({
    text: `${OBJECTION_TITLES[primary]} scores the highest modelled probability (${fmtPercent(
      primaryProb,
      0,
    )}) for ${stakeholder}.`,
    provenance: 'Calculated',
  })
  whyLikely.push({
    text: `Green premium is ${fmtPercent(
      out.premiumPercentage,
      0,
    )} (${fmtCurrency(deal.greenPremiumPerTonne)} / t over ${fmtCurrency(
      deal.conventionalSteelPricePerTonne,
    )} / t).`,
    provenance: 'Calculated',
  })
  whyLikely.push({
    text: `Proof score is ${fmtDecimal(out.proofScore, 2)} (${
      deal.proofItemsAvailable
    } of ${deal.proofItemsRequired} proof items available).`,
    provenance: 'Calculated',
  })
  whyLikely.push({
    text: `Supply reliability is recorded as ${deal.supplyReliability}; certification is ${certLabel(
      deal.certificationStatus,
    )}.`,
    provenance: 'Verified',
  })

  const conversationStrategy: SalesBrief['conversationStrategy'] = [
    {
      text: `Lead with the value framing most relevant to ${stakeholder}, then address ${OBJECTION_TITLES[
        primary
      ].toLowerCase()} directly with evidence.`,
      provenance: 'AI-generated',
    },
    {
      text: `Quantify the offer: ${fmtCurrency(
        out.totalPremium,
      )} total annual premium, ${fmtCurrency(
        out.premiumPerProduct,
      )} per product unit.`,
      provenance: 'Calculated',
    },
    {
      text: `Frame emissions as modelled: approx. ${fmtInt(
        out.co2Saved,
      )} t CO2 avoided vs. baseline (illustrative carbon value ${fmtCurrency(
        out.indicativeCarbonValue,
      )}).`,
      provenance: 'Calculated',
    },
  ]

  const evidenceToBring: SalesBrief['evidenceToBring'] = []
  if (deal.proofStatus.length) {
    evidenceToBring.push({
      text: `Available proof: ${deal.proofStatus.join(', ')}.`,
      provenance: 'Verified',
    })
  }
  if (risks.proof_certification_objection !== 'Low' || risks.greenwashing_objection !== 'Low') {
    evidenceToBring.push({
      text: 'Product carbon footprint (PCF) methodology and system boundary documentation.',
      provenance: proofComplete ? 'Verified' : 'Missing',
    })
    evidenceToBring.push({
      text: 'Third-party verification / chain-of-custody records where available.',
      provenance: 'Assumed',
    })
  }
  if (risks.price_objection !== 'Low') {
    evidenceToBring.push({
      text: 'Total cost of ownership comparison including indicative carbon-cost exposure.',
      provenance: 'Calculated',
    })
  }
  if (risks.technical_quality_objection !== 'Low') {
    evidenceToBring.push({
      text: `Technical qualification status (${deal.technicalQualificationStatus}) and material datasheets.`,
      provenance: 'Verified',
    })
  }

  const claimsToAvoid: SalesBrief['claimsToAvoid'] = [
    { text: 'Do not claim guaranteed ROI or guaranteed willingness to pay.', provenance: 'AI-generated' },
    { text: 'Do not claim legal compliance on the customer\u2019s behalf.', provenance: 'AI-generated' },
  ]
  if (certPending) {
    claimsToAvoid.push({
      text: 'Do not describe pending certification as complete or present an unissued certificate.',
      provenance: 'AI-generated',
    })
  }
  claimsToAvoid.push({
    text: 'Do not present the synthetic-data prediction as validated customer behaviour.',
    provenance: 'AI-generated',
  })

  const followUpQuestions: SalesBrief['followUpQuestions'] = [
    { text: 'Which reporting standard and system boundary must the PCF align with?', provenance: 'AI-generated' },
    { text: 'What internal approval thresholds apply to the premium at this volume?', provenance: 'AI-generated' },
    { text: 'What delivery and volume commitments are required to qualify the material?', provenance: 'AI-generated' },
  ]

  const missingInformation: SalesBrief['missingInformation'] = []
  if (!proofComplete) {
    missingInformation.push({
      text: `${
        deal.proofItemsRequired - deal.proofItemsAvailable
      } proof item(s) still required to reach a complete proof pack.`,
      provenance: 'Missing',
    })
  }
  if (certPending) {
    missingInformation.push({
      text: 'Final certification outcome and issue date.',
      provenance: 'Missing',
    })
  }
  if (!deal.regulatoryDeadline) {
    missingInformation.push({
      text: 'Customer regulatory deadline driving urgency.',
      provenance: 'Missing',
    })
  }
  if (missingInformation.length === 0) {
    missingInformation.push({
      text: 'No critical information gaps detected from supplied inputs.',
      provenance: 'Assumed',
    })
  }

  const recommendedOpening = `Thanks for the time. For ${
    deal.companyName
  }\u2019s ${deal.productName}, I\u2019d like to walk ${stakeholder} through the value case and how we de-risk ${OBJECTION_TITLES[
    primary
  ].toLowerCase()} with the evidence we have today.`

  const recommendedNextStep = proofComplete
    ? 'Agree a technical validation session and confirm contract volumes.'
    : `Share the available proof pack and jointly define the remaining ${
        deal.proofItemsRequired - deal.proofItemsAvailable
      } proof item(s) before commercial sign-off.`

  return {
    stakeholder,
    primaryObjection: OBJECTION_TITLES[primary],
    whyLikely,
    conversationStrategy,
    evidenceToBring,
    claimsToAvoid,
    followUpQuestions,
    missingInformation,
    recommendedOpening,
    recommendedNextStep,
  }
}
