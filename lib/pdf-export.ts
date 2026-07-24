import jsPDF from 'jspdf'
// import html2canvas from 'html2canvas'
import type { BusinessValueOutput, DealInput } from './types'

// Fallback html2canvas if available
let html2canvas: typeof import('html2canvas').default | null = null
try {
  const module = require('html2canvas')
  html2canvas = module.default || module
} catch (e) {
  // html2canvas optional
}

// Same-origin proxy for the requested Saarstahl logo (avoids CORS in the canvas).
const LOGO_URL = '/api/pdf-logo'

// A4 portrait dimensions in millimetres.
const A4_WIDTH = 210
const A4_HEIGHT = 297
const MARGIN = 10 // top / side margin (mm)
const FOOTER_H = 12 // reserved footer band for page numbers (mm)

/**
 * Fetch the logo through the same-origin proxy and return it as a data URL so
 * html2canvas can render it without any cross-origin tainting. Returns null if
 * the logo cannot be loaded — the PDF must still export in that case.
 */
async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch(LOGO_URL)
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('[v0] Failed to load logo for PDF:', error)
    return null
  }
}

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
 * Capture a DOM element with html2canvas.
 *
 * - Excludes any element marked `data-pdf-ignore="true"` (buttons, tabs, etc.).
 * - Reveals any hidden `.pdf-only` element (PDF-only header / disclaimer) inside
 *   the cloned document only, so the on-screen UI is never affected.
 * - Injects the preloaded logo data URL into `[data-pdf-logo]` images.
 */
async function captureElement(
  element: HTMLElement,
  logoDataUrl: string | null,
): Promise<HTMLCanvasElement> {
  if (!html2canvas) {
    throw new Error('html2canvas is not available. Please install it to use PDF export.')
  }

  return html2canvas(element, {
    scale: 2, // high scale keeps text crisp across page splits
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    ignoreElements: (el) =>
      el instanceof HTMLElement && el.getAttribute('data-pdf-ignore') === 'true',
    onclone: (_doc, clonedEl) => {
      const root = clonedEl as HTMLElement
      // Reveal PDF-only blocks in the clone.
      root.querySelectorAll<HTMLElement>('.pdf-only').forEach((node) => {
        node.classList.remove('hidden')
        node.style.display = 'block'
      })
      // Inject the logo (or hide the placeholder if it could not be loaded).
      root.querySelectorAll<HTMLImageElement>('[data-pdf-logo]').forEach((img) => {
        if (logoDataUrl) {
          img.src = logoDataUrl
        } else {
          img.style.display = 'none'
        }
      })
    },
  })
}

/**
 * Slice a captured canvas across as many A4 portrait pages as needed and save.
 *
 * Uniform side/top margins are kept on every page, a footer band carries the
 * "Page X of Y" label, and a running title is repeated on continuation pages.
 * Overflow that would duplicate content at page seams is masked with white.
 */
function paginateAndSave(
  canvas: HTMLCanvasElement,
  fileName: string,
  runningTitle: string,
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const imgWidth = A4_WIDTH - MARGIN * 2
  const ratio = imgWidth / canvas.width
  const imgHeight = canvas.height * ratio
  const usable = A4_HEIGHT - MARGIN - FOOTER_H // vertical content window per page
  const imgData = canvas.toDataURL('image/png')

  const totalPages = Math.max(1, Math.ceil(imgHeight / usable))

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) doc.addPage()

    // Shift the full image up by one content window per page.
    const position = MARGIN - page * usable
    doc.addImage(imgData, 'PNG', MARGIN, position, imgWidth, imgHeight)

    // Mask overflow so seams never duplicate or bleed content.
    doc.setFillColor(255, 255, 255)
    doc.rect(0, A4_HEIGHT - FOOTER_H, A4_WIDTH, FOOTER_H, 'F') // bottom band
    if (page > 0) {
      doc.rect(0, 0, A4_WIDTH, MARGIN, 'F') // top band on continuation pages
      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)
      doc.text(runningTitle, MARGIN, MARGIN - 3)
    }

    // Page number.
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(`Page ${page + 1} of ${totalPages}`, A4_WIDTH - MARGIN, A4_HEIGHT - 4, {
      align: 'right',
    })
  }

  doc.save(fileName)
}

/**
 * Export the Customer Side Summary as a multi-page A4 PDF that visually mirrors
 * the on-screen content (KPI cards, chart, status sections and disclaimers).
 */
export async function exportCustomerViewPDF(
  element: HTMLElement,
  deal: DealInput,
  _output: BusinessValueOutput,
) {
  const logoDataUrl = await loadLogoDataUrl()
  const canvas = await captureElement(element, logoDataUrl)

  const company = sanitizeForFilename(deal.companyName, 'Customer')
  const dealId = sanitizeForFilename(deal.dealId, 'Deal')
  const fileName = `Customer-Side-Summary-${company}-${dealId}.pdf`

  paginateAndSave(canvas, fileName, `Customer Side Summary — ${deal.companyName || 'Customer'}`)
}

/**
 * Export the Internal Sales View for the CURRENTLY SELECTED stakeholder only.
 * The captured element already renders just the active stakeholder's brief.
 */
export async function exportInternalViewPDF(
  element: HTMLElement,
  deal: DealInput,
  _output: BusinessValueOutput,
  stakeholderName: string,
) {
  const logoDataUrl = await loadLogoDataUrl()
  const canvas = await captureElement(element, logoDataUrl)

  const company = sanitizeForFilename(deal.companyName, 'Customer')
  const stakeholder = sanitizeForFilename(stakeholderName, 'Stakeholder')
  const fileName = `Internal-Sales-View-${company}-${stakeholder}.pdf`

  paginateAndSave(
    canvas,
    fileName,
    `Internal Sales View — ${stakeholderName} — Internal Use Only`,
  )
}
