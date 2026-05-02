import type { CardRecord, RarityKey } from './types'
import { rarityWeight, RARITY_ORDER } from './rarity'

// 定義卡包類型，加入了 boss
export type PackType = 'white' | 'gold' | 'rainbow' | 'boss'

// 建立圖片對應表，對齊你 public 資料夾下的檔名
export const PACK_IMAGES: Record<PackType, string> = {
  white: '/pack-white.png',
  gold: '/pack-gold.png',
  rainbow: '/pack-rainbow.png', // 記得將檔名的空格刪除
  boss: '/pack-boss.png'
}

function weightedPick<T>(items: T[], weights: number[], rng: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rng() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i] ?? 0
    if (r <= 0) return items[i] as T
  }
  return items[items.length - 1] as T
}

export function rollRarity(rng: () => number): RarityKey {
  const weights = RARITY_ORDER.map(rarityWeight)
  return weightedPick(RARITY_ORDER, weights, rng)
}

// 設定四種卡包的抽卡規則
export function packRules(pack: PackType): { pulls: number; minRarity: RarityKey } {
  switch (pack) {
    case 'white':
      return { pulls: 3, minRarity: 'Basic' }
    case 'gold':
      return { pulls: 4, minRarity: 'Rare' }
    case 'rainbow':
      return { pulls: 5, minRarity: 'Epic' }
    case 'boss':
      // BOSS 包設定：抽 1 張，保底 Legendary (傳奇)
      return { pulls: 1, minRarity: 'Legendary' }
    default:
      return { pulls: 3, minRarity: 'Basic' }
  }
}

export function rarityAtLeast(r: RarityKey, min: RarityKey): boolean {
  return RARITY_ORDER.indexOf(r) >= RARITY_ORDER.indexOf(min)
}

export function drawCard(
  cards: CardRecord[],
  rng: () => number,
  options?: { forceRarity?: RarityKey },
): CardRecord {
  const targetRarity = options?.forceRarity ?? rollRarity(rng)
  const pool = cards.filter((c) => c.rarity === targetRarity)
  
  if (pool.length > 0) return pool[Math.floor(rng() * pool.length)] as CardRecord

  // fallback 邏輯保持不變
  const idx = RARITY_ORDER.indexOf(targetRarity)
  for (let step = 1; step < RARITY_ORDER.length; step++) {
    const left = idx - step
    const right = idx + step
    const candidates: CardRecord[] = []
    if (left >= 0) candidates.push(...cards.filter((c) => c.rarity === RARITY_ORDER[left]))
    if (right < RARITY_ORDER.length) candidates.push(...cards.filter((c) => c.rarity === RARITY_ORDER[right]))
    if (candidates.length) return candidates[Math.floor(rng() * candidates.length)] as CardRecord
  }

  return cards[Math.floor(rng() * cards.length)] as CardRecord
}