'use client'

import { TrendingUp, Leaf, ShieldCheck, FileCheck2, Euro } from 'lucide-react'
import type { BusinessValueOutput, DealInput } from '@/lib/types'
import {
  fmtCurrency,
  fmtCurrencyPrecise,
  fmtInt,
  fmtPercent,
  fmtDecimal,
} from '@/lib/value-calculator'
import { ProvenanceBadge } from './provenance-badge'

function ValueCard({
  icon: Icon,
  label,
  value,
  sub,
  provenance,
  emphasis,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  provenance: 'Verified' | 'Assumed' | 'Missing' | 'Calculated'
  emphasis?: boolean
}) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-4 ${
        emphasis
          ? 'border-[var(--brand-green)]/40 bg-[var(--brand-green-soft)]'
          : 'border-border bg-surface'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--brand-green)]/12 text-[var(--brand-green-dark)]">
          <Icon className="size-4" aria-hidden />
        </span>
        <ProvenanceBadge label={provenance} />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </span>
      {sub ? (
        <span className="mt-1 text-xs text-muted-foreground">{sub}</span>
      ) : null}
    </div>
  )
}

export function BusinessValuePanel({
  deal,
  output,
}: {
  deal: DealInput
  output: BusinessValueOutput
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ValueCard
          icon={TrendingUp}
          label="Total annual green premium"
          value={fmtCurrency(output.totalPremium)}
          sub={`${fmtCurrency(deal.greenPremiumPerTonne)} / t on ${fmtInt(
            deal.annualSteelVolumeTonnes,
          )} t`}
          provenance="Calculated"
          emphasis
        />
        <ValueCard
          icon={Euro}
          label="Premium per product unit"
          value={fmtCurrencyPrecise(output.premiumPerProduct)}
          sub={`${fmtInt(deal.productUnits)} units / yr`}
          provenance="Calculated"
        />
        <ValueCard
          icon={TrendingUp}
          label="Premium vs. conventional"
          value={fmtPercent(output.premiumPercentage, 1)}
          sub={`Green ${fmtCurrency(
            output.greenSteelPricePerTonne,
          )} / t vs ${fmtCurrency(deal.conventionalSteelPricePerTonne)} / t`}
          provenance="Calculated"
        />
        <ValueCard
          icon={Leaf}
          label="CO2 avoided (modelled)"
          value={`${fmtInt(output.co2Saved)} t`}
          sub={`Δ ${fmtDecimal(
            deal.baselineCo2Intensity - deal.greenSteelCo2Intensity,
            2,
          )} t CO2 / t steel`}
          provenance="Calculated"
        />
        <ValueCard
          icon={Euro}
          label="Indicative carbon value"
          value={fmtCurrency(output.indicativeCarbonValue)}
          sub={`At ${fmtCurrency(deal.carbonPrice.value)} / t — ${
            deal.carbonPrice.source || 'assumption'
          }`}
          provenance="Assumed"
        />
        <ValueCard
          icon={FileCheck2}
          label="Proof completeness"
          value={fmtPercent(output.proofScore, 0)}
          sub={`${deal.proofItemsAvailable} of ${deal.proofItemsRequired} proof items`}
          provenance={output.proofScore >= 1 ? 'Verified' : 'Missing'}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border bg-surface-subtle px-4 py-3 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="size-4" aria-hidden />
          Contract value
        </span>
        <span className="text-muted-foreground">
          Conventional:{' '}
          <span className="font-mono font-medium text-foreground">
            {fmtCurrency(output.conventionalContractValue)}
          </span>
        </span>
        <span className="text-muted-foreground">
          Green steel:{' '}
          <span className="font-mono font-medium text-foreground">
            {fmtCurrency(output.greenSteelContractValue)}
          </span>
        </span>
        <span className="text-muted-foreground">
          Supply risk:{' '}
          <span className="font-medium text-foreground">
            {output.supplyRisk}
          </span>
        </span>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        All figures are computed directly from supplied deal inputs and stated
        assumptions. Carbon value is illustrative (avoided emissions × carbon
        price) and is not a guaranteed saving.
      </p>
    </div>
  )
}
