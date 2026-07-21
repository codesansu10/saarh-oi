'use client'

import { Check } from 'lucide-react'

export interface WorkflowStep {
  id: number
  label: string
  enabled: boolean
}

export function WorkflowStepper({
  steps,
  current,
  onSelect,
}: {
  steps: WorkflowStep[]
  current: number
  onSelect: (id: number) => void
}) {
  return (
    <nav aria-label="Workflow steps" className="w-full">
      <ol className="flex flex-wrap items-center gap-2 md:flex-nowrap">
        {steps.map((step, i) => {
          const isActive = step.id === current
          const isDone = step.id < current
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => step.enabled && onSelect(step.id)}
                disabled={!step.enabled}
                aria-current={isActive ? 'step' : undefined}
                className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                  isActive
                    ? 'border-[var(--brand-green)] bg-[var(--brand-green-soft)] text-[var(--brand-green-dark)]'
                    : isDone
                      ? 'border-border bg-surface text-foreground'
                      : 'border-border bg-surface text-muted-foreground'
                }`}
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isActive
                      ? 'bg-[var(--brand-green)] text-white'
                      : isDone
                        ? 'bg-[var(--brand-green)] text-white'
                        : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {isDone ? <Check className="size-3.5" aria-hidden /> : step.id}
                </span>
                <span className="hidden font-medium sm:inline">
                  {step.label}
                </span>
              </button>
              {i < steps.length - 1 ? (
                <span
                  aria-hidden
                  className="hidden h-px w-4 shrink-0 bg-border md:block"
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
