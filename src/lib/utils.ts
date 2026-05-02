export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function formatNumber(n: number): string {
  return Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)
}

export function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function hashStringToInt(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function pickBySeed<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length] as T
}

export function safeUrl(u?: string): string | undefined {
  if (!u) return undefined
  try {
    const url = new URL(u)
    return url.toString()
  } catch {
    return undefined
  }
}

export function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
