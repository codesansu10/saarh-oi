'use client'

import { Leaf, Euro, TrendingUp, ShieldCheck, Truck, Download, ArrowRight, Edit } from 'lucide-react'
import type { DealInput, BusinessValueOutput } from '@/lib/types'
import { fmtCurrency, fmtInt, fmtPercent, fmtDecimal } from '@/lib/value-calculator'

function StatCard({
  icon: Icon,
  iconColor,
  bg,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  iconColor: string
  bg: string
  label: string
  value: string
  sub: string
}) {
  return (
    <div className={`flex flex-col rounded-2xl border p-5 ${bg}`}>
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl`} style={{ background: iconColor + '18' }}>
        <Icon className="size-5" style={{ color: iconColor }} aria-hidden />
      </div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

function MetricRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold tabular-nums font-mono ${accent ? 'text-[var(--brand-green-dark)]' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  )
}

export function Step2Dashboard({
  deal,
  output,
  onEditInputs,
  onNext,
}: {
  deal: DealInput
  output: BusinessValueOutput | null
  onEditInputs: () => void
  onNext: () => void
}) {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
        <div>
          <h1 className="text-base font-semibold text-foreground">Business Impact Dashboard</h1>
          <p className="text-xs text-muted-foreground">Overview of the quantified impact of switching to green steel.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEditInputs}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors"
          >
            <Edit className="size-3.5" aria-hidden />
            Edit Inputs
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors"
          >
            <Download className="size-3.5" aria-hidden />
            Export
          </button>
        </div>
      </div>

      {!output ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-6">
          <p className="text-sm font-medium text-foreground">No deal data yet</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Go to Business Calculator, fill in the deal details, and come back here to see the impact.
          </p>
          <button
            type="button"
            onClick={onEditInputs}
            className="mt-2 flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors"
          >
            <Edit className="size-3.5" aria-hidden />
            Go to Calculator
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Deal context strip */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border border-border bg-[var(--surface-subtle)] px-4 py-2.5 text-xs">
            <span className="text-muted-foreground">Company: <strong className="text-foreground">{deal.companyName || '—'}</strong></span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">Deal: <strong className="text-foreground">{deal.dealId || '—'}</strong></span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">Product: <strong className="text-foreground">{deal.productName || '—'}</strong></span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">Industry: <strong className="text-foreground">{deal.industry}</strong></span>
            <span className="ml-auto text-muted-foreground">Calculated {today}</span>
          </div>

          {/* Primary stat cards — CO₂ is hero */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={Leaf}
              iconColor="var(--brand-green)"
              bg="border-[var(--brand-green)]/20 bg-[var(--brand-green-soft)]"
              label="CO₂ Saved"
              value={fmtInt(output.co2Saved)}
              sub="t CO₂ per year"
            />
            <StatCard
              icon={Euro}
              iconColor="var(--steel-grey-dark)"
              bg="border-border bg-white"
              label="Premium per Product"
              value={`€${fmtDecimal(output.premiumPerProduct, 0)}`}
              sub="per vehicle"
            />
            <StatCard
              icon={TrendingUp}
              iconColor="var(--steel-grey-dark)"
              bg="border-border bg-white"
              label="Total Annual Premium"
              value={output.totalPremium >= 1_000_000
                ? `€${fmtDecimal(output.totalPremium / 1_000_000, 1)}M`
                : fmtCurrency(output.totalPremium)}
              sub="per year"
            />
          </div>

          {/* Secondary metrics + readiness — two columns */}
          <div className="grid grid-cols-2 gap-5">

            {/* Financial metrics */}
            <div className="rounded-2xl border border-border bg-white px-5 py-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Financial</p>
              <MetricRow label="Product Price Impact" value={`+${fmtDecimal(output.premiumPercentage * 100, 2)}%`} />
              <MetricRow label="Material-Level Premium" value={fmtPercent(output.premiumPercentage, 0)} />
              <MetricRow label="Conventional Contract" value={fmtCurrency(output.conventionalContractValue)} />
              <MetricRow label="Green Steel Contract" value={fmtCurrency(output.greenSteelContractValue)} accent />
              <MetricRow label="Indicative Carbon Value" value={fmtCurrency(output.indicativeCarbonValue)} />
            </div>

            {/* Readiness */}
            <div className="rounded-2xl border border-border bg-white px-5 py-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Readiness</p>
              <MetricRow
                label="Proof Score"
                value={`${Math.round(output.proofScore * 100)}%  (${deal.proofItemsAvailable}/${deal.proofItemsRequired} items)`}
              />

              {/* Proof score bar */}
              <div className="mt-1 mb-3 h-1.5 w-full rounded-full bg-[var(--surface-subtle)]">
                <div
                  className="h-full rounded-full bg-[var(--brand-green)] transition-all"
                  style={{ width: `${Math.round(output.proofScore * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="text-sm text-muted-foreground">Supply Reliability</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  output.supplyRisk === 'High' ? 'bg-green-100 text-green-800'
                  : output.supplyRisk === 'Medium' ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
                }`}>
                  {output.supplyRisk}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-subtle)]">
                  <ShieldCheck className="size-4 text-muted-foreground" aria-hidden />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-subtle)]">
                  <Truck className="size-4 text-muted-foreground" aria-hidden />
                </div>
                <p className="text-xs text-muted-foreground">
                  {deal.certificationStatus} &middot; {deal.supplyReliability} supply
                </p>
              </div>
            </div>
          </div>

          {/* Business Summary */}
          <div className="rounded-2xl border border-border bg-white px-5 py-4">
            <p className="mb-2 text-sm font-semibold text-foreground">Business Summary</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Choosing green steel for this deal increases the final vehicle cost by only{' '}
              <strong className="text-foreground">€{fmtDecimal(output.premiumPerProduct, 0)}</strong> per vehicle (
              <strong className="text-foreground">{fmtPercent(output.premiumPercentage, 2)}</strong>)
              while reducing embedded emissions by{' '}
              <strong className="text-[var(--brand-green-dark)]">{fmtInt(output.co2Saved)} t CO₂</strong> per year.
              The total green premium of{' '}
              <strong className="text-foreground">
                {output.totalPremium >= 1_000_000
                  ? `€${fmtDecimal(output.totalPremium / 1_000_000, 1)}M`
                  : fmtCurrency(output.totalPremium)}
              </strong>{' '}
              represents a{' '}
              <strong className="text-foreground">{fmtPercent(output.premiumPercentage, 1)}</strong> uplift
              on the conventional contract, with an indicative carbon-value offset of{' '}
              <strong className="text-foreground">{fmtCurrency(output.indicativeCarbonValue)}</strong>.
            </p>
          </div>

        </div>
      )}

      {/* Footer CTA */}
      <div className="border-t border-border bg-white px-6 py-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!output}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--steel-grey-dark)] disabled:opacity-40"
        >
          View Stakeholder Analysis
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>

    </div>
  )
}
