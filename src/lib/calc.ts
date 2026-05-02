import type { CardRecord } from './types'
import { RARITY_MULTIPLIER } from './rarity'

export function baseATK(card: Pick<CardRecord, 'difficulty'>): number {
  return card.difficulty * 10
}

export function baseDEF(card: Pick<CardRecord, 'utility'>): number {
  return card.utility * 10
}

export function finalATK(card: Pick<CardRecord, 'difficulty' | 'rarity'>): number {
  return baseATK(card) * RARITY_MULTIPLIER[card.rarity]
}

export function finalDEF(card: Pick<CardRecord, 'utility' | 'rarity'>): number {
  return baseDEF(card) * RARITY_MULTIPLIER[card.rarity]
}

export function isOverPower(n: number): boolean {
  return n >= 500
}
