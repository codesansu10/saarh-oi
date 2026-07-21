import { NextResponse } from 'next/server'
import { generateTemplateBrief } from '@/lib/brief-generator'
import type { BriefRequest, BriefResult, SalesBrief } from '@/lib/brief-schema'

export const runtime = 'nodejs'

/**
 * Optional LLM path. Only used when an OpenAI-compatible key is configured via
 * OPENAI_API_KEY (+ optional OPENAI_BASE_URL / BRIEF_MODEL). The model is
 * instructed to rewrite ONLY the narrative prose of the deterministic brief and
 * to preserve every factual figure, provenance tag, and safety constraint.
 * On any error we fall back to the deterministic template.
 */
async function tryLlmBrief(
  req: BriefRequest,
  base: SalesBrief,
): Promise<SalesBrief | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const baseUrl = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'
  const model = process.env.BRIEF_MODEL ?? 'gpt-4o-mini'

  const system = [
    'You are a B2B green-steel sales enablement assistant for Saarstahl.',
    'You will be given a deterministic sales brief as JSON that was computed from verified deal facts and a synthetic-data objection model.',
    'Rewrite ONLY the free-text prose to be crisper and more persuasive.',
    'You MUST preserve every numeric figure, the primaryObjection, and each item\u2019s provenance tag exactly.',
    'Never invent customer facts, guarantees, ROI promises, or compliance claims.',
    'Return valid JSON with the identical shape as the input brief.',
  ].join(' ')

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: `Deal facts:\n${JSON.stringify(
              { deal: req.deal, calculatorOutput: req.calculatorOutput, prediction: req.prediction },
            )}\n\nDeterministic brief to refine:\n${JSON.stringify(base)}`,
          },
        ],
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) return null
    const parsed = JSON.parse(content) as SalesBrief
    // Re-assert non-negotiable facts from the deterministic brief.
    return {
      ...parsed,
      stakeholder: base.stakeholder,
      primaryObjection: base.primaryObjection,
    }
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  let req: BriefRequest
  try {
    req = (await request.json()) as BriefRequest
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!req?.deal || !req?.calculatorOutput || !req?.prediction || !req?.stakeholder) {
    return NextResponse.json(
      { error: 'Missing deal, calculatorOutput, prediction or stakeholder' },
      { status: 400 },
    )
  }

  const templateBrief = generateTemplateBrief(req)
  const llmBrief = await tryLlmBrief(req, templateBrief)

  const result: BriefResult = llmBrief
    ? { mode: 'llm', brief: llmBrief }
    : { mode: 'template', brief: templateBrief }

  return NextResponse.json(result)
}
