import { BrandLogo } from './brand-logo'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur print-hide">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-9 w-auto" />
          <span className="hidden h-8 w-px bg-border sm:block" aria-hidden />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-steel-grey-dark">
              Green-Steel Value &amp; Objection Simulator
            </p>
            <p className="text-xs text-muted-foreground">
              Pure Steel<span className="align-super text-[0.6em]">+</span> sales
              enablement — decision support
            </p>
          </div>
        </div>
        <span className="status-badge w-fit border-[var(--steel-grey)]/40 bg-[var(--steel-grey-soft)] text-[var(--steel-grey-dark)]">
          Synthetic-data prototype
        </span>
      </div>
    </header>
  )
}
