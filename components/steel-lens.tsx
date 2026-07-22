'use client'

import React from 'react'
import { ChevronDown, AlertCircle, ArrowRight, Users } from 'lucide-react'
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
  onChange: (field: keyof DealInput, value: any) => void
  errors: ValidationErrors
  onCalculate: () => void
  output?: BusinessValueOutput
  valid: boolean
  onNext: () => void
}) {
  const handleNumericChange = (field: NumericField, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(field, val === '' ? '' : parseFloat(val))
  }

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-auto">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 bg-gradient-to-r from-[var(--brand-green-soft)] to-white">
        <h1 className="text-2xl font-bold text-foreground">SteelLens</h1>
        <p className="text-sm text-muted-foreground">Green steel business value calculator & impact dashboard</p>
      </div>

      {/* Main Content: Side-by-side Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: INPUTS */}
        <div className="flex-1 overflow-y-auto px-6 py-4 border-r border-border">
          {/* Customer & Deal Information */}
          <div className="mb-5">
            <SectionLabel>Customer & Deal Information</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
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
                  value={deal.productApplication}
                  onChange={(e) => onChange('productApplication', e.target.value)}
                  className={inputCls}
                  placeholder="e.g., EV Chassis - Springs"
                />
              </div>
              <div>
                <Label htmlFor="dealId">Deal ID (Optional)</Label>
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

          {/* Proof & Supply Information */}
          <div className="mb-5">
            <SectionLabel>Proof & Supply Information</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pcf">PCF Available</Label>
                <select
                  id="pcf"
                  value={deal.pcfAvailable ? 'Yes' : 'No'}
                  onChange={(e) => onChange('pcfAvailable', e.target.value === 'Yes')}
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

          {/* Deal Inputs */}
          <div className="mb-5">
            <SectionLabel>Deal Inputs</SectionLabel>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <Label htmlFor="volume">Annual Steel Volume (t)</Label>
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
                <Label htmlFor="convPrice">Conventional Price (€/t)</Label>
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

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <Label htmlFor="baseCo2">Baseline CO₂ (t/t steel)</Label>
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
                <Label htmlFor="greenCo2">Green Steel CO₂ (t/t steel)</Label>
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

          {/* Carbon Price Assumption */}
          <div className="mb-6">
            <SectionLabel>Carbon Price Assumption</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="carbonPrice">Carbon Price (€/t CO₂)</Label>
                <input
                  id="carbonPrice"
                  type="number"
                  value={deal.carbonPrice}
                  onChange={(e) => handleNumericChange('carbonPrice', e)}
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
                  value={deal.carbonPriceSource}
                  onChange={(e) => onChange('carbonPriceSource', e.target.value)}
                  className={inputCls}
                  placeholder="e.g., Illustrative EU ETS assumption"
                />
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 text-red-600 mt-0.5" />
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
          <div className="flex gap-2 pb-4">
            <button
              onClick={onCalculate}
              disabled={!valid}
              className="flex-1 rounded-lg bg-[var(--brand-green)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-green-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Calculate & Analyze
            </button>
            {output && (
              <button
                onClick={onNext}
                className="flex-1 rounded-lg border border-[var(--brand-green)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-green)] hover:bg-[var(--brand-green-soft)] transition-colors flex items-center justify-center gap-2"
              >
                View Analysis <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: OUTPUTS */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-b from-[var(--brand-green-soft)] to-white">
          {output ? (
            <>
              <h2 className="text-lg font-bold text-foreground mb-4">Business Impact Summary</h2>

              {/* Financial Summary */}
              <div className="mb-5 bg-white rounded-lg border border-border p-4">
                <SectionLabel>Financial Summary</SectionLabel>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Premium %</p>
                    <p className="text-lg font-bold text-blue-700">
                      {output.premiumPercentage !== undefined && !isNaN(output.premiumPercentage)
                        ? fmtPercent(output.premiumPercentage / 100)
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Premium per Product</p>
                    <p className="text-lg font-bold text-green-700">
                      {output.premiumPerProduct !== undefined && !isNaN(output.premiumPerProduct)
                        ? fmtCurrency(output.premiumPerProduct)
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Conventional Contract</p>
                    <p className="text-lg font-bold text-amber-700">
                      {output.conventionalContractValue !== undefined && !isNaN(output.conventionalContractValue)
                        ? fmtCurrency(output.conventionalContractValue)
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Green Steel Contract</p>
                    <p className="text-lg font-bold text-[var(--brand-green-dark)]">
                      {output.greenSteelContractValue !== undefined && !isNaN(output.greenSteelContractValue)
                        ? fmtCurrency(output.greenSteelContractValue)
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Carbon Impact */}
              <div className="mb-5 bg-white rounded-lg border border-border p-4">
                <SectionLabel>Carbon Impact</SectionLabel>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">CO₂ Saved Annually</p>
                    <p className="text-xl font-bold text-[var(--brand-green)]">
                      {output.co2Saved !== undefined && !isNaN(output.co2Saved)
                        ? fmtInt(output.co2Saved)
                        : 'N/A'}{' '}
                      <span className="text-xs font-normal">t CO₂</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Green Steel Price</p>
                    <p className="text-xl font-bold text-[var(--brand-green)]">
                      {output.greenSteelPricePerTonne !== undefined && !isNaN(output.greenSteelPricePerTonne)
                        ? fmtCurrency(output.greenSteelPricePerTonne)
                        : 'N/A'}{' '}
                      <span className="text-xs font-normal">€/t</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Carbon Value */}
              <div className="mb-5 bg-white rounded-lg border border-border p-4">
                <SectionLabel>Carbon Value</SectionLabel>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Indicative Carbon Value</p>
                    <p className="text-lg font-bold text-purple-700">
                      {output.indicativeCarbonValue !== undefined && !isNaN(output.indicativeCarbonValue)
                        ? fmtCurrency(output.indicativeCarbonValue)
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Premium</p>
                    <p className="text-lg font-bold text-amber-700">
                      {output.totalPremium !== undefined && !isNaN(output.totalPremium)
                        ? fmtCurrency(output.totalPremium)
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Supply & Proof Metrics */}
              <div className="bg-white rounded-lg border border-border p-4">
                <SectionLabel>Deal Readiness</SectionLabel>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Proof Score</p>
                    <p className="text-lg font-bold text-blue-700">
                      {output.proofScore !== undefined && !isNaN(output.proofScore)
                        ? fmtPercent(output.proofScore / 100)
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Supply Risk</p>
                    <p className="text-lg font-bold text-red-700">
                      {output.supplyRisk || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-lg font-semibold text-muted-foreground mb-2">No Analysis Yet</p>
                <p className="text-sm text-muted-foreground">Click "Calculate & Analyze" to see the business impact</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
