import type { CardRecord } from './types'
import { finalATK, finalDEF, isOverPower } from './calc'
import { RARITY_META } from './rarity'

function esc(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function svgCardDataUri(card: CardRecord, opts?: { boss?: boolean }): string {
  const atk = Math.round(finalATK(card))
  const def = Math.round(finalDEF(card))
  const meta = RARITY_META[card.rarity]
  const glow = isOverPower(atk) || isOverPower(def)

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1120" viewBox="0 0 800 1120">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1220"/>
      <stop offset="0.55" stop-color="#0a152a"/>
      <stop offset="1" stop-color="#050816"/>
    </linearGradient>
    <linearGradient id="rar" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.02"/>
    </linearGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.45"/>
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="#60A5FA" flood-opacity="0.65"/>
      <feDropShadow dx="0" dy="0" stdDeviation="28" flood-color="#A855F7" flood-opacity="0.55"/>
      <feDropShadow dx="0" dy="0" stdDeviation="36" flood-color="#22C55E" flood-opacity="0.35"/>
    </filter>
  </defs>

  <rect x="0" y="0" width="800" height="1120" rx="56" fill="url(#bg)"/>
  <rect x="32" y="32" width="736" height="1056" rx="44" fill="url(#rar)" opacity="0.9"/>

  ${opts?.boss ? '<rect x="22" y="22" width="756" height="1076" rx="52" fill="none" stroke="#F59E0B" stroke-width="6" opacity="0.85"/>' : ''}

  <g filter="url(#soft)">
    <rect x="64" y="92" width="672" height="420" rx="34" fill="#0b1020" opacity="0.92"/>
    <path d="M112 416c84-188 152-140 240-56s176 132 336-112" fill="none" stroke="#93C5FD" stroke-opacity="0.5" stroke-width="18" stroke-linecap="round"/>
    <path d="M138 404c112-160 170-90 248-18 78 72 186 110 324-102" fill="none" stroke="#34D399" stroke-opacity="0.32" stroke-width="12" stroke-linecap="round"/>
  </g>

  <g ${glow ? 'filter="url(#glow)"' : ''}>
    <text x="84" y="610" font-family="ui-sans-serif, system-ui" font-size="44" fill="#E5E7EB" font-weight="700">${esc(
      card.name,
    )}</text>
  </g>

  <text x="84" y="664" font-family="ui-sans-serif, system-ui" font-size="24" fill="#9CA3AF">${esc(
    card.category,
  )} • ${esc(meta.label)}</text>

  <g>
    <rect x="84" y="712" width="632" height="142" rx="28" fill="#0a0f1d" opacity="0.92"/>

    <text x="120" y="776" font-family="ui-sans-serif, system-ui" font-size="22" fill="#9CA3AF">ATK</text>
    <text x="120" y="828" font-family="ui-sans-serif, system-ui" font-size="54" fill="#E5E7EB" font-weight="800">${atk}</text>

    <text x="420" y="776" font-family="ui-sans-serif, system-ui" font-size="22" fill="#9CA3AF">DEF</text>
    <text x="420" y="828" font-family="ui-sans-serif, system-ui" font-size="54" fill="#E5E7EB" font-weight="800">${def}</text>

    <rect x="84" y="882" width="632" height="146" rx="28" fill="#0a0f1d" opacity="0.86"/>
    <text x="120" y="940" font-family="ui-sans-serif, system-ui" font-size="22" fill="#9CA3AF">Difficulty ×10</text>
    <text x="120" y="994" font-family="ui-sans-serif, system-ui" font-size="34" fill="#E5E7EB" font-weight="700">${card.difficulty} × 10</text>

    <text x="420" y="940" font-family="ui-sans-serif, system-ui" font-size="22" fill="#9CA3AF">Utility ×10</text>
    <text x="420" y="994" font-family="ui-sans-serif, system-ui" font-size="34" fill="#E5E7EB" font-weight="700">${card.utility} × 10</text>

    <text x="84" y="1064" font-family="ui-sans-serif, system-ui" font-size="20" fill="#9CA3AF">Rarity Multiplier: ×${RARITY_MULTIPLIER_FORMAT(
      card.rarity,
    )}${opts?.boss ? ' • BOSS day bonus' : ''}</text>
  </g>
</svg>`

  const encoded = encodeURIComponent(svg)
    .replaceAll('%0A', '')
    .replaceAll('%20', ' ')
    .replaceAll('%3D', '=')
    .replaceAll('%3A', ':')
    .replaceAll('%2F', '/')
    .replaceAll('%2C', ',')

  return `data:image/svg+xml;charset=utf-8,${encoded}`
}

function RARITY_MULTIPLIER_FORMAT(rarity: CardRecord['rarity']): string {
  const map: Record<string, string> = {
    Basic: '1.0',
    Common: '1.1',
    Uncommon: '1.25',
    Rare: '1.5',
    Epic: '2.0',
    Legendary: '2.8',
    Mythic: '3.6',
    Eternal: '5.0',
  }
  return map[rarity] ?? '1.0'
}
