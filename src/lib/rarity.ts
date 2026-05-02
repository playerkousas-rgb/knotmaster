import type { RarityKey } from './types'

export const RARITY_ORDER: RarityKey[] = [
  'Basic',
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
  'Mythic',
  'Eternal',
]

export const RARITY_MULTIPLIER: Record<RarityKey, number> = {
  Basic: 1.0,
  Common: 1.1,
  Uncommon: 1.25,
  Rare: 1.5,
  Epic: 2.0,
  Legendary: 2.8,
  Mythic: 3.6,
  Eternal: 5.0,
}

export const RARITY_META: Record<
  RarityKey,
  {
    label: string
    ring: string
    bg: string
    chip: string
    text: string
    gradient: string
  }
> = {
  Basic: {
    label: 'Basic',
    ring: 'ring-white/10',
    bg: 'from-slate-900/60 to-slate-800/20',
    chip: 'bg-slate-500/15 text-slate-200 ring-1 ring-white/10',
    text: 'text-slate-100',
    gradient: 'from-slate-400 to-slate-200',
  },
  Common: {
    label: 'Common',
    ring: 'ring-emerald-400/25',
    bg: 'from-emerald-950/40 to-slate-900/30',
    chip: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/25',
    text: 'text-emerald-50',
    gradient: 'from-emerald-300 to-emerald-100',
  },
  Uncommon: {
    label: 'Uncommon',
    ring: 'ring-cyan-400/25',
    bg: 'from-cyan-950/40 to-slate-900/30',
    chip: 'bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/25',
    text: 'text-cyan-50',
    gradient: 'from-cyan-300 to-cyan-100',
  },
  Rare: {
    label: 'Rare',
    ring: 'ring-blue-400/25',
    bg: 'from-blue-950/40 to-slate-900/30',
    chip: 'bg-blue-500/15 text-blue-200 ring-1 ring-blue-400/25',
    text: 'text-blue-50',
    gradient: 'from-blue-300 to-blue-100',
  },
  Epic: {
    label: 'Epic',
    ring: 'ring-violet-400/30',
    bg: 'from-violet-950/45 to-slate-900/30',
    chip: 'bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/30',
    text: 'text-violet-50',
    gradient: 'from-violet-300 to-violet-100',
  },
  Legendary: {
    label: 'Legendary',
    ring: 'ring-amber-400/30',
    bg: 'from-amber-950/45 to-slate-900/30',
    chip: 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30',
    text: 'text-amber-50',
    gradient: 'from-amber-300 to-amber-100',
  },
  Mythic: {
    label: 'Mythic',
    ring: 'ring-fuchsia-400/35',
    bg: 'from-fuchsia-950/50 to-slate-900/30',
    chip: 'bg-fuchsia-500/15 text-fuchsia-200 ring-1 ring-fuchsia-400/35',
    text: 'text-fuchsia-50',
    gradient: 'from-fuchsia-300 to-fuchsia-100',
  },
  Eternal: {
    label: 'Eternal',
    ring: 'ring-sky-300/50',
    bg: 'from-sky-950/55 to-slate-900/30',
    chip: 'bg-sky-400/15 text-sky-100 ring-1 ring-sky-300/50',
    text: 'text-sky-50',
    gradient: 'from-sky-200 via-violet-200 to-emerald-200',
  },
}

export function rarityWeight(r: RarityKey): number {
  switch (r) {
    case 'Basic':
      return 48
    case 'Common':
      return 28
    case 'Uncommon':
      return 12
    case 'Rare':
      return 6
    case 'Epic':
      return 3
    case 'Legendary':
      return 1.5
    case 'Mythic':
      return 0.45
    case 'Eternal':
      return 0.05
    default:
      return 1
  }
}
