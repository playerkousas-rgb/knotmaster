import { hashStringToInt } from './utils'

export function normalizeCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '-')
}

export function isValidLeaderCode(code: string): boolean {
  // Simple format: KNOT-XXXX-XXXX
  return /^KNOT-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalizeCode(code))
}

export function generateLeaderCode(seed: string): string {
  const h = hashStringToInt(seed + ':' + Date.now())
  const a = (h & 0xffff).toString(16).toUpperCase().padStart(4, '0')
  const b = ((h >>> 16) & 0xffff).toString(16).toUpperCase().padStart(4, '0')
  return `KNOT-${a}-${b}`.replace(/[^A-Z0-9-]/g, '0')
}
