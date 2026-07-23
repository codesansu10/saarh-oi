'use client'

import React, { useState } from 'react'
import { AlertTriangle, Copy, Download, Loader2, RefreshCw, CheckCircle, XCircle, Eye, EyeOff, ChevronRight, ShoppingCart, Leaf, Building2, Zap, BarChart3, FileText, ArrowLeft } from 'lucide-react'
import type { BusinessValueOutput, DealInput, PredictionResponse, Stakeholder } from '@/lib/types'
import type { BriefResult, BriefItem } from '@/lib/brief-schema'
import { fmtDecimal, fmtInt, fmtPercent, fmtCurrency } from '@/lib/value-calculator'

type BriefViewMode = 'overview' | 'internal' | 'customer'

const STAKEHOLDER_ICONS: Record<Stakeholder, React.ElementType> = {
  Procurement: ShoppingCart,
  Sustainability: Leaf,
  Management: Building2,
  'Product Owner': Zap,
}

const STAKEHOLDER_COLORS: Record<Stakeholder, { bg: string; border: string; text: string }> = {
  Procurement: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
  Sustainability: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
  Management: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
  'Product Owner': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900' },
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

function RiskBadge({ score }: { score: number }) {
  const risk = score >= 0.6 ? 'High' : score >= 0.35 ? 'Medium' : 'Low'
  const colors =
    risk === 'High'
      ? 'bg-[var(--risk-high-soft)] text-[var(--risk-high)]'
      : risk === 'Medium'
      ? 'bg-[var(--risk-medium-soft)] text-[var(--risk-medium)]'
      : 'bg-[var(--risk-low-soft)] text-[var(--risk-low)]'
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors}`}>
      {risk}
    </span>
  )
}

/* ===== ALL STAKEHOLDERS OVERVIEW ===== */
function AllStakeholdersOverview({
  deal,
  prediction,
  onSelectStakeholder,
}: {
  deal: DealInput
  prediction: PredictionResponse | null
  onSelectStakeholder: (s: Stakeholder, mode: 'internal' | 'customer') => void
}) {
  const stakeholders: Stakeholder[] = ['Procurement', 'Sustainability', 'C-Management', 'Compliance', 'Product Owner']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold text-foreground">Sales Brief - Executive Summary</h1>
        <p className="mt-1 text-sm text-muted-foreground">Quick overview across all stakeholders</p>
      </div>

      {/* Deal Summary */}
      <div className="grid grid-cols-5 gap-4">
        <div className="rounded-lg border border-border bg-white p-3">
          <p className="text-xs font-semibold text-muted-foreground">Company</p>
          <p className="mt-1 text-sm font-bold text-foreground">{deal.companyName}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-3">
          <p className="text-xs font-semibold text-muted-foreground">Product</p>
          <p className="mt-1 text-sm font-bold text-foreground">{deal.productName}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-3">
          <p className="text-xs font-semibold text-muted-foreground">Volume (Annual)</p>
          <p className="mt-1 text-sm font-bold text-foreground">{fmtInt((deal.annualSteelVolumeTonnes ?? 0) / 1000)}K t</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-3">
          <p className="text-xs font-semibold text-muted-foreground">Premium</p>
          <p className="mt-1 text-sm font-bold text-foreground">{fmtPercent((deal.premiumPercentage ?? 0) / 100)}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-3">
          <p className="text-xs font-semibold text-muted-foreground">Date</p>
          <p className="mt-1 text-sm font-bold text-foreground">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stakeholder Overview Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Stakeholder Readiness Matrix</h2>
        <div className="grid gap-4">
          {stakeholders.map((sh) => {
            const pred = prediction?.predictions.find((p) => p.stakeholder === sh)
            const readiness = pred
              ? (() => {
                  const vals = Object.values(pred.probabilities)
                  return vals.reduce((a, b) => a + b, 0) / vals.length
                })()
              : 0
            const Icon = STAKEHOLDER_ICONS[sh]
            const colors = STAKEHOLDER_COLORS[sh]

            return (
              <div key={sh} className={`rounded-lg border ${colors.border} ${colors.bg} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`size-5 ${colors.text}`} />
                    <div>
                      <p className={`font-semibold ${colors.text}`}>{sh}</p>
                      <p className="text-xs text-muted-foreground">
                        {pred ? `${Object.keys(pred.probabilities).length} barriers identified` : 'No data'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${colors.text}`}>
                        {Math.round(readiness * 100)}%
                      </p>
                      <RiskBadge score={readiness} />
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-border pt-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Choose how to view the brief:</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onSelectStakeholder('Procurement', 'internal')}
              className="rounded-lg border-2 border-blue-500 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900 hover:bg-blue-100"
            >
              <FileText className="mb-1 inline size-4" /> Internal Sales Brief
            </button>
            <button
              onClick={() => onSelectStakeholder('Procurement', 'customer')}
              className="rounded-lg border-2 border-[var(--brand-green)] bg-[var(--brand-green)]/10 px-4 py-3 text-sm font-semibold text-[var(--brand-green)] hover:bg-[var(--brand-green)]/20"
            >
              <BarChart3 className="mb-1 inline size-4" /> Customer Presentation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===== INTERNAL SALES VIEW ===== */
function InternalBriefView({
  deal,
  prediction,
  brief,
  activeStakeholder,
  onSelectStakeholder,
  onBack,
}: {
  deal: DealInput
  prediction: PredictionResponse | null
  brief: BriefResult | null
  activeStakeholder: Stakeholder
  onSelectStakeholder: (s: Stakeholder) => void
  onBack: () => void
}) {
  const b = brief?.brief ?? null
  const activePred = prediction?.predictions.find((p) => p.stakeholder === activeStakeholder)
  const readinessScore = activePred
    ? (() => {
        const vals = Object.values(activePred.probabilities)
        return vals.reduce((a, b) => a + b, 0) / vals.length
      })()
    : 0

  const Icon = STAKEHOLDER_ICONS[activeStakeholder]
  const colors = STAKEHOLDER_COLORS[activeStakeholder]
  const stakeholders: Stakeholder[] = ['Procurement', 'Sustainability', 'C-Management', 'Compliance', 'Product Owner']

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-border bg-surface-subtle px-6 py-0">
        <button
            key={sh}
            onClick={() => onSelectStakeholder(sh)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              sh === activeStakeholder
                ? 'bg-blue-100 text-blue-900'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {React.createElement(STAKEHOLDER_ICONS[sh], { className: 'size-4' })}
            {sh}
          </button>
        ))}
      </div>

      {/* Active Stakeholder Content */}
      <div className={`rounded-lg border ${colors.border} ${colors.bg} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`size-6 ${colors.text}`} />
            <div>
              <p className={`text-lg font-bold ${colors.text}`}>{activeStakeholder}</p>
              <p className="text-xs text-muted-foreground">Readiness Score</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${colors.text}`}>{Math.round(readinessScore * 100)}%</p>
            <RiskBadge score={readinessScore} />
          </div>
        </div>
      </div>

      {/* Brief Content */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-white p-4">
          <h3 className="font-semibold text-foreground mb-3">Primary Objections</h3>
          <ItemList items={b?.primaryObjections} variant="numbered" />
        </div>

        <div className="rounded-lg border border-border bg-white p-4">
          <h3 className="font-semibold text-foreground mb-3">Counter-Arguments</h3>
          <ItemList items={b?.counterArguments} variant="check" />
        </div>

        <div className="rounded-lg border border-border bg-white p-4">
          <h3 className="font-semibold text-foreground mb-3">Claims to Emphasize</h3>
          <ItemList items={b?.claimsToEmphasize} variant="check" />
        </div>

        <div className="rounded-lg border border-border bg-white p-4">
          <h3 className="font-semibold text-foreground mb-3">Claims to Avoid</h3>
          <ItemList items={b?.claimsToAvoid} variant="cross" />
        </div>

        <div className="rounded-lg border border-border bg-white p-4">
          <h3 className="font-semibold text-foreground mb-3">Conversation Strategy</h3>
          <ItemList items={b?.conversationStrategy} variant="numbered" />
        </div>

        <div className="rounded-lg border border-border bg-white p-4">
          <h3 className="font-semibold text-foreground mb-3">Evidence to Bring</h3>
          <ItemList items={b?.evidenceToBring} variant="check" />
        </div>
      </div>
    </div>
  )
}

/* ===== CUSTOMER PRESENTATION VIEW ===== */
function CustomerPresentationView({
  deal,
  output,
  prediction,
  brief,
  activeStakeholder,
  onSelectStakeholder,
  onBack,
}: {
  deal: DealInput
  output: BusinessValueOutput | null
  prediction: PredictionResponse | null
  brief: BriefResult | null
  activeStakeholder: Stakeholder
  onSelectStakeholder: (s: Stakeholder) => void
  onBack: () => void
}) {
  const b = brief?.brief ?? null
  const Icon = STAKEHOLDER_ICONS[activeStakeholder]
  const colors = STAKEHOLDER_COLORS[activeStakeholder]
  const stakeholders: Stakeholder[] = ['Procurement', 'Sustainability', 'Management', 'Compliance', 'Product Owner']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <button onClick={onBack} className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--brand-green)] hover:text-[var(--brand-green)]/80">
            <ArrowLeft className="size-4" /> Back to Overview
          </button>
          <h1 className="text-2xl font-bold text-foreground">Your Value with Green Steel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Transparent value. Measurable impact. Reliable delivery.</p>
        </div>
      </div>

      {/* Stakeholder Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {stakeholders.map((sh) => (
          <button
            key={sh}
            onClick={() => onSelectStakeholder(sh)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              sh === activeStakeholder
                ? 'bg-[var(--brand-green)]/20 text-[var(--brand-green)]'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {React.createElement(STAKEHOLDER_ICONS[sh], { className: 'size-4' })}
            {sh}
          </button>
        ))}
      </div>

      {/* Business Value Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-white p-4">
          <p className="text-xs font-semibold text-muted-foreground">Total Annual Premium</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{fmtCurrency(output?.totalAnnualPremium ?? 0)}</p>
          <p className="mt-1 text-xs text-muted-foreground">+{fmtPercent(deal.premiumPercentage)} vs. conventional</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4">
          <p className="text-xs font-semibold text-muted-foreground">CO₂ Saved Per Year</p>
          <p className="mt-2 text-2xl font-bold text-[var(--brand-green)]">{fmtInt((output?.annualCO2Saved ?? 0) / 1000)}K t</p>
          <p className="mt-1 text-xs text-muted-foreground">-{fmtPercent(output?.emissionReduction ?? 0)} vs. baseline</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4">
          <p className="text-xs font-semibold text-muted-foreground">5-Year Cost Impact</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{fmtPercent(output?.fiveYearCostImpact ?? 0)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Including long-term benefits</p>
        </div>
      </div>

      {/* Why This Matters */}
      <div className="rounded-lg border border-border bg-white p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Why This Matters for {activeStakeholder}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <ShoppingCart className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Cost Transparency</p>
              <p className="text-xs text-muted-foreground">Full visibility on total cost of ownership and pricing stability</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
              <Leaf className="size-4 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Measurable Impact</p>
              <p className="text-xs text-muted-foreground">Significant CO₂ reduction supporting sustainability goals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="rounded-lg border border-border bg-white p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Next Steps</h2>
        <ItemList items={b?.nextBestAction} variant="numbered" />
        <button className="mt-4 w-full rounded-lg bg-[var(--brand-green)] px-4 py-2 font-semibold text-white hover:bg-[var(--brand-green)]/90">
          Schedule Discussion
        </button>
      </div>
    </div>
  )
}

/* ===== MAIN COMPONENT ===== */
export function Step4BriefRedesigned({
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
  const [viewMode, setViewMode] = useState<BriefViewMode>('overview')

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Sales Brief</h2>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/80"
          >
            <Copy className="size-4" /> Copy Brief
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-2 rounded-lg bg-[var(--brand-green)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--brand-green)]/90"
          >
            <Download className="size-4" /> Export PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-[var(--risk-high)]/30 bg-[var(--risk-high-soft)] p-3 text-sm text-[var(--risk-high)]">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-muted-foreground" size={24} />
        </div>
      )}

      {!loading && viewMode === 'overview' && (
        <AllStakeholdersOverview
          deal={deal}
          prediction={prediction}
          onSelectStakeholder={(sh, mode) => {
            onSelectStakeholder(sh)
            setViewMode(mode)
          }}
        />
      )}

      {!loading && viewMode === 'internal' && (
        <InternalBriefView
          deal={deal}
          prediction={prediction}
          brief={brief}
          activeStakeholder={activeStakeholder}
          onSelectStakeholder={onSelectStakeholder}
          onBack={() => setViewMode('overview')}
        />
      )}

      {!loading && viewMode === 'customer' && (
        <CustomerPresentationView
          deal={deal}
          output={output}
          prediction={prediction}
          brief={brief}
          activeStakeholder={activeStakeholder}
          onSelectStakeholder={onSelectStakeholder}
          onBack={() => setViewMode('overview')}
        />
      )}
    </div>
  )
}
