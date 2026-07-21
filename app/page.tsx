'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  DealInput,
  PredictionResponse,
  Stakeholder,
  Provenance,
} from '@/lib/types'
import { createMercedesExample, createEmptyDeal } from '@/lib/defaults'
import { calculateBusinessValue } from '@/lib/value-calculator'
import { validateDeal, isDealValid } from '@/lib/validation'
import { buildFeatureRows } from '@/lib/feature-engineering'
import { fetchPrediction, fetchBrief } from '@/lib/api-client'
import {
  loadCases,
  saveCase,
  deleteCase,
  type SavedCase,
} from '@/lib/storage'
import { buildCaseExport, downloadJson, slugify } from '@/lib/export'
import type { BriefResult } from '@/lib/brief-schema'

import { AppShell, type AppStep } from '@/components/app-shell'
import { Step1Calculator } from '@/components/step1-calculator'
import { Step2Dashboard } from '@/components/step2-dashboard'
import { Step3Stakeholder } from '@/components/step3-stakeholder'
import { Step4Brief } from '@/components/step4-brief'

function buildProvenance(deal: DealInput): Record<string, Provenance> {
  const prov: Record<string, Provenance> = {}
  for (const key of Object.keys(deal) as (keyof DealInput)[]) {
    const v = deal[key]
    if (v === '' || v === null || v === undefined) prov[key] = 'Missing'
    else prov[key] = 'Verified'
  }
  prov.carbonPrice = 'Assumed'
  return prov
}

export default function Page() {
  const [deal, setDeal] = useState<DealInput>(() => createMercedesExample())
  const [step, setStep] = useState<AppStep>(1)

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [predLoading, setPredLoading] = useState(false)
  const [predError, setPredError] = useState<string | null>(null)

  const [activeStakeholder, setActiveStakeholder] =
    useState<Stakeholder>('Procurement')

  const [brief, setBrief] = useState<BriefResult | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [briefError, setBriefError] = useState<string | null>(null)

  const [cases, setCases] = useState<SavedCase[]>([])

  useEffect(() => {
    setCases(loadCases())
  }, [])

  const errors = useMemo(() => validateDeal(deal), [deal])
  const valid = useMemo(() => isDealValid(deal), [deal])
  const output = useMemo(
    () => (valid ? calculateBusinessValue(deal) : null),
    [deal, valid],
  )

  const onChange = useCallback((patch: Partial<DealInput>) => {
    setDeal((d) => ({ ...d, ...patch }))
    setPrediction(null)
    setBrief(null)
    setPredError(null)
  }, [])

  const runPrediction = useCallback(async () => {
    if (!output) return
    setPredLoading(true)
    setPredError(null)
    try {
      const res = await fetchPrediction(deal, output)
      setPrediction(res)
    } catch (e) {
      setPredError(e instanceof Error ? e.message : 'Prediction failed')
    } finally {
      setPredLoading(false)
    }
  }, [deal, output])

  const runBrief = useCallback(
    async (stakeholder: Stakeholder) => {
      if (!output || !prediction) return
      const pred = prediction.predictions.find(
        (p) => p.stakeholder === stakeholder,
      )
      if (!pred) return
      setBriefLoading(true)
      setBriefError(null)
      try {
        const res = await fetchBrief(deal, output, pred, stakeholder)
        setBrief(res)
      } catch (e) {
        setBriefError(e instanceof Error ? e.message : 'Brief failed')
      } finally {
        setBriefLoading(false)
      }
    },
    [deal, output, prediction],
  )

  // Auto-fetch prediction when arriving at step 3 without one.
  useEffect(() => {
    if (step === 3 && valid && !prediction && !predLoading) {
      void runPrediction()
    }
  }, [step, valid, prediction, predLoading, runPrediction])

  // Auto-generate brief when arriving at step 4.
  useEffect(() => {
    if (step === 4 && prediction && !brief && !briefLoading) {
      void runBrief(activeStakeholder)
    }
  }, [step, prediction, brief, briefLoading, activeStakeholder, runBrief])

  const handleSave = useCallback(() => {
    const features = output ? buildFeatureRows(deal, output) : []
    const name = `${deal.companyName} — ${deal.productName}`
    const next = saveCase({
      name,
      deal,
      output,
      features,
      prediction,
      brief: brief?.brief ?? null,
    })
    setCases(next)
  }, [deal, output, prediction, brief])

  const handleExport = useCallback(() => {
    const features = output ? buildFeatureRows(deal, output) : []
    const data = buildCaseExport({
      deal,
      output,
      features,
      prediction,
      brief: brief?.brief ?? null,
      provenance: buildProvenance(deal),
    })
    downloadJson(`saarstahl-${slugify(deal.companyName)}-case.json`, data)
  }, [deal, output, prediction, brief])

  return (
    <AppShell
      activeStep={step}
      onStepSelect={(s) => {
        setStep(s)
        if (s === 3 && valid && !prediction && !predLoading) {
          void runPrediction()
        }
        if (s === 4 && prediction && !brief && !briefLoading) {
          void runBrief(activeStakeholder)
        }
      }}
      canStep2={valid}
      canStep3={valid}
      canStep4={!!prediction}
    >
      {step === 1 && (
        <Step1Calculator
          deal={deal}
          onChange={onChange}
          errors={errors}
          onCalculate={() => setStep(2)}
          valid={valid}
        />
      )}

      {step === 2 && (
        <Step2Dashboard
          deal={deal}
          output={output}
          onEditInputs={() => setStep(1)}
          onNext={() => {
            setStep(3)
            if (valid && !prediction && !predLoading) void runPrediction()
          }}
        />
      )}

      {step === 3 && output && (
        <Step3Stakeholder
          deal={deal}
          output={output}
          prediction={prediction}
          loading={predLoading}
          activeStakeholder={activeStakeholder}
          onSelectStakeholder={setActiveStakeholder}
          onRerun={() => void runPrediction()}
          onNext={() => {
            setStep(4)
            if (prediction && !brief && !briefLoading) void runBrief(activeStakeholder)
          }}
        />
      )}

      {step === 4 && (
        <Step4Brief
          deal={deal}
          output={output}
          prediction={prediction}
          brief={brief}
          loading={briefLoading}
          error={briefError}
          activeStakeholder={activeStakeholder}
          onSelectStakeholder={(s) => {
            setActiveStakeholder(s)
          }}
          onRegenerate={(s) => {
            setActiveStakeholder(s)
            void runBrief(s)
          }}
          onSave={handleSave}
        />
      )}
    </AppShell>
  )
}
