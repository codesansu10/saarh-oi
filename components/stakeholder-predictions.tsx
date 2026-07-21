'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import type {
  ObjectionLabel,
  PredictionResponse,
  Stakeholder,
  StakeholderPrediction,
} from '@/lib/types'
import { OBJECTION_LABELS, OBJECTION_TITLES } from '@/lib/types'
import { fmtPercent } from '@/lib/value-calculator'
import { riskBadgeClasses } from '@/lib/risk-level'

function ObjectionRow({
  label,
  probability,
  risk,
}: {
  label: ObjectionLabel
  probability: number
  risk: 'Low' | 'Medium' | 'High'
}) {
  const pct = Math.round(probability * 100)
  const barColor =
    risk === 'High'
      ? 'var(--risk-high)'
      : risk === 'Medium'
        ? 'var(--risk-medium)'
        : 'var(--risk-low)'
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-40 shrink-0 text-sm text-foreground">
        {OBJECTION_TITLES[label]}
      </div>
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="w-12 shrink-0 text-right font-mono text-sm tabular-nums text-foreground">
        {fmtPercent(probability, 0)}
      </div>
      <span
        className={`w-16 shrink-0 rounded-md border px-2 py-0.5 text-center text-xs font-medium ${riskBadgeClasses(
          risk,
        )}`}
      >
        {risk}
      </span>
    </div>
  )
}

function StakeholderTab({
  prediction,
}: {
  prediction: StakeholderPrediction
}) {
  const ordered = [...OBJECTION_LABELS].sort(
    (a, b) => prediction.probabilities[b] - prediction.probabilities[a],
  )
  const top = ordered[0]
  return (
    <div>
      <div className="mb-3 flex items-start gap-2 rounded-lg border border-[var(--risk-high)]/25 bg-[var(--risk-high)]/8 px-3 py-2">
        <AlertTriangle
          className="mt-0.5 size-4 shrink-0 text-[var(--risk-high)]"
          aria-hidden
        />
        <p className="text-sm text-foreground">
          Highest predicted objection:{' '}
          <span className="font-semibold">{OBJECTION_TITLES[top]}</span> (
          {fmtPercent(prediction.probabilities[top], 0)},{' '}
          {prediction.riskLevels[top]} risk)
        </p>
      </div>
      <div className="divide-y divide-border/60">
        {ordered.map((label) => (
          <ObjectionRow
            key={label}
            label={label}
            probability={prediction.probabilities[label]}
            risk={prediction.riskLevels[label]}
          />
        ))}
      </div>
    </div>
  )
}

export function StakeholderPredictions({
  prediction,
  activeStakeholder,
  onSelectStakeholder,
}: {
  prediction: PredictionResponse
  activeStakeholder: Stakeholder
  onSelectStakeholder: (s: Stakeholder) => void
}) {
  const [internalActive, setInternalActive] = useState<Stakeholder>(
    activeStakeholder,
  )
  const active = activeStakeholder ?? internalActive

  const current =
    prediction.predictions.find((p) => p.stakeholder === active) ??
    prediction.predictions[0]

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Stakeholders"
        className="flex flex-wrap gap-1 rounded-lg bg-muted p-1"
      >
        {prediction.predictions.map((p) => {
          const isActive = p.stakeholder === active
          return (
            <button
              key={p.stakeholder}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setInternalActive(p.stakeholder)
                onSelectStakeholder(p.stakeholder)
              }}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.stakeholder}
            </button>
          )
        })}
      </div>

      {current ? <StakeholderTab prediction={current} /> : null}
    </div>
  )
}
