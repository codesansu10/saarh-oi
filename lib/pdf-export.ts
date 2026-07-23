import jsPDF from 'jspdf'
import type { BriefResult } from './brief-schema'
import type { BusinessValueOutput, DealInput } from './types'

// Saarstahl color palette from logo
const LOGO_URL = '/saarstahl-logo.png'
const BRAND_NAVY = '#1a3a5c' // Deep navy from Saarstahl
const BRAND_GREEN = '#2d8a5e' // Steel green accent
const BRAND_GRAY = '#3d3d3d' // Dark gray
const LIGHT_GRAY = '#f5f5f5' // Almost white
const ACCENT_GOLD = '#d4a574' // Subtle accent

async function loadImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function addHeader(doc: jsPDF, title: string, subtitle: string, margin: number, yPos: number) {
  const pageWidth = doc.internal.pageSize.getWidth()
  
  doc.setFontSize(24)
  doc.setTextColor(BRAND_GREEN)
  doc.text(title, margin, yPos)
  yPos += 8

  doc.setFontSize(11)
  doc.setTextColor(BRAND_GRAY)
  doc.text(subtitle, margin, yPos)
  yPos += 10

  doc.setDrawColor(BRAND_GREEN)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  
  return yPos + 8
}

export async function exportInternalViewPDF(
  stakeholderResults: BriefResult[],
  selectedIndex: number,
  deal: DealInput,
  output: BusinessValueOutput,
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 12
  const colWidth = (pageWidth - 2 * margin) / 2

  let yPos = margin

  // Add logo + header
  try {
    const logoImg = await loadImage(LOGO_URL)
    if (logoImg) {
      doc.addImage(logoImg, 'PNG', margin, yPos, 30, 10)
    }
  } catch (e) {
    console.log('[v0] Logo loading failed, continuing without it')
  }

  // Company name and title on right
  doc.setFontSize(14)
  doc.setTextColor(BRAND_NAVY)
  doc.setFont(undefined, 'bold')
  doc.text(`${deal.companyName || 'Customer'}`, margin + 35, yPos + 3)

  doc.setFontSize(10)
  doc.setTextColor(BRAND_GRAY)
  doc.setFont(undefined, 'normal')
  doc.text('Sales Brief', margin + 35, yPos + 8)

  yPos += 15

  // Divider
  doc.setDrawColor(BRAND_GREEN)
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 4

  const activeResult = stakeholderResults[selectedIndex]
  const brief = activeResult.brief

  // Left column: Context & Objection
  doc.setFontSize(9)
  doc.setTextColor(BRAND_GREEN)
  doc.setFont(undefined, 'bold')
  doc.text('STAKEHOLDER', margin, yPos)
  doc.setTextColor(BRAND_GRAY)
  doc.setFont(undefined, 'normal')
  doc.text(brief.stakeholder, margin + 30, yPos)
  yPos += 5

  // Primary Objection
  doc.setFontSize(9)
  doc.setTextColor(BRAND_GREEN)
  doc.setFont(undefined, 'bold')
  doc.text('PRIMARY OBJECTION', margin, yPos)
  yPos += 4
  doc.setTextColor(BRAND_GRAY)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8)
  const objText = doc.splitTextToSize(brief.primaryObjection, colWidth - 2)
  doc.text(objText, margin, yPos)
  yPos += objText.length * 3.5 + 3

  // Why Likely (condensed)
  if (brief.whyLikely && brief.whyLikely.length > 0) {
    doc.setFontSize(9)
    doc.setTextColor(BRAND_GREEN)
    doc.setFont(undefined, 'bold')
    doc.text('WHY LIKELY', margin, yPos)
    yPos += 4
    doc.setTextColor(BRAND_GRAY)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(7.5)
    
    brief.whyLikely.slice(0, 2).forEach((item) => {
      const text = doc.splitTextToSize(`• ${item.text}`, colWidth - 4)
      doc.text(text, margin + 2, yPos)
      yPos += text.length * 3 + 1.5
    })
    yPos += 2
  }

  // Right column starts here
  let rightY = margin + 19

  // Recommended Opening
  doc.setFontSize(9)
  doc.setTextColor(BRAND_GREEN)
  doc.setFont(undefined, 'bold')
  doc.text('RECOMMENDED OPENING', margin + colWidth + 2, rightY)
  rightY += 4
  doc.setTextColor(BRAND_GRAY)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8)
  const openText = doc.splitTextToSize(brief.recommendedOpening, colWidth - 4)
  doc.text(openText, margin + colWidth + 2, rightY)
  rightY += openText.length * 3.5 + 3

  // Conversation Strategy (condensed)
  if (brief.conversationStrategy && brief.conversationStrategy.length > 0) {
    doc.setFontSize(9)
    doc.setTextColor(BRAND_GREEN)
    doc.setFont(undefined, 'bold')
    doc.text('STRATEGY', margin + colWidth + 2, rightY)
    rightY += 4
    doc.setTextColor(BRAND_GRAY)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(7.5)
    
    brief.conversationStrategy.slice(0, 2).forEach((item) => {
      const text = doc.splitTextToSize(`• ${item.text}`, colWidth - 4)
      doc.text(text, margin + colWidth + 4, rightY)
      rightY += text.length * 2.8 + 1.5
    })
    rightY += 2
  }

  // Evidence to Bring
  if (brief.evidenceToBring && brief.evidenceToBring.length > 0) {
    doc.setFontSize(9)
    doc.setTextColor(BRAND_GREEN)
    doc.setFont(undefined, 'bold')
    doc.text('EVIDENCE', margin + colWidth + 2, rightY)
    rightY += 4
    doc.setTextColor(BRAND_GRAY)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(7.5)
    
    brief.evidenceToBring.slice(0, 2).forEach((item) => {
      const text = doc.splitTextToSize(`• ${item.text}`, colWidth - 4)
      doc.text(text, margin + colWidth + 4, rightY)
      rightY += text.length * 2.8 + 1.5
    })
  }

  // Sync Y positions for next section
  yPos = Math.max(yPos, rightY)
  yPos += 3

  // Bottom section: Claims & Questions (full width)
  if (brief.claimsToAvoid && brief.claimsToAvoid.length > 0) {
    doc.setFontSize(9)
    doc.setTextColor('#b91c1c')
    doc.setFont(undefined, 'bold')
    doc.text('AVOID CLAIMS', margin, yPos)
    yPos += 4
    doc.setTextColor(BRAND_GRAY)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(7.5)
    
    brief.claimsToAvoid.slice(0, 2).forEach((item) => {
      const text = doc.splitTextToSize(`• ${item.text}`, pageWidth - 2 * margin - 4)
      doc.text(text, margin + 2, yPos)
      yPos += text.length * 3 + 1.5
    })
    yPos += 2
  }

  // Follow-up Questions
  if (brief.followUpQuestions && brief.followUpQuestions.length > 0) {
    doc.setFontSize(9)
    doc.setTextColor(BRAND_GREEN)
    doc.setFont(undefined, 'bold')
    doc.text('FOLLOW-UP QUESTIONS', margin, yPos)
    yPos += 4
    doc.setTextColor(BRAND_GRAY)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(7.5)
    
    brief.followUpQuestions.slice(0, 3).forEach((item) => {
      const text = doc.splitTextToSize(`• ${item.text}`, pageWidth - 2 * margin - 4)
      doc.text(text, margin + 2, yPos)
      yPos += text.length * 3 + 1.5
    })
  }

  // Footer
  yPos = pageHeight - 15
  doc.setFontSize(7)
  doc.setTextColor(BRAND_GRAY)
  doc.setFont(undefined, 'normal')
  doc.text(`Prepared by: Saarstahl | ${new Date().toLocaleDateString('en-GB')}`, margin, yPos)
  doc.text(`Stakeholder: ${brief.stakeholder}`, pageWidth - margin - 50, yPos, { align: 'right' })

  // Save PDF
  const fileName = `Internal-Brief-${deal.companyName?.replace(/\s+/g, '-') || 'case'}-${brief.stakeholder}.pdf`
  doc.save(fileName)
}

export async function exportCustomerViewPDF(
  deal: DealInput,
  output: BusinessValueOutput,
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 12
  const colWidth = (pageWidth - 2 * margin) / 2

  let yPos = margin

  // Add logo + header
  try {
    const logoImg = await loadImage(LOGO_URL)
    if (logoImg) {
      doc.addImage(logoImg, 'PNG', margin, yPos, 30, 10)
    }
  } catch (e) {
    console.log('[v0] Logo loading failed, continuing without it')
  }

  // Company name and title on right
  doc.setFontSize(14)
  doc.setTextColor(BRAND_NAVY)
  doc.setFont(undefined, 'bold')
  doc.text(`${deal.companyName || 'Our Partner'}`, margin + 35, yPos + 3)

  doc.setFontSize(10)
  doc.setTextColor(BRAND_GRAY)
  doc.setFont(undefined, 'normal')
  doc.text('Green Steel Business Case', margin + 35, yPos + 8)

  yPos += 15

  // Divider
  doc.setDrawColor(BRAND_GREEN)
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 4

  // Left column: Executive Summary & Benefits
  doc.setFontSize(9)
  doc.setTextColor(BRAND_GREEN)
  doc.setFont(undefined, 'bold')
  doc.text('VALUE PROPOSITION', margin, yPos)
  yPos += 4
  doc.setTextColor(BRAND_GRAY)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(7.5)
  const summary = `Drive ESG compliance while offsetting green steel premium through carbon credits. Maintain production continuity with supply security.`
  const summaryText = doc.splitTextToSize(summary, colWidth - 2)
  doc.text(summaryText, margin, yPos)
  yPos += summaryText.length * 3.5 + 3

  // Benefits
  doc.setFontSize(9)
  doc.setTextColor(BRAND_GREEN)
  doc.setFont(undefined, 'bold')
  doc.text('KEY BENEFITS', margin, yPos)
  yPos += 4
  doc.setTextColor(BRAND_GRAY)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(7.5)
  const benefits = [
    `• ESG Leadership: Scope 3 commitment`,
    `• Financial: ~€${(output.indicativeCarbonValue || 0) / 12} annual carbon value`,
    `• Supply: 5-year agreement secured`,
    `• Operational: Zero production changes`,
  ]
  benefits.forEach((benefit) => {
    doc.text(benefit, margin + 2, yPos)
    yPos += 3.5
  })
  yPos += 2

  // Sustainability
  doc.setFontSize(9)
  doc.setTextColor(BRAND_GREEN)
  doc.setFont(undefined, 'bold')
  doc.text('CERTIFICATION', margin, yPos)
  yPos += 4
  doc.setTextColor(BRAND_GRAY)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(7.5)
  const certs = [
    `• ISCC+ verified supply chain`,
    `• Third-party carbon verification`,
    `• EU CBAM compliant`,
  ]
  certs.forEach((cert) => {
    doc.text(cert, margin + 2, yPos)
    yPos += 3.5
  })

  // Right column: Financial Impact
  let rightY = margin + 4

  doc.setFontSize(9)
  doc.setTextColor(BRAND_GREEN)
  doc.setFont(undefined, 'bold')
  doc.text('FINANCIAL IMPACT', margin + colWidth + 2, rightY)
  rightY += 4

  doc.setFontSize(7.5)
  doc.setTextColor(BRAND_GRAY)
  doc.setFont(undefined, 'normal')

  const metrics = [
    { label: 'Annual Volume', value: `${(deal.annualSteelVolumeTonnes || 0).toLocaleString()} t` },
    { label: 'Premium/Tonne', value: `€${(deal.greenPremiumPerTonne || 0).toFixed(0)}` },
    { label: 'Total Premium', value: `€${(output.totalPremium || 0).toLocaleString()}` },
    { label: 'Carbon Value/yr', value: `€${((output.indicativeCarbonValue || 0) / 1).toLocaleString()}` },
    { label: 'Payback Period', value: `~${Math.round((output.totalPremium || 0) / ((output.indicativeCarbonValue || 1) / 12))} months` },
    { label: 'Green Price', value: `€${(output.greenSteelPricePerTonne || 0).toFixed(0)}/t` },
    { label: 'CO₂ Reduction', value: `${(output.co2Saved || 0).toLocaleString()} t/yr` },
  ]

  metrics.forEach((metric) => {
    doc.setTextColor(BRAND_GRAY)
    doc.setFont(undefined, 'normal')
    doc.text(metric.label, margin + colWidth + 2, rightY)
    
    doc.setFont(undefined, 'bold')
    doc.setTextColor(BRAND_NAVY)
    doc.text(metric.value, pageWidth - margin - 10, rightY, { align: 'right' })
    
    rightY += 3.5
  })

  rightY += 2

  // Sync Y positions
  yPos = Math.max(yPos, rightY)
  yPos += 2

  // Bottom: Customer Details & Next Steps (full width)
  doc.setFontSize(9)
  doc.setTextColor(BRAND_GREEN)
  doc.setFont(undefined, 'bold')
  doc.text('CUSTOMER DETAILS', margin, yPos)
  yPos += 4

  doc.setFontSize(7.5)
  doc.setTextColor(BRAND_GRAY)
  doc.setFont(undefined, 'normal')
  const details = [
    `Product: ${deal.productCategoryName || '—'}`,
    `Industry: ${deal.industry || '—'}`,
    `Customer: ${deal.customerName || '—'}`,
  ]
  details.forEach((detail) => {
    doc.text(detail, margin + 2, yPos)
    yPos += 3
  })

  yPos += 3

  // Call to Action footer
  if (yPos < pageHeight - 20) {
    doc.setFillColor(BRAND_NAVY)
    doc.rect(margin, pageHeight - 18, pageWidth - 2 * margin, 15, 'F')

    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.setFont(undefined, 'bold')
    doc.text('Ready to Secure Your Green Steel Supply?', margin + 5, pageHeight - 12)
    
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.text('Contact our team to discuss your customized partnership.', margin + 5, pageHeight - 7)
  }

  // Footer metadata
  doc.setFontSize(6)
  doc.setTextColor(BRAND_GRAY)
  doc.setFont(undefined, 'normal')
  doc.text(`Prepared by: Saarstahl | ${new Date().toLocaleDateString('en-GB')}`, margin, pageHeight - 2)

  // Save PDF
  const fileName = `Green-Steel-Business-Case-${deal.companyName?.replace(/\s+/g, '-') || 'proposal'}.pdf`
  doc.save(fileName)
}
