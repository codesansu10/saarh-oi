'use client'

import { AlertTriangle, Copy, Download, Loader2, RefreshCw, CheckCircle, XCircle, ArrowRight, Plus } from 'lucide-react'
import type { BusinessValueOutput, DealInput, PredictionResponse, Stakeholder } from '@/lib/types'
import type { BriefResult, BriefItem } from '@/lib/brief-schema'
import { fmtDecimal, fmtInt, fmtPercent } from '@/lib/value-calculator'

function MiniSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-3.5">
      <p className="mb-2 text-xs font-semibold text-foreground">{title}</p>
      {children}
    </div>
  )
}

function ItemList({
  items,
  variant = 'check',
}: {
  items: BriefItem[]
  variant?: 'check' | 'cross' | 'bullet' | 'numbered'
}) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-foreground">
          {variant === 'check' && (
            <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-[var(--brand-green)]" aria-hidden />
          )}
          {variant === 'cross' && (
            <XCircle className="mt-0.5 size-3.5 shrink-0 text-[var(--risk-high)]" aria-hidden />
          )}
          {variant === 'numbered' && (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-white">
              {i + 1}
            </span>
          )}
          {variant === 'bullet' && (
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
          )}
          <span className="leading-relaxed">{item.text}</span>
        </li>
      ))}
    </ul>
  )
}

function ReadinessChip({ stakeholder, score }: { stakeholder: Stakeholder; score: number }) {
  const pct = Math.round(score * 100)
  const risk = score >= 0.6 ? 'High' : score >= 0.35 ? 'Medium' : 'Low'
  const cls =
    risk === 'High'
      ? 'bg-[var(--risk-high-soft)] text-[var(--risk-high)] border-[var(--risk-high)]/30'
      : risk === 'Medium'
      ? 'bg-[var(--risk-medium-soft)] text-[var(--risk-medium)] border-[var(--risk-medium)]/30'
      : 'bg-[var(--risk-low-soft)] text-[var(--risk-low)] border-[var(--risk-low)]/30'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {stakeholder}: {risk} ({pct}%)
    </span>
  )
}

export function Step4Brief({
  deal,
  output,
  prediction,
  brief,
  loading,
  error,
  activeStakeholder,
  onSelectStakeholder,
  onRegenerate,
  onSave,
}: {
  deal: DealInput
  output: BusinessValueOutput | null
  prediction: PredictionResponse | null
  brief: BriefResult | null
  loading: boolean
  error: string | null
  activeStakeholder: Stakeholder
  onSelectStakeholder: (s: Stakeholder) => void
  onRegenerate: (s: Stakeholder) => void
  onSave: () => void
}) {
  const b = brief?.brief ?? null

  // Readiness score for active stakeholder
  const activePred = prediction?.predictions.find((p) => p.stakeholder === activeStakeholder)
  const readinessScore = activePred
    ? (() => {
        const vals = Object.values(activePred.probabilities)
        return vals.reduce((a, v) => a + v, 0) / vals.length
      })()
    : 0

  const handlePrint = () => window.print()

  return (
    <div className="flex h-full flex-col overflow-hidden print-area">
      {/* Page header */}
      <div className="flex items-start justify-between border-b border-border bg-white px-6 py-4 print-hide">
        <div>
          <h1 className="text-lg font-semibold text-foreground">AI Sales Preparation Brief</h1>
          <p className="text-sm text-muted-foreground">Personalized talking points and next steps for your conversation.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(b ? JSON.stringify(b, null, 2) : '')}
            disabled={!b}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors disabled:opacity-50"
          >
            <Copy className="size-3.5" aria-hidden />
            Copy Brief
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={!b}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors disabled:opacity-50"
          >
            <Download className="size-3.5" aria-hidden />
            Export PDF
          </button>
        </div>
      </div>

      {/* Deal + stakeholder strip */}
      <div className="flex items-center justify-between border-b border-border bg-white px-6 py-2.5">
        <div className="flex items-center gap-8">
          <div>
            <p className="text-xs text-muted-foreground">Company</p>
            <p className="text-sm font-medium text-foreground">{deal.companyName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Deal ID</p>
            <p className="text-sm font-medium text-foreground">{deal.dealId || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stakeholder</p>
            <p className="text-sm font-medium text-foreground">{activeStakeholder}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Readiness</p>
            <ReadinessChip stakeholder={activeStakeholder} score={readinessScore} />
          </div>
        </div>
        {/* Stakeholder tabs */}
        <div className="flex items-center gap-1 print-hide">
          {prediction?.predictions.map((p) => (
            <button
              key={p.stakeholder}
              type="button"
              onClick={() => {
                onSelectStakeholder(p.stakeholder)
                onRegenerate(p.stakeholder)
              }}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                activeStakeholder === p.stakeholder
                  ? 'border-foreground bg-foreground text-white'
                  : 'border-border bg-white text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.stakeholder}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onRegenerate(activeStakeholder)}
            disabled={loading}
            className="ml-2 flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-3 animate-spin" aria-hidden /> : <RefreshCw className="size-3" aria-hidden />}
            Regenerate
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading && !b ? (
          <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Composing evidence-based brief…
          </div>
        ) : error ? (
          <p className="text-sm text-[var(--risk-high)]">{error}</p>
        ) : b ? (
          <div className="space-y-3">
            {/* Row 1: Primary Objection + Why + Conversation Flow + Evidence */}
            <div className="grid grid-cols-3 gap-3">
              {/* Primary Objection */}
              <MiniSection title="">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--risk-high)]" aria-hidden />
                  <p className="text-xs font-semibold text-foreground">Primary Objection</p>
                </div>
                <p className="text-sm font-semibold text-foreground mb-2">&quot;{b.primaryObjection}&quot;</p>
                {b.whyLikely.length > 0 && (
                  <>
                    <p className="mb-1.5 text-xs text-muted-foreground font-medium">Why this objection is likely</p>
                    <ItemList items={b.whyLikely} variant="bullet" />
                  </>
                )}
              </MiniSection>

              {/* Recommended Conversation Flow */}
              <MiniSection title="Recommended Conversation Flow">
                <ItemList items={b.conversationStrategy} variant="numbered" />
              </MiniSection>

              {/* Evidence to Bring */}
              <MiniSection title="Evidence to Bring">
                <ItemList items={b.evidenceToBring} variant="check" />
              </MiniSection>
            </div>

            {/* Row 2: Claims to Emphasize + Claims to Avoid + Next Best Action */}
            <div className="grid grid-cols-3 gap-3">
              {/* Claims to Emphasize (from recommended opening / conversation) */}
              <MiniSection title="Claims to Emphasize">
                <ItemList
                  items={b.conversationStrategy.slice(0, 4).map((item) => ({
                    ...item,
                    text: item.text,
                  }))}
                  variant="check"
                />
              </MiniSection>

              {/* Claims to Avoid */}
              <MiniSection title="Claims to Avoid">
                <ItemList items={b.claimsToAvoid} variant="cross" />
              </MiniSection>

              {/* Next Best Action */}
              <MiniSection title="Next Best Action">
                <div className="flex items-start gap-2 mb-3">
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
                  <p className="text-xs leading-relaxed text-foreground">{b.recommendedNextStep}</p>
                </div>
                <button
                  type="button"
                  onClick={onSave}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-[var(--surface-subtle)] py-2 text-xs font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors"
                >
                  <Plus className="size-3.5" aria-hidden />
                  Add to Action Plan
                </button>
              </MiniSection>
            </div>

            {/* Recommended opening */}
            <div className="rounded-xl border border-[var(--brand-green)]/25 bg-[var(--brand-green-soft)] px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--brand-green-dark)]">Recommended Opening</p>
              <p className="text-sm italic leading-relaxed text-foreground">&quot;{b.recommendedOpening}&quot;</p>
            </div>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            Brief will generate automatically once predictions are ready.
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="border-t border-border bg-white px-6 py-3 print-hide">
        <p className="text-center text-xs text-muted-foreground">
          This brief is AI-generated based on model predictions and available deal data. Use your judgment in every customer conversation.
        </p>
      </div>
    </div>
  )
}
