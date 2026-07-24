'use client';

import { useRef, useState } from 'react';
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

// PDF-only header block. Hidden on screen (`hidden`) and revealed by the PDF
// capture in the cloned document. Carries the requested Saarstahl logo.
function PdfOnlyHeader({
  docTitle,
  confidential,
  meta,
}: {
  docTitle: string;
  confidential?: string;
  meta: { label: string; value: string }[];
}) {
  return (
    <div className="pdf-only hidden">
      <div className="flex items-start justify-between gap-6">
        {/* Logo source is injected as a data URL during capture; keep the aspect ratio */}
        <img
          data-pdf-logo
          src="/api/pdf-logo"
          alt="Saarstahl"
          crossOrigin="anonymous"
          style={{ width: '190px', height: 'auto' }}
        />
        <div className="text-right">
          <p className="text-xl font-bold text-foreground">{docTitle}</p>
          {confidential ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--risk-high)]">
              {confidential}
            </p>
          ) : null}
        </div>
      </div>
      {/* Thin divider below the logo, then the document meta */}
      <div className="mt-4 border-t-2 border-[var(--brand-green)] pt-3">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          {meta.map((m) => (
            <div key={m.label} className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">{m.label}</span>
              <span className="font-medium text-foreground">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 border-b border-border" />
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
  const [exportError, setExportError] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const activeResult = stakeholderResults[selectedStakeholder];

  const handleExportPDF = async () => {
    if (!pdfRef.current || !activeResult || exportingPDF) return;
    setExportError(null);
    try {
      setExportingPDF(true);
      // Export ONLY the currently selected stakeholder's rendered brief.
      await exportInternalViewPDF(pdfRef.current, deal, output, activeResult.brief.stakeholder);
    } catch (error) {
      console.error('[v0] Error exporting internal PDF:', error);
      setExportError('The PDF could not be generated. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  const scenarioRows: { label: string; value: string }[] = [
    { label: 'Annual volume', value: `${(deal.annualSteelVolumeTonnes || 0).toLocaleString()} t` },
    { label: 'Premium per tonne', value: `€${(deal.greenPremiumPerTonne || 0).toLocaleString()}` },
    { label: 'Total annual premium', value: `€${(output.totalPremium || 0).toLocaleString()}` },
    { label: 'Premium per product', value: `€${(output.premiumPerProduct || 0).toLocaleString()}` },
    { label: 'Premium percentage', value: `${(output.premiumPercentage || 0).toFixed(1)}%` },
    { label: 'Annual CO₂ reduction', value: `${(output.co2Saved || 0).toLocaleString()} t CO₂` },
    { label: 'Illustrative carbon value', value: `€${(output.indicativeCarbonValue || 0).toLocaleString()}` },
    { label: 'Proof score', value: `${output.proofScore ?? '—'}` },
    { label: 'Certification status', value: deal.certificationStatus || '—' },
    { label: 'Supply reliability', value: deal.supplyReliability || '—' },
    { label: 'Technical qualification', value: deal.technicalQualificationStatus || '—' },
    { label: 'Delivery timeline', value: deal.deliveryTimeline || '—' },
  ];

  return (
    <div className="space-y-4">
      {/* Header with Export Button (excluded from PDF capture) */}
      <div data-pdf-ignore="true" className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Internal Sales Brief</h2>
          <p className="text-sm text-muted-foreground mt-1">Detailed stakeholder-by-stakeholder analysis for your sales team</p>
        </div>
        <div className="flex flex-col items-end gap-1">
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
                Export Current Stakeholder PDF
              </>
            )}
          </button>
          {exportError ? (
            <p className="text-xs text-[var(--risk-high)]">{exportError}</p>
          ) : null}
        </div>
      </div>

      {/* Stakeholder Selector (excluded from PDF capture) */}
      <div data-pdf-ignore="true" className="rounded-lg border border-border bg-surface p-4">
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

      {/* Active Stakeholder Brief (captured for the PDF) */}
      {activeResult && (
        <div ref={pdfRef} className="pdf-export-content space-y-4 bg-surface p-2">
          {/* PDF-only header with the requested Saarstahl logo */}
          <PdfOnlyHeader
            docTitle="Internal Sales View"
            confidential="Internal Use Only"
            meta={[
              { label: 'Company', value: deal.companyName || '—' },
              { label: 'Deal ID', value: deal.dealId || '—' },
              { label: 'Product / Application', value: deal.productName || '—' },
              { label: 'Selected stakeholder', value: activeResult.brief.stakeholder },
              { label: 'Export date', value: new Date().toLocaleDateString('en-GB') },
            ]}
          />

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
              {activeResult.mode === 'llm' ? 'AI-assisted wording' : 'Rule-based prototype'}
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

          {/* PDF-only: scenario context & commercial KPIs */}
          <div className="pdf-only hidden rounded-xl border border-border bg-surface p-4">
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Scenario Context &amp; Commercial KPIs
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
              {scenarioRows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PDF-only: assessment disclaimer */}
          <div className="pdf-only hidden rounded-lg border border-border bg-surface-subtle p-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              This internal prototype brief is based on an illustrative role-based assessment and the
              entered scenario data. It is intended for sales preparation and does not represent
              validated customer behaviour, guaranteed commercial outcomes or legal compliance advice.
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
  const [exportError, setExportError] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!pdfRef.current || exportingPDF) return;
    setExportError(null);
    try {
      setExportingPDF(true);
      await exportCustomerViewPDF(pdfRef.current, deal, output);
    } catch (error) {
      console.error('[v0] Error exporting customer PDF:', error);
      setExportError('The PDF could not be generated. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Button (excluded from PDF capture) */}
      <div data-pdf-ignore="true" className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Green Steel Business Case</h2>
          <p className="text-sm text-muted-foreground mt-1">Discover why switching to green steel benefits your business</p>
        </div>
        <div className="flex flex-col items-end gap-1">
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
                Export Customer Summary PDF
              </>
            )}
          </button>
          {exportError ? (
            <p className="text-xs text-[var(--risk-high)]">{exportError}</p>
          ) : null}
        </div>
      </div>

      {/* Captured area for the PDF */}
      <div ref={pdfRef} className="pdf-export-content space-y-6 bg-surface p-2">
        {/* PDF-only header with the requested Saarstahl logo */}
        <PdfOnlyHeader
          docTitle="Customer Side Summary"
          meta={[
            { label: 'Company', value: deal.companyName || '—' },
            { label: 'Deal ID', value: deal.dealId || '—' },
            { label: 'Product / Application', value: deal.productName || '—' },
            { label: 'Export date', value: new Date().toLocaleDateString('en-GB') },
          ]}
        />

      {/* Executive Summary for Customer */}
      <div className="rounded-xl border border-[var(--brand-green)]/30 bg-[var(--brand-green-soft)] p-6">
        <h3 className="text-xl font-bold text-foreground mb-2">Why Switch to Green Steel?</h3>
        <p className="text-base text-foreground leading-relaxed">
          Explore the potential of green steel sourcing. This prototype allows you to estimate carbon reduction impacts and assess illustrative financial implications based on your specific requirements.
        </p>
      </div>

      {/* Key Benefits */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Your Key Benefits</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <BenefitCard
            icon={Award}
            title="Estimated Carbon Reduction"
            description={`Potential annual upstream Scope 3 emissions reduction of approximately ${(output.co2Saved || 0).toLocaleString()} t CO₂ compared with baseline.`}
          />
          <BenefitCard
            icon={Zap}
            title="Operational Considerations"
            description="Production compatibility requires validation before implementation. Technical qualification status is pending confirmation."
          />
          <BenefitCard
            icon={Users}
            title="Supply Assessment"
            description={`Current supply reliability assessment: ${deal.supplyReliability || '—'}. Final contractual commitments remain subject to confirmation.`}
          />
          <BenefitCard
            icon={TrendingUp}
            title="Illustrative Carbon Value"
            description={`Approximately €${(output.indicativeCarbonValue || 0).toLocaleString()} per year based on assumed carbon price. This is an illustrative exposure value, not guaranteed savings.`}
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
              {(deal.annualSteelVolumeTonnes || 0).toLocaleString()} t
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50">
            <p className="text-xs text-muted-foreground mb-1">Premium per Tonne</p>
            <p className="text-xl font-bold text-blue-700">
              €{(deal.greenPremiumPerTonne || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50">
            <p className="text-xs text-muted-foreground mb-1">Total Annual Premium</p>
            <p className="text-xl font-bold text-green-700">
              €{(output.totalPremium || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-emerald-50">
            <p className="text-xs text-muted-foreground mb-1">Illustrative Annual Carbon Value</p>
            <p className="text-xl font-bold text-emerald-700">
              €{(output.indicativeCarbonValue || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-50">
            <p className="text-xs text-muted-foreground mb-1">Annual CO₂ Reduction</p>
            <p className="text-xl font-bold text-amber-700">
              {(output.co2Saved || 0).toLocaleString()} t CO₂
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[var(--brand-green-soft)]">
            <p className="text-xs text-muted-foreground mb-1">Supply Reliability</p>
            <p className="text-xl font-bold text-[var(--brand-green-dark)]">{deal.supplyReliability}</p>
          </div>
        </div>
      </div>

      {/* Premium and Carbon Value Comparison Graph */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Illustrative Carbon-Value Offset of One Year&apos;s Green Premium</h3>
        <PremiumCarbonComparisonChart
          monthlyPremium={(output.totalPremium || 0) / 12}
          monthlyCarbonValue={(output.indicativeCarbonValue || 0) / 12}
          totalPremium={output.totalPremium || 0}
          indicativeCarbonValue={output.indicativeCarbonValue || 0}
        />
      </div>

      {/* Sustainability Impact */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Sustainability Profile</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="size-5 text-[var(--brand-green)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Scope 3 Emissions Reduction Potential</p>
              <p className="text-sm text-muted-foreground">Potential contribution to reducing upstream purchased-goods emissions.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="size-5 text-[var(--brand-green)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Certification Status</p>
              <p className="text-sm text-muted-foreground">{`Current status: ${deal.certificationStatus || '—'}. Final evidence must be confirmed before customer-facing claims.`}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="size-5 text-[var(--brand-green)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Proof of Performance</p>
              <p className="text-sm text-muted-foreground">{`Currently ${deal.proofItemsAvailable || 0} of ${deal.proofItemsRequired || 0} proof items available.`}</p>
            </div>
          </div>
        </div>
      </div>

      {/* About This Assessment */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-[var(--brand-green)]" />
          <h3 className="text-lg font-semibold text-foreground">About This Assessment</h3>
        </div>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex gap-2">
            <span className="text-[var(--brand-green)]">→</span>
            <span>Values shown are based on entered deal parameters and estimated carbon pricing</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--brand-green)]">→</span>
            <span>Carbon impact estimates represent upstream Scope 3 reduction potential</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--brand-green)]">→</span>
            <span>Technical compatibility and final certification status require validation</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--brand-green)]">→</span>
            <span>Supply, contractual, and regulatory terms are subject to negotiation and confirmation</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--brand-green)]">→</span>
            <span>This prototype provides illustrative projections for discussion purposes only</span>
          </li>
        </ul>
      </div>

      {/* CTA Section */}
      <div className="rounded-xl border border-[var(--brand-green)] bg-[var(--brand-green-soft)] p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Next Steps</h3>
        <p className="text-foreground mb-4">
          This assessment is a prototype based on entered parameters. To proceed, discuss technical qualification, certification requirements, and contractual terms with our team.
        </p>
        <button
          data-pdf-ignore="true"
          className="bg-[var(--brand-green)] text-white px-6 py-2 rounded-lg font-medium hover:bg-[var(--brand-green-dark)] transition-colors"
        >
          Schedule a Consultation
        </button>
      </div>
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

function PremiumCarbonComparisonChart({
  monthlyPremium,
  monthlyCarbonValue,
  totalPremium,
  indicativeCarbonValue,
}: {
  monthlyPremium: number;
  monthlyCarbonValue: number;
  totalPremium: number;
  indicativeCarbonValue: number;
}) {
  // Generate data points for 36 months
  const months = Array.from({ length: 37 }, (_, i) => i);
  
  // Chart data: one year premium (constant red line), cumulative carbon value (green line)
  const chartData = months.map((month) => ({
    month,
    oneYearPremium: totalPremium, // Constant horizontal line
    cumulativeCarbonValue: (indicativeCarbonValue / 12) * month,
  }));

  // Calculate offset month where cumulative carbon value equals one year premium
  let offsetMonth: number | null = null;
  let showOffset = false;
  
  if (indicativeCarbonValue > 0 && monthlyCarbonValue > 0) {
    offsetMonth = totalPremium / monthlyCarbonValue;
    showOffset = isFinite(offsetMonth) && offsetMonth >= 0 && offsetMonth <= 36;
  }

  // Find max value for scaling - use the larger of the two values with 10% buffer
  const carbonValueAt36Months = (indicativeCarbonValue / 12) * 36;
  const maxChartValue = Math.max(totalPremium, carbonValueAt36Months) * 1.1;
  const maxValue = maxChartValue;

  // Format large values to millions
  const formatYAxisValue = (val: number) => {
    if (val >= 1000000) {
      return `€${(val / 1000000).toFixed(1)}m`;
    }
    return `€${(val / 1000).toFixed(0)}k`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          <span className="text-muted-foreground">One Year&apos;s Green Premium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          <span className="text-muted-foreground">Cumulative Illustrative Carbon Value</span>
        </div>
      </div>

      <svg
        viewBox="0 0 600 320"
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

        {/* X-axis title */}
        <text
          x="320"
          y="305"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="currentColor"
          opacity="0.8"
        >
          Months
        </text>

        {/* Y-axis title (rotated) */}
        <text
          x="16"
          y="150"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="currentColor"
          opacity="0.8"
          transform="rotate(-90 16 150)"
        >
          Value (€ millions)
        </text>

        {/* Y-axis values - from 0 at bottom to max at top */}
        {Array.from({ length: 4 }).map((_, i) => {
          const value = ((i + 1) * maxValue) / 4;
          const y = 250 - ((i + 1) * 200) / 4;
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
              {formatYAxisValue(value)}
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

        {/* One Year Premium line (red, horizontal) */}
        <line
          x1="60"
          y1={250 - (totalPremium / maxValue) * 200}
          x2="580"
          y2={250 - (totalPremium / maxValue) * 200}
          stroke="#ef4444"
          strokeWidth="2"
        />

        {/* Cumulative Carbon Value line (green) */}
        <polyline
          points={chartData
            .map((d) => {
              const x = 60 + (d.month / 36) * 520;
              const y = 250 - (d.cumulativeCarbonValue / maxValue) * 200;
              return `${x},${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
        />

        {/* Offset point and vertical line */}
        {showOffset && offsetMonth !== null && (
          <>
            {/* Vertical dashed line at offset month */}
            <line
              x1={60 + (offsetMonth / 36) * 520}
              y1="50"
              x2={60 + (offsetMonth / 36) * 520}
              y2="250"
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            
            {/* Intersection marker */}
            <circle
              cx={60 + (offsetMonth / 36) * 520}
              cy={250 - (totalPremium / maxValue) * 200}
              r="4"
              fill="#a855f7"
              stroke="white"
              strokeWidth="2"
            />
            
            {/* Offset label */}
            <text
              x={60 + (offsetMonth / 36) * 520}
              y={250 - (totalPremium / maxValue) * 200 - 15}
              textAnchor="middle"
              fontSize="11"
              fill="#a855f7"
              fontWeight="bold"
            >
              Illustrative offset: ≈ {offsetMonth.toFixed(1)} months
            </text>
          </>
        )}
      </svg>

      <div className="text-sm text-foreground bg-surface-subtle p-3 rounded-lg">
        <p className="text-muted-foreground">
          {showOffset && offsetMonth !== null
            ? 'This illustrative offset point shows when cumulative modelled carbon value equals one year of green-steel premium. It is not a full investment break-even, guaranteed saving, carbon-credit income, or confirmation that recurring annual premiums will be fully offset.'
            : 'The illustrative carbon value does not equal one year\'s green premium within the displayed 36-month period.'}
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
          Internal Sales View
        </button>
        <button
          onClick={() => setActiveView('customer')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${
            activeView === 'customer'
              ? 'text-[var(--brand-green)] border-b-2 border-[var(--brand-green)]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Customer Side Summary
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

