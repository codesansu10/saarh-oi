'use client'

import {
  MessageSquareQuote,
  Lightbulb,
  FolderCheck,
  Ban,
  HelpCircle,
  AlertCircle,
  Flag,
  Sparkles,
} from 'lucide-react'
import type { BriefItem, BriefResult } from '@/lib/brief-schema'
import { ProvenanceBadge } from './provenance-badge'

function ItemList({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ElementType
  title: string
  items: BriefItem[]
}) {
  if (!items.length) return null
  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="size-4 text-[var(--brand-green-dark)]" aria-hidden />
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start justify-between gap-3">
            <span className="text-sm leading-relaxed text-foreground">
              {item.text}
            </span>
            <ProvenanceBadge label={item.provenance} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function SalesBriefPanel({ result }: { result: BriefResult }) {
  const { brief, mode } = result
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--brand-green)]/30 bg-[var(--brand-green-soft)] px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--brand-green-dark)]">
            Primary objection to address for {brief.stakeholder}
          </p>
          <p className="text-lg font-semibold text-foreground">
            {brief.primaryObjection}
          </p>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
            mode === 'llm'
              ? 'border-[var(--brand-green)] bg-surface text-[var(--brand-green-dark)]'
              : 'border-border bg-surface text-muted-foreground'
          }`}
        >
          <Sparkles className="size-3.5" aria-hidden />
          {mode === 'llm' ? 'LLM mode' : 'Template mode'}
        </span>
      </div>

      <div className="rounded-xl border border-border bg-surface-subtle p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Recommended opening
        </p>
        <p className="text-sm italic leading-relaxed text-foreground">
          “{brief.recommendedOpening}”
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ItemList
          icon={Lightbulb}
          title="Why this is likely"
          items={brief.whyLikely}
        />
        <ItemList
          icon={MessageSquareQuote}
          title="Conversation strategy"
          items={brief.conversationStrategy}
        />
        <ItemList
          icon={FolderCheck}
          title="Evidence to bring"
          items={brief.evidenceToBring}
        />
        <ItemList
          icon={Ban}
          title="Claims to avoid"
          items={brief.claimsToAvoid}
        />
        <ItemList
          icon={HelpCircle}
          title="Follow-up questions"
          items={brief.followUpQuestions}
        />
        <ItemList
          icon={AlertCircle}
          title="Missing information"
          items={brief.missingInformation}
        />
      </div>

      <div className="rounded-xl border border-[var(--brand-green)]/30 bg-surface p-4">
        <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--brand-green-dark)]">
          <Flag className="size-3.5" aria-hidden />
          Recommended next step
        </p>
        <p className="text-sm leading-relaxed text-foreground">
          {brief.recommendedNextStep}
        </p>
      </div>
    </div>
  )
}
