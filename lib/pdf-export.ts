import jsPDF from 'jspdf'
import type { BusinessValueOutput, DealInput } from './types'

// A4 portrait dimensions in millimetres.
const A4_WIDTH = 210
const A4_HEIGHT = 297
const MARGIN = 15
const FONT_SIZE_HEADING = 16
const FONT_SIZE_NORMAL = 11
const FONT_SIZE_SMALL = 9

/** Sanitise a value so it is safe to use inside a download filename. */
function sanitizeForFilename(value: string | undefined | null, fallback: string): string {
  const cleaned = (value || '')
    .toString()
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || fallback
}

/**
 * Create a simple PDF export without html2canvas dependency.
 * Generates a text-based PDF with deal and business information.
 */
function createSimplePDF(
  fileName: string,
  title: string,
  deal: DealInput,
  output: BusinessValueOutput,
  content: Array<{ type: 'heading' | 'subheading' | 'paragraph' | 'keyvalue' | 'list'; value: string | string[] | { key: string; value: string }[] }>,
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  
  let yPosition = MARGIN
  const pageWidth = A4_WIDTH - MARGIN * 2
  const bottomMargin = A4_HEIGHT - MARGIN
  
  const checkPageBreak = (increment: number) => {
    if (yPosition + increment > bottomMargin) {
      doc.addPage()
      yPosition = MARGIN
    }
  }
  
  const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0], lineHeight: number = 7) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.setTextColor(color[0], color[1], color[2])
    
    const lines = doc.splitTextToSize(text, pageWidth)
    checkPageBreak(lines.length * lineHeight)
    
    doc.text(lines, MARGIN, yPosition)
    yPosition += lines.length * lineHeight
  }
  
  // Header with title
  addText(title, FONT_SIZE_HEADING, true, [76, 175, 80])
  yPosition += 5
  
  addText(`Company: ${deal.companyName || 'N/A'}`, FONT_SIZE_NORMAL)
  addText(`Deal ID: ${deal.dealId || 'N/A'}`, FONT_SIZE_NORMAL)
  addText(`Product: ${deal.productApplication || 'N/A'}`, FONT_SIZE_NORMAL)
  yPosition += 5
  
  // Business Summary
  addText('Business Impact Summary', FONT_SIZE_HEADING, true, [76, 175, 80])
  yPosition += 3
  
  const metrics = [
    { key: 'Premium %', value: `${(output.premiumPercentage ?? 0).toFixed(1)}%` },
    { key: 'Premium/Product', value: `€${(output.premiumPerProduct ?? 0).toFixed(0)}` },
    { key: 'Conv. Contract', value: `€${(output.conventionalContractValue ?? 0).toLocaleString('de-DE')}` },
    { key: 'Green Contract', value: `€${(output.greenSteelContractValue ?? 0).toLocaleString('de-DE')}` },
    { key: 'CO₂ Saved/Year', value: `${(output.co2Saved ?? 0).toLocaleString('de-DE')} t` },
    { key: 'Green Steel Price', value: `€${(output.greenSteelPricePerTonne ?? 0).toFixed(0)}/t` },
    { key: 'Carbon Value', value: `€${(output.indicativeCarbonValue ?? 0).toLocaleString('de-DE')}` },
    { key: 'Total Premium', value: `€${(output.totalPremium ?? 0).toLocaleString('de-DE')}` },
  ]
  
  metrics.forEach(({ key, value }) => {
    doc.setFontSize(FONT_SIZE_SMALL)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`${key}:`, MARGIN, yPosition)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(76, 175, 80)
    doc.text(value, MARGIN + 70, yPosition)
    yPosition += 5
    checkPageBreak(5)
  })
  
  yPosition += 5
  
  // Add content sections
  content.forEach((section) => {
    checkPageBreak(10)
    
    switch (section.type) {
      case 'heading':
        addText(section.value as string, FONT_SIZE_HEADING, true, [76, 175, 80])
        yPosition += 3
        break
      case 'subheading':
        addText(section.value as string, FONT_SIZE_NORMAL, true)
        yPosition += 2
        break
      case 'paragraph':
        addText(section.value as string, FONT_SIZE_NORMAL)
        yPosition += 2
        break
      case 'list':
        (section.value as string[]).forEach((item) => {
          addText(`• ${item}`, FONT_SIZE_NORMAL)
        })
        yPosition += 2
        break
      case 'keyvalue':
        (section.value as { key: string; value: string }[]).forEach(({ key, value }) => {
          doc.setFontSize(FONT_SIZE_SMALL)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(0, 0, 0)
          doc.text(`${key}:`, MARGIN, yPosition)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100, 100, 100)
          doc.text(value, MARGIN + 50, yPosition)
          yPosition += 5
          checkPageBreak(5)
        })
        break
    }
  })
  
  // Footer
  const totalPages = (doc as any).internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    (doc as any).setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Page ${i} of ${totalPages}`, MARGIN, A4_HEIGHT - 5)
  }
  
  doc.save(fileName)
}

/**
 * Export the Customer Side Summary as a PDF with deal information and business metrics.
 */
export async function exportCustomerViewPDF(
  element: HTMLElement,
  deal: DealInput,
  output: BusinessValueOutput,
) {
  const company = sanitizeForFilename(deal.companyName, 'Customer')
  const dealId = sanitizeForFilename(deal.dealId, 'Deal')
  const fileName = `Customer-Summary-${company}-${dealId}.pdf`
  
  const content = [
    { type: 'heading' as const, value: 'Customer Side Summary' },
    { type: 'paragraph' as const, value: 'This document summarizes the business value and impact of selecting green steel for your procurement.' },
    { type: 'heading' as const, value: 'Key Benefits' },
    { type: 'list' as const, value: [
      'Significant CO₂ reduction supporting your sustainability targets',
      'Transparent pricing with long-term cost predictability',
      'Full supply reliability with backup options',
      'Comprehensive audit-ready documentation',
    ]},
    { type: 'heading' as const, value: 'Environmental Impact' },
    { type: 'keyvalue' as const, value: [
      { key: 'CO₂ Saved Annually', value: `${(output.co2Saved ?? 0).toLocaleString('de-DE')} tonnes` },
      { key: 'Carbon Value', value: `€${(output.indicativeCarbonValue ?? 0).toLocaleString('de-DE')}` },
      { key: 'Scope 3 Contribution', value: 'Direct measurable impact on decarbonization targets' },
    ]},
    { type: 'heading' as const, value: 'Next Steps' },
    { type: 'list' as const, value: [
      'Review technical specifications and certification documents',
      'Confirm pricing and delivery timeline',
      'Schedule implementation kickoff meeting',
    ]},
  ]
  
  createSimplePDF(fileName, 'Green Steel - Customer Summary', deal, output, content)
}

/**
 * Export the Internal Sales View as a PDF for the current stakeholder.
 */
export async function exportInternalViewPDF(
  element: HTMLElement,
  deal: DealInput,
  output: BusinessValueOutput,
  stakeholderName: string,
) {
  const company = sanitizeForFilename(deal.companyName, 'Customer')
  const stakeholder = sanitizeForFilename(stakeholderName, 'Stakeholder')
  const fileName = `Internal-Sales-Brief-${company}-${stakeholder}.pdf`
  
  const content = [
    { type: 'heading' as const, value: `Internal Sales Brief - ${stakeholderName}` },
    { type: 'paragraph' as const, value: '*** INTERNAL USE ONLY - CONFIDENTIAL ***' },
    { type: 'paragraph' as const, value: `This document contains stakeholder-specific objection handling and conversation strategies for the ${stakeholderName} decision-maker.` },
    { type: 'heading' as const, value: 'Deal Overview' },
    { type: 'keyvalue' as const, value: [
      { key: 'Customer', value: deal.companyName || 'N/A' },
      { key: 'Product', value: deal.productApplication || 'N/A' },
      { key: 'Annual Volume', value: `${(deal.annualSteelVolumeTonnes ?? 0).toLocaleString('de-DE')} tonnes` },
      { key: 'Contract Value (Green)', value: `€${(output.greenSteelContractValue ?? 0).toLocaleString('de-DE')}` },
    ]},
    { type: 'heading' as const, value: 'Stakeholder Context' },
    { type: 'paragraph' as const, value: `This brief is tailored for the ${stakeholderName} stakeholder with their specific concerns, priorities, and decision criteria in mind.` },
    { type: 'heading' as const, value: 'Key Talking Points' },
    { type: 'list' as const, value: [
      'Lead with the value proposition most relevant to this stakeholder',
      'Address their top 3 objections with evidence and examples',
      'Emphasize long-term strategic benefits over short-term costs',
      'Provide specific metrics and proof points they care about',
    ]},
    { type: 'heading' as const, value: 'Next Actions' },
    { type: 'list' as const, value: [
      'Schedule stakeholder-specific presentation',
      'Prepare responses to anticipated questions',
      'Brief internal team on conversation strategy',
      'Follow up with documentation and evidence package',
    ]},
  ]
  
  createSimplePDF(fileName, `Internal Sales Brief - ${stakeholderName}`, deal, output, content)
}
