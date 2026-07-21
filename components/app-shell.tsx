'use client'

import { LayoutDashboard, Calculator, Users, FileText, Settings, LogOut } from 'lucide-react'
import { BrandLogo } from './brand-logo'

export type AppStep = 1 | 2 | 3 | 4

const NAV_ITEMS: { step: AppStep; icon: React.ElementType; label: string }[] = [
  { step: 1, icon: Calculator, label: 'Business Calculator' },
  { step: 2, icon: LayoutDashboard, label: 'Business Impact' },
  { step: 3, icon: Users, label: 'Stakeholder Analysis' },
  { step: 4, icon: FileText, label: 'Sales Brief' },
]

export function AppShell({
  children,
  activeStep,
  onStepSelect,
  canStep2,
  canStep3,
  canStep4,
}: {
  children: React.ReactNode
  activeStep: AppStep
  onStepSelect: (step: AppStep) => void
  canStep2: boolean
  canStep3: boolean
  canStep4: boolean
}) {
  const canAccess = (step: AppStep): boolean => {
    if (step === 1) return true
    if (step === 2) return true   // Dashboard always accessible; shows empty state if no output
    if (step === 3) return canStep3
    if (step === 4) return canStep4
    return false
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f8f7]">
      {/* Sidebar */}
      <aside className="flex w-[200px] shrink-0 flex-col border-r border-border bg-white print-hide">
        {/* Logo area */}
        <div className="flex flex-col items-start gap-1 border-b border-border px-4 py-4">
          <BrandLogo height={32} />
          <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
            Green Steel<br />Sales Support Tool
          </p>
        </div>

        {/* Top nav */}
        <nav className="flex flex-col gap-0.5 px-2 pt-3" aria-label="Main navigation">
          {NAV_ITEMS.map(({ step, icon: Icon, label }) => {
            const isActive = activeStep === step
            const enabled = canAccess(step)
            return (
              <button
                key={step}
                type="button"
                onClick={() => enabled && onStepSelect(step)}
                disabled={!enabled}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  isActive
                    ? 'bg-[var(--brand-green-soft)] text-[var(--brand-green-dark)] font-semibold'
                    : 'text-muted-foreground hover:bg-[var(--surface-subtle)] hover:text-foreground'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Bottom nav */}
        <div className="mt-auto flex flex-col gap-0.5 border-t border-border px-2 py-3">
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-[var(--surface-subtle)] hover:text-foreground"
          >
            <Settings className="size-4 shrink-0" aria-hidden />
            Settings
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-[var(--surface-subtle)] hover:text-foreground"
          >
            <LogOut className="size-4 shrink-0" aria-hidden />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
