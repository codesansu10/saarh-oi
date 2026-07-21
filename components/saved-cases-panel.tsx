'use client'

import { Save, FolderOpen, Trash2, Download, FileJson } from 'lucide-react'
import type { SavedCase } from '@/lib/storage'
import { fmtCurrency } from '@/lib/value-calculator'

export function SavedCasesPanel({
  cases,
  onSave,
  onLoad,
  onDelete,
  onExportCurrent,
  canExport,
}: {
  cases: SavedCase[]
  onSave: () => void
  onLoad: (c: SavedCase) => void
  onDelete: (id: string) => void
  onExportCurrent: () => void
  canExport: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-green)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-green-dark)]"
        >
          <Save className="size-4" aria-hidden />
          Save current case
        </button>
        <button
          type="button"
          onClick={onExportCurrent}
          disabled={!canExport}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--brand-green)]/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileJson className="size-4" aria-hidden />
          Export current (JSON)
        </button>
      </div>

      {cases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-subtle px-4 py-8 text-center">
          <FolderOpen
            className="mx-auto mb-2 size-6 text-muted-foreground"
            aria-hidden
          />
          <p className="text-sm text-muted-foreground">
            No saved cases yet. Configure a deal and click “Save current case”.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {cases.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {c.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.deal.companyName} · {c.deal.productName} ·{' '}
                  {c.output ? fmtCurrency(c.output.totalPremium) : '—'} ·{' '}
                  {new Date(c.savedAt).toLocaleString('en-GB')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onLoad(c)}
                  aria-label={`Load ${c.name}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-[var(--brand-green)]/50"
                >
                  <FolderOpen className="size-3.5" aria-hidden />
                  Load
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(c.id)}
                  aria-label={`Delete ${c.name}`}
                  className="inline-flex items-center rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:border-[var(--risk-high)]/50 hover:text-[var(--risk-high)]"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Download className="size-3.5" aria-hidden />
        Cases are stored locally in your browser. Export produces a full
        provenance-tagged JSON snapshot (deal, features, model outputs, brief).
      </p>
    </div>
  )
}
