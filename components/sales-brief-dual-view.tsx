'use client';

import { useState } from 'react';
import {
  MessageSquareQuote,
  Lightbulb,
  FolderCheck,
  Ban,
  HelpCircle,
  AlertCircle,
  Flag,
  Sparkles,
  TrendingUp,
  Zap,
  Award,
  Users,
  Download,
  Loader2,
} from 'lucide-react';
import type { BriefItem, BriefResult } from '@/lib/brief-schema';
import type { Stakeholder, BusinessValueOutput, DealInput, StakeholderPredictions } from '@/lib/types';
import { ProvenanceBadge } from './provenance-badge';
import { exportInternalViewPDF, exportCustomerViewPDF } from '@/lib/pdf-export';

interface DualViewProps {
  result: BriefResult;
  stakeholderResults: BriefResult[];
  deal: DealInput;
  output: BusinessValueOutput;
  predictions: StakeholderPredictions[];
}

function ItemList({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ElementType;
  title: string;
  items: BriefItem[];
}) {
  if (!items.length) return null;
  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="size-4 text-[var(--brand-green-dark)]" aria-hidden />
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="flex flex-1 items-start gap-2">
              <span className="mt-1 flex-shrink-0 text-[var(--brand-green-dark)]" aria-hidden>
                •
              </span>
              <span className="flex-1 text-sm leading-relaxed text-foreground text-justify">
                {item.text}
              </span>
            </div>
            <div className="flex w-28 flex-shrink-0 justify-end">
              <ProvenanceBadge label={item.provenance} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BenefitCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 hover:border-[var(--brand-green)] transition-colors">
      <div className="flex items-start gap-3">
        <Icon className="size-5 text-[var(--brand-green)] flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

function InternalView({
  stakeholderResults,
  deal,
  output,
}: {
  stakeholderResults: BriefResult[];
  deal: DealInput;
  output: BusinessValueOutput;
}) {
  const [selectedStakeholder, setSelectedStakeholder] = useState<number>(0);
  const [exportingPDF, setExportingPDF] = useState(false);

  const activeResult = stakeholderResults[selectedStakeholder];

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      await exportInternalViewPDF(stakeholderResults, selectedStakeholder, deal, output);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Internal Sales Brief</h2>
          <p className="text-sm text-muted-foreground mt-1">Detailed stakeholder-by-stakeholder analysis for your sales team</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exportingPDF}
          className="flex items-center gap-2 rounded-lg bg-[var(--brand-green)] px-4 py-2 text-white hover:bg-[var(--brand-green-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {exportingPDF ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="size-4" aria-hidden />
              Export to PDF
            </>
          )}
        </button>
      </div>

      {/* Stakeholder Selector */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
          Select Stakeholder to View Detailed Brief
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {stakeholderResults.map((result, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedStakeholder(idx)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStakeholder === idx
                  ? 'bg-[var(--brand-green)] text-white'
                  : 'bg-slate-100 text-foreground hover:bg-slate-200'
              }`}
            >
              {result.brief.stakeholder}
            </button>
          ))}
        </div>
      </div>

      {/* Active Stakeholder Brief */}
      {activeResult && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--brand-green)]/30 bg-[var(--brand-green-soft)] px-4 py-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--brand-green-dark)]">
                Primary objection for {activeResult.brief.stakeholder}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {activeResult.brief.primaryObjection}
              </p>
            </div>
            <span
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                activeResult.mode === 'llm'
                  ? 'border-[var(--brand-green)] bg-surface text-[var(--brand-green-dark)]'
                  : 'border-border bg-surface text-muted-foreground'
              }`}
            >
              <Sparkles className="size-3.5" aria-hidden />
              {activeResult.mode === 'llm' ? 'LLM mode' : 'Template mode'}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-surface-subtle p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Recommended opening
            </p>
            <p className="text-sm italic leading-relaxed text-foreground">
              "{activeResult.brief.recommendedOpening}"
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <ItemList
              icon={Lightbulb}
              title="Why this is likely"
              items={activeResult.brief.whyLikely}
            />
            <ItemList
              icon={MessageSquareQuote}
              title="Conversation strategy"
              items={activeResult.brief.conversationStrategy}
            />
            <ItemList
              icon={FolderCheck}
              title="Evidence to bring"
              items={activeResult.brief.evidenceToBring}
            />
            <ItemList
              icon={Ban}
              title="Claims to avoid"
              items={activeResult.brief.claimsToAvoid}
            />
            <ItemList
              icon={HelpCircle}
              title="Follow-up questions"
              items={activeResult.brief.followUpQuestions}
            />
            <ItemList
              icon={AlertCircle}
              title="Missing information"
              items={activeResult.brief.missingInformation}
            />
          </div>

          <div className="rounded-xl border border-[var(--brand-green)]/30 bg-surface p-4">
            <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--brand-green-dark)]">
              <Flag className="size-3.5" aria-hidden />
              Recommended next step
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              {activeResult.brief.recommendedNextStep}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerView({
  deal,
  output,
}: {
  deal: DealInput;
  output: BusinessValueOutput;
}) {
  const [exportingPDF, setExportingPDF] = useState(false);
  const paybackMonths = Math.round((output.totalPremium || 0) / ((output.indicativeCarbonValue || 0) / 12));
  const annualCarbonValue = output.indicativeCarbonValue || 0;
  const costPremium = output.totalPremium || 0;

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      await exportCustomerViewPDF(deal, output);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Green Steel Business Case</h2>
          <p className="text-sm text-muted-foreground mt-1">Discover why switching to green steel benefits your business</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exportingPDF}
          className="flex items-center gap-2 rounded-lg bg-[var(--brand-green)] px-4 py-2 text-white hover:bg-[var(--brand-green-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {exportingPDF ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="size-4" aria-hidden />
              Export to PDF
            </>
          )}
        </button>
      </div>

      {/* Executive Summary for Customer */}
      <div className="rounded-xl border border-[var(--brand-green)]/30 bg-[var(--brand-green-soft)] p-6">
        <h3 className="text-xl font-bold text-foreground mb-2">Why Switch to Green Steel?</h3>
        <p className="text-base text-foreground leading-relaxed">
          Join forward-thinking manufacturers transitioning to certified green steel. Achieve your sustainability goals while protecting your supply chain and enhancing your brand value.
        </p>
      </div>

      {/* Key Benefits */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Your Key Benefits</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <BenefitCard
            icon={TrendingUp}
            title="Financial Payback"
            description={`Green premium fully offset through carbon credits within ${paybackMonths} months. After that, pure margin improvement.`}
          />
          <BenefitCard
            icon={Award}
            title="ESG Leadership"
            description="Publicly demonstrate Scope 3 carbon reduction aligned with net-zero commitments. Strengthen investor relations and customer trust."
          />
          <BenefitCard
            icon={Zap}
            title="Zero Production Disruption"
            description="Certified compatible with existing production. Seamless integration with proven supply chain support and technical training included."
          />
          <BenefitCard
            icon={Users}
            title="Supply Security"
            description="Lock in 5-year contract protecting you from future price volatility and supply disruptions. Secure your competitive advantage."
          />
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Financial Outlook</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-surface-subtle">
            <p className="text-xs text-muted-foreground mb-1">Annual Volume</p>
            <p className="text-xl font-bold text-foreground">
              {(deal.annualVolume || 0).toLocaleString()} t
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50">
            <p className="text-xs text-muted-foreground mb-1">Premium per Tonne</p>
            <p className="text-xl font-bold text-blue-700">
              €{Math.round(costPremium / (deal.annualVolume || 1)).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50">
            <p className="text-xs text-muted-foreground mb-1">Annual Carbon Value</p>
            <p className="text-xl font-bold text-green-700">
              €{Math.round(annualCarbonValue).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-50">
            <p className="text-xs text-muted-foreground mb-1">CO₂ Reduction Yearly</p>
            <p className="text-xl font-bold text-amber-700">
              {Math.round(output.co2Saved || 0).toLocaleString()} t
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-50">
            <p className="text-xs text-muted-foreground mb-1">Payback Period</p>
            <p className="text-xl font-bold text-purple-700">{paybackMonths} months</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[var(--brand-green-soft)]">
            <p className="text-xs text-muted-foreground mb-1">Supply Rating</p>
            <p className="text-xl font-bold text-[var(--brand-green-dark)]">{deal.supplyReliability}</p>
          </div>
        </div>
      </div>

      {/* Break-Even Analysis Graph */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Break-Even Analysis</h3>
        <BreakEvenChart
          monthlyPremium={(costPremium || 0) / 12}
          monthlyReturn={(annualCarbonValue || 0) / 12}
          paybackMonth={paybackMonths}
        />
      </div>

      {/* Sustainability Impact */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Sustainability Impact</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="size-5 text-[var(--brand-green)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Scope 1 & 2 Carbon Neutrality</p>
              <p className="text-sm text-muted-foreground">Steel procurement now contributes to your net-zero targets.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="size-5 text-[var(--brand-green)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Third-Party Certified</p>
              <p className="text-sm text-muted-foreground">ISCC+ certification ensures authenticity and compliance with regulatory standards.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="size-5 text-[var(--brand-green)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Stakeholder Engagement</p>
              <p className="text-sm text-muted-foreground">Share your commitment with investors, customers, and supply chain partners.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Competitive Advantages */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-[var(--brand-green)]" />
          <h3 className="text-lg font-semibold text-foreground">Why Companies Like Yours Are Switching</h3>
        </div>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex gap-2">
            <span className="text-[var(--brand-green)]">→</span>
            <span>Your premium customers increasingly demand sustainable sourcing</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--brand-green)]">→</span>
            <span>Regulatory pressure on Scope 3 emissions is accelerating globally</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--brand-green)]">→</span>
            <span>First-movers in your industry gain competitive market positioning</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--brand-green)]">→</span>
            <span>Supply chain security with multi-year contracts protects margins</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--brand-green)]">→</span>
            <span>Carbon credits provide immediate financial offset and upside potential</span>
          </li>
        </ul>
      </div>

      {/* CTA Section */}
      <div className="rounded-xl border border-[var(--brand-green)] bg-[var(--brand-green-soft)] p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Make the Switch?</h3>
        <p className="text-foreground mb-4">
          Let&apos;s discuss your specific requirements and create a customized transition plan.
        </p>
        <button className="bg-[var(--brand-green)] text-white px-6 py-2 rounded-lg font-medium hover:bg-[var(--brand-green-dark)] transition-colors">
          Schedule a Consultation
        </button>
      </div>
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  );
}

function BreakEvenChart({
  monthlyPremium,
  monthlyReturn,
  paybackMonth,
}: {
  monthlyPremium: number;
  monthlyReturn: number;
  paybackMonth: number;
}) {
  // Generate data points for 36 months
  const months = Array.from({ length: 37 }, (_, i) => i);
  const chartData = months.map((month) => ({
    month,
    cumulativeCost: month * monthlyPremium,
    cumulativeReturn: month * monthlyReturn,
  }));

  // Find max value for scaling
  const maxValue = Math.max(
    ...chartData.map((d) => Math.max(d.cumulativeCost, d.cumulativeReturn)),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          <span className="text-muted-foreground">Green Premium Cost</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          <span className="text-muted-foreground">Carbon Credit Returns</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 border-l-2 border-purple-600" />
          <span className="text-muted-foreground">Break-even Point</span>
        </div>
      </div>

      <svg
        viewBox="0 0 600 300"
        className="w-full border border-border rounded-lg bg-surface-subtle p-4"
        style={{ minHeight: '300px' }}
      >
        {/* Grid lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = 50 + (i * 200) / 4;
          return (
            <line
              key={`grid-h-${i}`}
              x1="60"
              y1={y}
              x2="580"
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
          );
        })}

        {/* X-axis labels (months) */}
        {[0, 6, 12, 18, 24, 30, 36].map((month) => {
          const x = 60 + (month / 36) * 520;
          return (
            <g key={`x-label-${month}`}>
              <line
                x1={x}
                y1="250"
                x2={x}
                y2="260"
                stroke="currentColor"
                strokeOpacity="0.5"
                strokeWidth="1"
              />
              <text
                x={x}
                y="275"
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                opacity="0.7"
              >
                {month}m
              </text>
            </g>
          );
        })}

        {/* Y-axis label */}
        <text x="20" y="30" fontSize="12" fill="currentColor" opacity="0.7">
          €
        </text>

        {/* Y-axis values */}
        {Array.from({ length: 5 }).map((_, i) => {
          const value = (i * maxValue) / 4;
          const y = 50 + (i * 200) / 4;
          return (
            <text
              key={`y-label-${i}`}
              x="50"
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="currentColor"
              opacity="0.7"
            >
              {(value / 1000).toFixed(0)}k
            </text>
          );
        })}

        {/* Axes */}
        <line
          x1="60"
          y1="50"
          x2="60"
          y2="250"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.3"
        />
        <line
          x1="60"
          y1="250"
          x2="580"
          y2="250"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.3"
        />

        {/* Cost line (red) */}
        <polyline
          points={chartData
            .map((d) => {
              const x = 60 + (d.month / 36) * 520;
              const y = 250 - (d.cumulativeCost / maxValue) * 200;
              return `${x},${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
        />

        {/* Return line (green) */}
        <polyline
          points={chartData
            .map((d) => {
              const x = 60 + (d.month / 36) * 520;
              const y = 250 - (d.cumulativeReturn / maxValue) * 200;
              return `${x},${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
        />

        {/* Break-even line (vertical) */}
        {paybackMonth > 0 && paybackMonth <= 36 && (
          <>
            <line
              x1={60 + (paybackMonth / 36) * 520}
              y1="50"
              x2={60 + (paybackMonth / 36) * 520}
              y2="250"
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <circle
              cx={60 + (paybackMonth / 36) * 520}
              cy={250 - ((paybackMonth * monthlyReturn) / maxValue) * 200}
              r="4"
              fill="#a855f7"
            />
          </>
        )}
      </svg>

      <div className="text-sm text-foreground bg-surface-subtle p-3 rounded-lg">
        <p className="font-semibold mb-1">Break-even in {paybackMonth} months</p>
        <p className="text-muted-foreground">
          After {paybackMonth} months, carbon credits fully offset the green steel premium. Thereafter, carbon benefits represent pure margin improvement.
        </p>
      </div>
    </div>
  );
}

export function SalesBriefDualView({
  result,
  stakeholderResults,
  deal,
  output,
  predictions,
}: DualViewProps) {
  const [activeView, setActiveView] = useState<'internal' | 'customer'>('internal');

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveView('internal')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${
            activeView === 'internal'
              ? 'text-[var(--brand-green)] border-b-2 border-[var(--brand-green)]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Internal View
        </button>
        <button
          onClick={() => setActiveView('customer')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${
            activeView === 'customer'
              ? 'text-[var(--brand-green)] border-b-2 border-[var(--brand-green)]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Customer View
        </button>
      </div>

      {/* View Content */}
      <div className="mt-4">
        {activeView === 'internal' ? (
          <InternalView
            stakeholderResults={stakeholderResults}
            deal={deal}
            output={output}
          />
        ) : (
          <CustomerView deal={deal} output={output} />
        )}
      </div>
    </div>
  );
}
