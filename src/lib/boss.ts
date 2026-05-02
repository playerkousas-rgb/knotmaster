import type { CardRecord } from './types'
import { dateKey, hashStringToInt, pickBySeed } from './utils'

export function pickDailyBoss(cards: CardRecord[], today = new Date()): CardRecord | null {
  if (cards.length === 0) return null
  const seed = hashStringToInt(dateKey(today))
  return pickBySeed(cards, seed)
}

export function bossBonusMultiplier(): number {
  return 1.15
}
