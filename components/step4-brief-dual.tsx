'use client'

import React from 'react'
import { AlertTriangle, Copy, Download, Loader2, RefreshCw, CheckCircle, XCircle, Eye, EyeOff, ChevronRight } from 'lucide-react'
import type { BusinessValueOutput, DealInput, PredictionResponse, Stakeholder } from '@/lib/types'
import type { BriefResult, BriefItem } from '@/lib/brief-schema'
import { fmtDecimal, fmtInt, fmtPercent, fmtCurrency } from '@/lib/value-calculator'

type BriefViewMode = 'internal' | 'customer'

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
  items: BriefItem[] | undefined
  variant?: 'check' | 'cross' | 'bullet' | 'numbered'
}) {
  if (!items) return null
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

/* ===== INTERNAL SALES TEAM VIEW ===== */
function InternalBriefView({
  deal,
  output,
  prediction,
  brief,
  loading,
  activeStakeholder,
  onSelectStakeholder,
  onRegenerate,
}: {
  deal: DealInput
  output: BusinessValueOutput | null
  prediction: PredictionResponse | null
  brief: BriefResult | null
  loading: boolean
  activeStakeholder: Stakeholder
  onSelectStakeholder: (s: Stakeholder) => void
  onRegenerate: (s: Stakeholder) => void
}) {
  const b = brief?.brief ?? null

  const activePred = prediction?.predictions.find((p) => p.stakeholder === activeStakeholder)
  const readinessScore = activePred
    ? (() => {
        const vals = Object.values(activePred.probabilities)
        return vals.reduce((a, v) => a + v, 0) / vals.length
      })()
    : 0

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">Sales Strategy Brief (Internal)</h1>
        <p className="text-sm text-muted-foreground">Objections, counter-arguments, and deal tactics for your sales team</p>
      </div>

      <div className="flex items-center justify-between border-b border-border bg-white px-6 py-2.5">
        <div className="flex items-center gap-8">
          <div>
            <p className="text-xs text-muted-foreground">Company</p>
            <p className="text-sm font-medium text-foreground">{deal.companyName || '—'}</p>
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
        <div className="flex items-center gap-1">
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
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading && !b ? (
          <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Composing strategy brief…
          </div>
        ) : b ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <MiniSection title="🎯 Primary Objection">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--risk-high)]" aria-hidden />
                  <p className="text-xs font-semibold text-foreground">{b.primaryObjection}</p>
                </div>
                {b?.whyLikely && b.whyLikely.length > 0 && (
                  <>
                    <p className="mb-1.5 text-xs text-muted-foreground font-medium">Why likely:</p>
                    <ItemList items={b.whyLikely} variant="bullet" />
                  </>
                )}
              </MiniSection>

              <MiniSection title="💬 Conversation Flow">
                <ItemList items={b?.conversationStrategy} variant="numbered" />
              </MiniSection>

              <MiniSection title="✅ Evidence to Bring">
                <ItemList items={b?.evidenceToBring} variant="check" />
              </MiniSection>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MiniSection title="💡 Emphasize These Claims">
                <ItemList items={b?.claimsToEmphasize} variant="check" />
              </MiniSection>

              <MiniSection title="⚠️ Avoid These Claims">
                <ItemList items={b?.claimsToAvoid} variant="cross" />
              </MiniSection>

              <MiniSection title="🎯 Next Best Action">
                <ItemList items={b?.nextBestAction} variant="numbered" />
              </MiniSection>
            </div>

            <MiniSection title="📊 Deal Context">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Volume:</span>
                  <span className="font-medium text-foreground">{fmtInt(deal.annualVolume)} tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Green Premium:</span>
                  <span className="font-medium text-foreground">{fmtPercent(output?.premiumPercentage ?? 0, 0)} ({fmtCurrency(deal.greenPremiumPerTonne)} /t)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Premium:</span>
                  <span className="font-medium text-foreground">{fmtCurrency(output?.totalPremium ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CO₂ Reduction:</span>
                  <span className="font-medium text-foreground">{fmtInt(output?.co2Saved ?? 0)} tonnes/year</span>
                </div>
              </div>
            </MiniSection>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ===== CUSTOMER/CLIENT VIEW ===== */
function CustomerBriefView({
  deal,
  output,
  brief,
  loading,
}: {
  deal: DealInput
  output: BusinessValueOutput | null
  brief: BriefResult | null
  loading: boolean
}) {
  const b = brief?.brief ?? null

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border bg-gradient-to-r from-[var(--brand-green)]/10 to-transparent px-6 py-6">
        <h1 className="text-2xl font-bold text-foreground">Why Green Steel Benefits You</h1>
        <p className="mt-1 text-sm text-muted-foreground">A customized summary of value, impact, and next steps</p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading && !b ? (
          <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Preparing customer brief…
          </div>
        ) : b ? (
          <div className="max-w-3xl space-y-6">
            {/* Header with company info */}
            <div className="border-l-4 border-[var(--brand-green)] bg-[var(--brand-green)]/5 pl-4 py-3">
              <p className="text-sm font-semibold text-foreground">For: {deal.companyName || 'Our Customer'}</p>
              <p className="text-xs text-muted-foreground mt-1">Green steel opportunity for {deal.productName || 'your operation'}</p>
            </div>

            {/* The Value Proposition */}
            <div className="rounded-xl border border-border bg-white p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="text-2xl">💰</span> Financial & Environmental Impact
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="rounded-lg bg-[var(--brand-green)]/10 p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--brand-green)]">{fmtInt(output?.co2Saved ?? 0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Tonnes CO₂ Saved/Year</p>
                </div>
                <div className="rounded-lg bg-[var(--brand-green)]/10 p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--brand-green)]">{fmtPercent(output?.premiumPercentage ?? 0, 0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Green Steel Premium</p>
                </div>
                <div className="rounded-lg bg-[var(--brand-green)]/10 p-4 text-center">
                  <p className="text-lg font-bold text-[var(--brand-green)]">{fmtInt((deal.annualSteelVolumeTonnes ?? 0) / 1000)}K</p>
                  <p className="text-xs text-muted-foreground mt-1">Tonnes Annually</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By switching to Saarstahl green steel, you'll reduce your product's lifecycle carbon footprint while maintaining superior quality and reliability. This positions your brand as a leader in sustainable manufacturing.
              </p>
            </div>

            {/* Why Your Business Benefits */}
            <div className="rounded-xl border border-border bg-white p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span> Why Your Business Benefits
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-green)]" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Regulatory Compliance</p>
                    <p className="text-xs text-muted-foreground">Ahead of EU CBAM and carbon border regulations coming 2025+</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-green)]" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Customer Demand</p>
                    <p className="text-xs text-muted-foreground">OEMs and brands increasingly require low-carbon materials in their supply chains</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-green)]" />
                  <div>
                    <p className="text-sm font-medium text-foreground">ESG & Reporting</p>
                    <p className="text-xs text-muted-foreground">Reduces Scope 3 emissions and supports science-based sustainability targets</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-green)]" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Market Differentiation</p>
                    <p className="text-xs text-muted-foreground">Gain competitive advantage in sustainability-conscious markets</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Quality & Reliability */}
            <div className="rounded-xl border border-border bg-white p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="text-2xl">🏆</span> Quality & Reliability
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                Saarstahl green steel meets the same rigorous specifications and performance standards as conventional steel. You get:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-[var(--brand-green)]" aria-hidden />
                  <span className="text-foreground">Full ISCC+ certification and chain-of-custody traceability</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-[var(--brand-green)]" aria-hidden />
                  <span className="text-foreground">Identical mechanical and performance properties to conventional steel</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-[var(--brand-green)]" aria-hidden />
                  <span className="text-foreground">Reliable supply chain with 24+ month delivery commitment</span>
                </li>
              </ul>
            </div>

            {/* Next Steps */}
            <div className="rounded-xl border-2 border-[var(--brand-green)] bg-[var(--brand-green)]/5 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="text-2xl">→</span> Next Steps
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand-green)] text-xs font-bold text-white">1</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Schedule Technical Trial</p>
                    <p className="text-xs text-muted-foreground">Let's validate compatibility with your production line</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand-green)] text-xs font-bold text-white">2</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Review Supply & Pricing</p>
                    <p className="text-xs text-muted-foreground">Finalize volume commitments and delivery schedule</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand-green)] text-xs font-bold text-white">3</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Go-Live & Transition</p>
                    <p className="text-xs text-muted-foreground">Begin phased rollout with ongoing support</p>
                  </div>
                </div>
              </div>
              <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-green)] py-2 text-sm font-medium text-white hover:bg-[var(--brand-green)]/90 transition-colors">
                Request a Meeting <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ===== MAIN COMPONENT ===== */
export function Step4BriefDual({
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
  const [viewMode, setViewMode] = React.useState<BriefViewMode>('internal')

  return (
    <div className="flex h-full flex-col overflow-hidden print-area">
      {/* View Mode Selector */}
      <div className="border-b border-border bg-white px-6 py-3 flex items-center justify-between print-hide">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('internal')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              viewMode === 'internal'
                ? 'bg-[var(--steel-grey-dark)] text-white'
                : 'border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="size-4" aria-hidden />
            Internal Sales Brief
          </button>
          <button
            onClick={() => setViewMode('customer')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              viewMode === 'customer'
                ? 'bg-[var(--brand-green)] text-white'
                : 'border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <EyeOff className="size-4" aria-hidden />
            Customer Presentation
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(brief?.brief ? JSON.stringify(brief.brief, null, 2) : '')}
            disabled={!brief}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors disabled:opacity-50"
          >
            <Copy className="size-3.5" aria-hidden />
            Copy
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!brief}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors disabled:opacity-50"
          >
            <Download className="size-3.5" aria-hidden />
            Export PDF
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {error ? (
          <div className="p-6 text-sm text-[var(--risk-high)]">{error}</div>
        ) : viewMode === 'internal' ? (
          <InternalBriefView
            deal={deal}
            output={output}
            prediction={prediction}
            brief={brief}
            loading={loading}
            activeStakeholder={activeStakeholder}
            onSelectStakeholder={onSelectStakeholder}
            onRegenerate={onRegenerate}
          />
        ) : (
          <CustomerBriefView
            deal={deal}
            output={output}
            brief={brief}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
