'use client'

import { Info, ArrowRight, ShoppingCart, Leaf, Building2, Shield, RefreshCw, Loader2 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { BusinessValueOutput, DealInput, ObjectionLabel, PredictionResponse, Stakeholder, StakeholderPrediction } from '@/lib/types'
import { OBJECTION_LABELS, OBJECTION_TITLES } from '@/lib/types'
import { fmtInt, fmtPercent, fmtDecimal, fmtCurrency } from '@/lib/value-calculator'
import { riskBadgeClasses } from '@/lib/risk-level'

const STAKEHOLDER_ICONS: Record<Stakeholder, React.ElementType> = {
  Procurement: ShoppingCart,
  Sustainability: Leaf,
  Management: Building2,
  Compliance: Shield,
}

const EVIDENCE_MAP: Record<Stakeholder, string[]> = {
  Procurement: [
    'Cost impact per vehicle',
    'Total cost of ownership comparison',
    'Supply reliability details',
    'PCF and certification documents',
  ],
  Sustainability: [
    'CO₂ reduction calculation',
    'Scope 3 reporting coverage',
    'Certification status (ISCC+)',
    'Science-based targets alignment',
  ],
  Management: [
    'Financial business case summary',
    'Risk & supply reliability overview',
    'Competitor benchmarking',
    'Regulatory deadline map',
  ],
  Compliance: [
    'CBAM exposure calculation',
    'ISCC+ certification chain',
    'Audit trail documentation',
    'Regulatory timeline overview',
  ],
}

function ReadinessDonut({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const risk = score >= 0.6 ? 'High' : score >= 0.35 ? 'Medium' : 'Low'
  const color = risk === 'High' ? 'var(--risk-high)' : risk === 'Medium' ? 'var(--risk-medium)' : 'var(--risk-low)'
  const ringColor = risk === 'High' ? '#b5473f' : risk === 'Medium' ? '#b7791f' : '#4f8a35'

  const data = [
    { value: pct },
    { value: 100 - pct },
  ]

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={68}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={ringColor} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-bold tabular-nums" style={{ color }}>
            {pct}%
          </span>
        </div>
      </div>
      <p className="mt-1 text-sm font-semibold" style={{ color }}>{risk}</p>
      <p className="text-xs text-muted-foreground">
        {risk === 'High' ? 'High objection risk' : risk === 'Medium' ? 'Some concerns likely' : 'Low objection risk'}
      </p>
    </div>
  )
}

function ObjectionBar({
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
    risk === 'High' ? '#b5473f' : risk === 'Medium' ? '#b7791f' : '#4f8a35'

  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="w-32 shrink-0 text-xs text-foreground">{OBJECTION_TITLES[label]}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-subtle)]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-foreground">{pct}%</span>
    </div>
  )
}

export function Step3Stakeholder({
  deal,
  output,
  prediction,
  loading,
  activeStakeholder,
  onSelectStakeholder,
  onRerun,
  onNext,
}: {
  deal: DealInput
  output: BusinessValueOutput
  prediction: PredictionResponse | null
  loading: boolean
  activeStakeholder: Stakeholder
  onSelectStakeholder: (s: Stakeholder) => void
  onRerun: () => void
  onNext: () => void
}) {
  const current: StakeholderPrediction | null =
    prediction?.predictions.find((p) => p.stakeholder === activeStakeholder) ?? null

  // Compute overall readiness score = mean of top-3 objection probabilities
  const readinessScore = current
    ? (() => {
        const sorted = [...OBJECTION_LABELS].sort(
          (a, b) => (current.probabilities[b] ?? 0) - (current.probabilities[a] ?? 0),
        )
        const top3 = sorted.slice(0, 3).map((l) => current.probabilities[l] ?? 0)
        return top3.reduce((a, b) => a + b, 0) / top3.length
      })()
    : 0

  const orderedObjections = current
    ? [...OBJECTION_LABELS].sort(
        (a, b) => (current.probabilities[b] ?? 0) - (current.probabilities[a] ?? 0),
      )
    : []

  const stakeholders: Stakeholder[] = ['Procurement', 'Sustainability', 'Management', 'Compliance']

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header */}
      <div className="flex items-start justify-between border-b border-border bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Stakeholder Readiness Analysis</h1>
          <p className="text-sm text-muted-foreground">Select a stakeholder to see their likely concerns and readiness for this deal.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRerun}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <RefreshCw className="size-3.5" aria-hidden />}
            {loading ? 'Running…' : 'Re-run Model'}
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors"
          >
            <Info className="size-3.5" aria-hidden />
            About the Model
          </button>
        </div>
      </div>

      {/* Deal context strip */}
      <div className="grid grid-cols-6 gap-px border-b border-border bg-border">
        {[
          { label: 'Company', value: deal.companyName || '—' },
          { label: 'Deal ID', value: deal.dealId || '—' },
          { label: 'Product', value: deal.productName || '—' },
          { label: 'CO₂ Saved', value: output ? `${fmtInt(output.co2Saved)} t` : '—' },
          { label: 'Premium / Product', value: output ? `€${fmtDecimal(output.premiumPerProduct, 0)}` : '—' },
          { label: 'Proof Score', value: output ? `${Math.round(output.proofScore * 100)}%` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white px-3 py-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-sm font-medium text-foreground truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: stakeholder selector */}
        <div className="w-44 shrink-0 border-r border-border bg-white px-2 py-3">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Select Stakeholder</p>
          {stakeholders.map((s) => {
            const Icon = STAKEHOLDER_ICONS[s]
            const isActive = s === activeStakeholder
            return (
              <button
                key={s}
                type="button"
                onClick={() => onSelectStakeholder(s)}
                disabled={!prediction}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 ${
                  isActive
                    ? 'bg-[var(--steel-grey-dark)] text-white'
                    : 'text-muted-foreground hover:bg-[var(--surface-subtle)] hover:text-foreground'
                }`}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {s}
              </button>
            )
          })}
        </div>

        {/* Right: main content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && !current ? (
            <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Scoring objections across stakeholders…
            </div>
          ) : current ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Donut + readiness */}
                <div className="rounded-xl border border-border bg-white p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {activeStakeholder} Perspective
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="shrink-0">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Stakeholder Readiness</p>
                      <ReadinessDonut score={readinessScore} />
                    </div>
                    <div className="flex-1">
                      <p className="mb-2 text-xs font-semibold text-foreground">Top Objection Risks</p>
                      <div className="space-y-0.5">
                        {orderedObjections.slice(0, 5).map((label) => (
                          <ObjectionBar
                            key={label}
                            label={label}
                            probability={current.probabilities[label]}
                            risk={current.riskLevels[label]}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence to bring */}
                <div className="rounded-xl border border-border bg-white p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Recommended Evidence to Bring
                  </p>
                  <ul className="space-y-2">
                    {EVIDENCE_MAP[activeStakeholder].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-green)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Why this matters */}
              <div className="rounded-xl border border-border bg-white p-4">
                <p className="mb-2 text-xs font-semibold text-foreground">Why this matters</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {activeStakeholder === 'Procurement'
                    ? `The premium is a significant factor for Procurement. They focus on total cost of ownership and reliable supply.`
                    : activeStakeholder === 'Sustainability'
                    ? `Sustainability stakeholders need quantified CO₂ reduction data and credible certification to meet Scope 3 commitments.`
                    : activeStakeholder === 'Management'
                    ? `Management will weigh strategic risk against competitive pressure. Focus on long-term value and risk mitigation.`
                    : `Compliance teams need documented evidence of certification and audit-ready chain-of-custody for regulatory requirements.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              Click &quot;Re-run Model&quot; to generate predictions.
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-border bg-white px-6 py-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!prediction}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--steel-grey-dark)] disabled:opacity-50"
        >
          Generate Sales Brief
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
