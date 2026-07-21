import type {
  BusinessValueOutput,
  DealInput,
  PredictionResponse,
} from './types'
import type { ModelFeatureRow } from './feature-engineering'
import type { SalesBrief } from './brief-schema'

export interface SavedCase {
  id: string
  name: string
  savedAt: string
  deal: DealInput
  output: BusinessValueOutput | null
  features: ModelFeatureRow[]
  prediction: PredictionResponse | null
  brief: SalesBrief | null
}

const KEY = 'saarstahl.savedCases.v1'

// Abstracted storage so the module is testable outside the browser.
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

function getStore(store?: StorageLike): StorageLike | null {
  if (store) return store
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  return null
}

export function loadCases(store?: StorageLike): SavedCase[] {
  const s = getStore(store)
  if (!s) return []
  try {
    const raw = s.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SavedCase[]) : []
  } catch {
    return []
  }
}

function persist(cases: SavedCase[], store?: StorageLike): void {
  const s = getStore(store)
  if (!s) return
  s.setItem(KEY, JSON.stringify(cases))
}

export function saveCase(
  input: Omit<SavedCase, 'id' | 'savedAt'> & { id?: string },
  store?: StorageLike,
): SavedCase[] {
  const cases = loadCases(store)
  const now = new Date().toISOString()
  const id =
    input.id ??
    (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `case_${Date.now()}`)

  const record: SavedCase = {
    id,
    name: input.name,
    savedAt: now,
    deal: input.deal,
    output: input.output,
    features: input.features,
    prediction: input.prediction,
    brief: input.brief,
  }

  const existingIdx = cases.findIndex((c) => c.id === id)
  if (existingIdx >= 0) {
    cases[existingIdx] = record
  } else {
    cases.unshift(record)
  }
  persist(cases, store)
  return cases
}

export function renameCase(
  id: string,
  name: string,
  store?: StorageLike,
): SavedCase[] {
  const cases = loadCases(store).map((c) =>
    c.id === id ? { ...c, name } : c,
  )
  persist(cases, store)
  return cases
}

export function deleteCase(id: string, store?: StorageLike): SavedCase[] {
  const cases = loadCases(store).filter((c) => c.id !== id)
  persist(cases, store)
  return cases
}

/** In-memory StorageLike implementation for tests. */
export function createMemoryStore(): StorageLike {
  const map = new Map<string, string>()
  return {
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k, v) => {
      map.set(k, v)
    },
    removeItem: (k) => {
      map.delete(k)
    },
  }
}
