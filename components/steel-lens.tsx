'use client'

import React, { useState } from 'react'
import { ChevronDown, AlertCircle, ArrowRight, Users, Copy } from 'lucide-react'
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
import { STEEL_LENS_EXAMPLES, EXAMPLE_NAMES, type ExampleName } from '@/lib/steel-lens-examples'

const inputCls =
  'w-full rounded-md border border-border bg-white px-2 py-1 text-xs text-foreground outline-none focus:border-[var(--brand-green)] focus:ring-1 focus:ring-[var(--brand-green)]/30 transition-colors'

const selectCls =
  'w-full rounded-md border border-border bg-white px-2 py-1 text-xs text-foreground outline-none focus:border-[var(--brand-green)] focus:ring-1 focus:ring-[var(--brand-green)]/30 transition-colors appearance-none cursor-pointer'

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-[var(--steel-grey-dark)] mb-0.5">
      {children}
    </label>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">{children}</p>
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
  onChange: (field: keyof DealInput, value: any) => void
  errors: ValidationErrors
  onCalculate: () => void
  output?: BusinessValueOutput
  valid: boolean
  onNext: () => void
}) {
  const [showExamples, setShowExamples] = useState(false)

  const handleNumericChange = (field: NumericField, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(field, val === '' ? '' : parseFloat(val))
  }

  const handleLoadExample = (exampleName: ExampleName) => {
    const example = STEEL_LENS_EXAMPLES[exampleName]
    // Apply every field of the example in a single patch so state updates reliably.
    Object.entries(example).forEach(([key, value]) => {
      onChange(key as keyof DealInput, value as any)
    })
    setShowExamples(false)
  }

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-auto">
      {/* Header */}
      <div className="border-b border-border px-6 py-3 bg-gradient-to-r from-[var(--brand-green-soft)] to-white sticky top-0 z-20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">SteelLens</h1>
            <p className="text-sm text-muted-foreground">Green steel business value calculator & impact dashboard</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-2 rounded-lg border border-[var(--brand-green)] bg-white px-3 py-2 text-sm font-medium text-[var(--brand-green)] hover:bg-[var(--brand-green-soft)] transition-colors"
            >
              <Copy className="size-4" />
              Load Example
              <ChevronDown className="size-4" />
            </button>
            {showExamples && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-white shadow-lg z-50">
                {EXAMPLE_NAMES.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleLoadExample(name)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--brand-green-soft)] transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <p className="font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{STEEL_LENS_EXAMPLES[name].companyName}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Compact Layout */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* SECTION 1: Business Impact Summary - AT TOP */}
        {output ? (
          <div className="mb-4 rounded-lg border border-border bg-gradient-to-b from-[var(--brand-green-soft)]/50 to-white p-3">
            <h2 className="text-sm font-bold text-foreground mb-2">Business Impact Summary</h2>

            {/* Financial Summary Grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <p className="text-xs text-muted-foreground mb-0.5">Premium %</p>
                <p className="text-sm font-bold text-blue-700">
                  {output.premiumPercentage !== undefined && !isNaN(output.premiumPercentage)
                    ? fmtPercent(output.premiumPercentage)
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <p className="text-xs text-muted-foreground mb-0.5">Premium/Product</p>
                <p className="text-sm font-bold text-green-700">
                  {output.premiumPerProduct !== undefined && !isNaN(output.premiumPerProduct)
                    ? fmtCurrency(output.premiumPerProduct)
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-amber-50 p-2 rounded-lg">
                <p className="text-xs text-muted-foreground mb-0.5">Conv. Contract</p>
                <p className="text-sm font-bold text-amber-700">
                  {output.conventionalContractValue !== undefined && !isNaN(output.conventionalContractValue)
                    ? fmtCurrency(output.conventionalContractValue)
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <p className="text-xs text-muted-foreground mb-0.5">Green Contract</p>
                <p className="text-sm font-bold text-[var(--brand-green-dark)]">
                  {output.greenSteelContractValue !== undefined && !isNaN(output.greenSteelContractValue)
                    ? fmtCurrency(output.greenSteelContractValue)
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Carbon & Value Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">CO₂ Saved</p>
                <p className="text-sm font-bold text-[var(--brand-green)]">
                  {output.co2Saved !== undefined && !isNaN(output.co2Saved) ? fmtInt(output.co2Saved) : 'N/A'}
                  <span className="text-xs font-normal"> t</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Green Price</p>
                <p className="text-sm font-bold text-[var(--brand-green)]">
                  {output.greenSteelPricePerTonne !== undefined && !isNaN(output.greenSteelPricePerTonne)
                    ? fmtCurrency(output.greenSteelPricePerTonne)
                    : 'N/A'}
                  <span className="text-xs font-normal">/t</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Carbon Value</p>
                <p className="text-sm font-bold text-purple-700">
                  {output.indicativeCarbonValue !== undefined && !isNaN(output.indicativeCarbonValue)
                    ? fmtCurrency(output.indicativeCarbonValue)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Deal Readiness</p>
                <p className="text-sm font-bold text-blue-700">
                  {output.dealReadiness !== undefined && !isNaN(output.dealReadiness) ? fmtPercent(output.dealReadiness) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* SECTION 2: Customer & Deal Information - BELOW */}
        <div className="mb-3">
          <SectionLabel>Customer & Deal Info</SectionLabel>
          <div className="grid grid-cols-3 gap-2 bg-white rounded-lg border border-border p-2.5">
            <div>
              <Label htmlFor="company">Company</Label>
              <input
                id="company"
                type="text"
                value={deal.companyName}
                onChange={(e) => onChange('companyName', e.target.value)}
                className={inputCls}
                placeholder="e.g., Mercedes-Benz"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <select
                id="industry"
                value={deal.industry}
                onChange={(e) => onChange('industry', e.target.value)}
                className={selectCls}
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="material">Material Type</Label>
              <select
                id="material"
                value={deal.materialType}
                onChange={(e) => onChange('materialType', e.target.value)}
                className={selectCls}
              >
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
                value={deal.productName}
                onChange={(e) => onChange('productName', e.target.value)}
                className={inputCls}
                placeholder="e.g., EV Chassis"
              />
            </div>
            <div>
              <Label htmlFor="dealId">Deal ID</Label>
              <input
                id="dealId"
                type="text"
                value={deal.dealId}
                onChange={(e) => onChange('dealId', e.target.value)}
                className={inputCls}
                placeholder="e.g., D001"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Proof & Supply Information */}
        <div className="mb-3">
          <SectionLabel>Proof & Supply</SectionLabel>
          <div className="grid grid-cols-3 gap-2 bg-white rounded-lg border border-border p-2.5">
            <div>
              <Label htmlFor="pcf">PCF Available</Label>
              <select
                id="pcf"
                value={deal.proofStatus?.includes('PCF available') ? 'Yes' : 'No'}
                onChange={(e) => {
                  const has = e.target.value === 'Yes'
                  const next = (deal.proofStatus || []).filter((p) => p !== 'PCF available')
                  onChange('proofStatus', has ? ['PCF available', ...next] : next)
                }}
                className={selectCls}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <Label htmlFor="cert">Certification</Label>
              <select
                id="cert"
                value={deal.certificationStatus}
                onChange={(e) => onChange('certificationStatus', e.target.value)}
                className={selectCls}
              >
                {CERTIFICATION_STATUSES.map((cs) => (
                  <option key={cs} value={cs}>
                    {cs}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="supply">Supply Reliability</Label>
              <select
                id="supply"
                value={deal.supplyReliability}
                onChange={(e) => onChange('supplyReliability', e.target.value)}
                className={selectCls}
              >
                {SUPPLY_RELIABILITY.map((sr) => (
                  <option key={sr} value={sr}>
                    {sr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="available">Items Available</Label>
              <input
                id="available"
                type="number"
                value={deal.proofItemsAvailable}
                onChange={(e) => handleNumericChange('proofItemsAvailable', e)}
                className={inputCls}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="required">Items Required</Label>
              <input
                id="required"
                type="number"
                value={deal.proofItemsRequired}
                onChange={(e) => handleNumericChange('proofItemsRequired', e)}
                className={inputCls}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Deal Inputs */}
        <div className="mb-3">
          <SectionLabel>Deal Inputs</SectionLabel>
          <div className="bg-white rounded-lg border border-border p-2.5">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div>
                <Label htmlFor="volume">Annual Volume (t)</Label>
                <input
                  id="volume"
                  type="number"
                  value={deal.annualSteelVolumeTonnes}
                  onChange={(e) => handleNumericChange('annualSteelVolumeTonnes', e)}
                  className={inputCls}
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <Label htmlFor="convPrice">Conv. Price (€/t)</Label>
                <input
                  id="convPrice"
                  type="number"
                  value={deal.conventionalSteelPricePerTonne}
                  onChange={(e) => handleNumericChange('conventionalSteelPricePerTonne', e)}
                  className={inputCls}
                  min="0"
                  step="10"
                />
              </div>
              <div>
                <Label htmlFor="greenPrem">Green Premium (€/t)</Label>
                <input
                  id="greenPrem"
                  type="number"
                  value={deal.greenPremiumPerTonne}
                  onChange={(e) => handleNumericChange('greenPremiumPerTonne', e)}
                  className={inputCls}
                  min="0"
                  step="5"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="baseCo2">Baseline CO₂ (t/t)</Label>
                <input
                  id="baseCo2"
                  type="number"
                  value={deal.baselineCo2Intensity}
                  onChange={(e) => handleNumericChange('baselineCo2Intensity', e)}
                  className={inputCls}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="greenCo2">Green Steel CO₂ (t/t)</Label>
                <input
                  id="greenCo2"
                  type="number"
                  value={deal.greenSteelCo2Intensity}
                  onChange={(e) => handleNumericChange('greenSteelCo2Intensity', e)}
                  className={inputCls}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="units">Product Units/y</Label>
                <input
                  id="units"
                  type="number"
                  value={deal.productUnits}
                  onChange={(e) => handleNumericChange('productUnits', e)}
                  className={inputCls}
                  min="0"
                  step="1000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Carbon Price */}
        <div className="mb-3">
          <SectionLabel>Carbon Price Assumption</SectionLabel>
          <div className="grid grid-cols-2 gap-2 bg-white rounded-lg border border-border p-2.5">
            <div>
              <Label htmlFor="carbonPrice">Carbon Price (€/t CO₂)</Label>
              <input
                id="carbonPrice"
                type="number"
                value={deal.carbonPrice?.value ?? ''}
                onChange={(e) =>
                  onChange('carbonPrice', {
                    ...deal.carbonPrice,
                    value: e.target.value === '' ? 0 : parseFloat(e.target.value),
                  })
                }
                className={inputCls}
                min="0"
                step="5"
              />
            </div>
            <div>
              <Label htmlFor="source">Source / Assumption</Label>
              <input
                id="source"
                type="text"
                value={deal.carbonPrice?.source ?? ''}
                onChange={(e) =>
                  onChange('carbonPrice', { ...deal.carbonPrice, source: e.target.value })
                }
                className={inputCls}
                placeholder="e.g., EU ETS assumption"
              />
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="size-3.5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-900 mb-1">Please fix the following:</p>
                <ul className="text-xs text-red-800 space-y-0.5">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>• {message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={onCalculate}
            disabled={!valid}
            className="flex-1 rounded-lg bg-[var(--brand-green)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--brand-green-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Calculate & Analyze
          </button>
          {output && (
            <button
              onClick={onNext}
              className="flex-1 rounded-lg border border-[var(--brand-green)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--brand-green)] hover:bg-[var(--brand-green-soft)] transition-colors flex items-center justify-center gap-1"
            >
              View Analysis <ArrowRight className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
