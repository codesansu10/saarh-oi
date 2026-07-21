import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

interface QuoteBody {
  companyName?: string
  contactName?: string
  email?: string
  requirements?: string
  dealId?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  let body: QuoteBody
  try {
    body = (await request.json()) as QuoteBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const errors: string[] = []
  if (!body.companyName?.trim()) errors.push('Company name is required.')
  if (!body.contactName?.trim()) errors.push('Contact name is required.')
  if (!body.email?.trim() || !EMAIL_RE.test(body.email)) {
    errors.push('A valid email address is required.')
  }
  if (errors.length) {
    return NextResponse.json({ error: 'Validation failed', errors }, { status: 422 })
  }

  // Lead capture: in production this would forward to a CRM / key-account inbox.
  // Here we acknowledge receipt with a reference so the UI can confirm success.
  const reference = `Q-${Date.now().toString(36).toUpperCase()}`
  console.log('[v0] quote request received', {
    reference,
    company: body.companyName,
    dealId: body.dealId,
  })

  return NextResponse.json({
    ok: true,
    reference,
    message:
      'Request received. A Saarstahl key account manager will follow up to prepare a binding technical and commercial offer.',
  })
}
