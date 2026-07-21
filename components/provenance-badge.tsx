import type { BriefItemProvenance } from '@/lib/brief-schema'

export type ProvenanceLabel = BriefItemProvenance

const STYLES: Record<ProvenanceLabel, string> = {
  Verified:
    'border-[var(--brand-green)]/30 bg-[var(--brand-green-soft)] text-[var(--brand-green-dark)]',
  Calculated: 'border-[var(--steel-grey)]/40 bg-[var(--steel-grey-soft)] text-[var(--steel-grey-dark)]',
  Assumed: 'border-[var(--risk-medium)]/30 bg-[var(--risk-medium-soft)] text-[var(--risk-medium)]',
  Missing: 'border-[var(--risk-high)]/30 bg-[var(--risk-high-soft)] text-[var(--risk-high)]',
  'AI-generated': 'border-[#7c6bc4]/30 bg-[#efecfa] text-[#5b4ba8]',
}

const TITLES: Record<ProvenanceLabel, string> = {
  Verified: 'Supplied by calculator input or uploaded evidence.',
  Calculated: 'Produced by deterministic formulas.',
  Assumed: 'Scenario assumption.',
  Missing: 'Required but not supplied.',
  'AI-generated': 'Suggested wording, not a factual claim.',
}

export function ProvenanceBadge({ label }: { label: ProvenanceLabel }) {
  return (
    <span
      className={`status-badge ${STYLES[label]}`}
      title={TITLES[label]}
    >
      {label}
    </span>
  )
}
