'use client'

import React from 'react'
import { BookOpen, ArrowRight, Edit } from 'lucide-react'
import {
  INDUSTRIES,
  MATERIAL_TYPES,
  CERTIFICATION_STATUSES,
  SUPPLY_RELIABILITY,
  type DealInput,
  type BusinessValueOutput,
} from '@/lib/types'
import type { ValidationErrors } from '@/lib/validation'
import { fmtCurrency, fmtInt, fmtPercent, fmtDecimal } from '@/lib/value-calculator'

const inputCls =
  'w-full rounded-md border border-border bg-white px-2 py-1.5 text-xs text-foreground outline-none focus:border-[var(--brand-green)] focus:ring-1 focus:ring-[var(--brand-green)]/30 transition-colors'

const selectCls =
  'w-full rounded-md border border-border bg-white px-2 py-1.5 text-xs text-foreground outline-none focus:border-[var(--brand-green)] focus:ring-1 focus:ring-[var(--brand-green)]/30 transition-colors appearance-none cursor-pointer'

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-[var(--steel-grey-dark)] mb-0.5">
      {children}
    </label>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{children}</p>
}

type NumericField =
  | 'annualSteelVolumeTonnes'
  | 'conventionalSteelPricePerTonne'
  | 'greenPremiumPerTonne'
  | 'baselineCo2Intensity'
  | 'greenSteelCo2Intensity'
  | 'productUnits'
  | 'proofItemsAvailable'
  | 'proofItemsRequired'
  | 'carbonPrice'
  | 'premiumPercentage'

export function SteelLens({
  deal,
  onChange,
  errors,
  onCalculate,
  output,
  valid,
  onNext,
}: {
  deal: DealInput
  onChange: (patch: Partial<DealInput>) => void
  errors: ValidationErrors
  onCalculate: () => void
  output: BusinessValueOutput | null
  valid: boolean
  onNext: () => void
}) {
  const num = (field: NumericField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    onChange({ [field]: v === '' ? 0 : Number(v) } as Partial<DealInput>)
  }

  const greenPremiumTotal = deal.annualSteelVolumeTonnes * deal.greenPremiumPerTonne

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">SteelLens</h1>
          <p className="text-xs text-muted-foreground">Calculate and analyze green steel business value in real-time</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:border-[var(--brand-green)]/50 transition-colors"
        >
          <BookOpen className="size-3.5" aria-hidden />
          Saved Deals
        </button>
      </div>

      {/* Main content - Compact Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-4 gap-3 p-4">
          {/* Left Column: Customer & Deal Information */}
          <div className="space-y-2">
            <SectionLabel>Customer & Deal</SectionLabel>
            
            <div>
              <Label htmlFor="company">Company</Label>
              <input
                id="company"
                type="text"
                value={deal.companyName}
                onChange={(e) => onChange({ companyName: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <select
                id="industry"
                value={deal.industry}
                onChange={(e) => onChange({ industry: e.target.value })}
                className={selectCls}
              >
                <option value="">Select...</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="materialType">Material Type</Label>
              <select
                id="materialType"
                value={deal.materialType}
                onChange={(e) => onChange({ materialType: e.target.value })}
                className={selectCls}
              >
                <option value="">Select...</option>
                {MATERIAL_TYPES.map((mt) => (
                  <option key={mt} value={mt}>
                    {mt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="product">Product / Application</Label>
              <input
                id="product"
                type="text"
                value={deal.productDescription}
                onChange={(e) => onChange({ productDescription: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <Label htmlFor="dealId">Deal ID (Optional)</Label>
              <input
                id="dealId"
                type="text"
                value={deal.dealId}
                onChange={(e) => onChange({ dealId: e.target.value })}
                className={inputCls}
              />
            </div>

            <SectionLabel>Proof & Supply</SectionLabel>

            <div>
              <Label htmlFor="pcfAvailable">PCF Available</Label>
              <select
                id="pcfAvailable"
                value={deal.pcfAvailable ? 'true' : 'false'}
                onChange={(e) => onChange({ pcfAvailable: e.target.value === 'true' })}
                className={selectCls}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <Label htmlFor="certification">Certification</Label>
              <select
                id="certification"
                value={deal.certificationStatus}
                onChange={(e) => onChange({ certificationStatus: e.target.value })}
                className={selectCls}
              >
                <option value="">Select...</option>
                {CERTIFICATION_STATUSES.map((cs) => (
                  <option key={cs} value={cs}>
                    {cs}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="supplyReliability">Supply Reliability</Label>
              <select
                id="supplyReliability"
                value={deal.supplyReliability}
                onChange={(e) => onChange({ supplyReliability: e.target.value })}
                className={selectCls}
              >
                <option value="">Select...</option>
                {SUPPLY_RELIABILITY.map((sr) => (
                  <option key={sr} value={sr}>
                    {sr}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="itemsAvailable">Items Available</Label>
                <input
                  id="itemsAvailable"
                  type="number"
                  value={deal.proofItemsAvailable}
                  onChange={num('proofItemsAvailable')}
                  className={inputCls}
                />
              </div>
              <div>
                <Label htmlFor="itemsRequired">Items Required</Label>
                <input
                  id="itemsRequired"
                  type="number"
                  value={deal.proofItemsRequired}
                  onChange={num('proofItemsRequired')}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Salesperson Notes</Label>
              <textarea
                id="notes"
                value={deal.notes}
                onChange={(e) => onChange({ notes: e.target.value })}
                className={`${inputCls} h-16 resize-none`}
              />
            </div>
          </div>

          {/* Middle Columns: Deal Inputs */}
          <div className="col-span-2 space-y-2">
            <SectionLabel>Deal Inputs</SectionLabel>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="volume">Annual Steel Volume</Label>
                <input
                  id="volume"
                  type="number"
                  value={deal.annualSteelVolumeTonnes}
                  onChange={num('annualSteelVolumeTonnes')}
                  className={inputCls}
                />
                <p className="text-xs text-muted-foreground mt-0.5">Tonnes</p>
              </div>

              <div>
                <Label htmlFor="conventionalPrice">Conventional Price</Label>
                <input
                  id="conventionalPrice"
                  type="number"
                  value={deal.conventionalSteelPricePerTonne}
                  onChange={num('conventionalSteelPricePerTonne')}
                  className={inputCls}
                />
                <p className="text-xs text-muted-foreground mt-0.5">€/t</p>
              </div>

              <div>
                <Label htmlFor="greenPremium">Green Premium</Label>
                <input
                  id="greenPremium"
                  type="number"
                  value={deal.greenPremiumPerTonne}
                  onChange={num('greenPremiumPerTonne')}
                  className={inputCls}
                />
                <p className="text-xs text-muted-foreground mt-0.5">€/t</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="baselineCo2">Baseline CO₂</Label>
                <input
                  id="baselineCo2"
                  type="number"
                  value={deal.baselineCo2Intensity}
                  onChange={num('baselineCo2Intensity')}
                  step="0.01"
                  className={inputCls}
                />
                <p className="text-xs text-muted-foreground mt-0.5">tCO₂/t</p>
              </div>

              <div>
                <Label htmlFor="greenCo2">Green Steel CO₂</Label>
                <input
                  id="greenCo2"
                  type="number"
                  value={deal.greenSteelCo2Intensity}
                  onChange={num('greenSteelCo2Intensity')}
                  step="0.01"
                  className={inputCls}
                />
                <p className="text-xs text-muted-foreground mt-0.5">tCO₂/t</p>
              </div>

              <div>
                <Label htmlFor="productUnits">Product Units/y</Label>
                <input
                  id="productUnits"
                  type="number"
                  value={deal.productUnits}
                  onChange={num('productUnits')}
                  className={inputCls}
                />
                <p className="text-xs text-muted-foreground mt-0.5">Units</p>
              </div>
            </div>

            <SectionLabel>Carbon Price Assumption</SectionLabel>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="carbonPrice">Carbon Price</Label>
                <input
                  id="carbonPrice"
                  type="number"
                  value={deal.carbonPrice}
                  onChange={num('carbonPrice')}
                  className={inputCls}
                />
                <p className="text-xs text-muted-foreground mt-0.5">€/t</p>
              </div>

              <div>
                <Label htmlFor="carbonAssumption">Source / Assumption</Label>
                <input
                  id="carbonAssumption"
                  type="text"
                  value={deal.carbonAssumption}
                  onChange={(e) => onChange({ carbonAssumption: e.target.value })}
                  className={inputCls}
                  placeholder="e.g., EU ETS assumption"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Financial Summary & Results */}
          <div className="space-y-2">
            <SectionLabel>Financial Summary</SectionLabel>

            {output && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Product Price Impact</p>
                  <p className="text-sm font-bold text-green-700 font-mono">
                    {fmtPercent(output.priceImpactPercent)}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Material-Level Premium</p>
                  <p className="text-sm font-bold text-blue-700 font-mono">
                    {fmtCurrency(greenPremiumTotal)}
                  </p>
                </div>

                <div className="border-t pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Conventional Contract</p>
                  <p className="text-sm font-mono font-bold text-foreground">
                    {fmtCurrency(output.conventionalContractValue)}
                  </p>
                </div>

                <div className="border-t pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Green Steel Contract</p>
                  <p className="text-sm font-mono font-bold text-green-700">
                    {fmtCurrency(output.greenSteelContractValue)}
                  </p>
                </div>

                <div className="border-t pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Indicative Carbon Value</p>
                  <p className="text-sm font-mono font-bold text-foreground">
                    {fmtCurrency(output.indicativeCarbonValue)}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                  <p className="text-xs text-muted-foreground">CO₂ Reduction</p>
                  <p className="text-sm font-bold text-green-700 font-mono">
                    {fmtInt(output.co2Saved)} t/year
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {fmtPercent(output.co2ReductionPercent)} vs baseline
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Action Buttons */}
      <div className="border-t border-border bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCalculate}
            disabled={!valid}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--brand-green)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-green-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Calculate
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>

        {output && (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--brand-green)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-green)] hover:bg-[var(--brand-green)]/5 transition-colors"
          >
            View Business Impact
            <ArrowRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}
