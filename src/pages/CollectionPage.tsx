import React from 'react'
import { Filter, Loader2, SortAsc, SortDesc, Sparkles } from 'lucide-react'
import { useAppState } from '../lib/appState'
import type { CardRecord, KnotCategory } from '../lib/types'
import { pickDailyBoss, bossBonusMultiplier } from '../lib/boss'
import { CardTile } from '../components/CardTile'
import { classNames } from '../lib/utils'
import { finalATK, finalDEF } from '../lib/calc'

type SortKey = 'name' | 'atk' | 'def'

const CATEGORIES: KnotCategory[] = [
  'Fixed Loop',
  'Bend',
  'Hitch',
  'Binding',
  'Stopper',
  'Decorative',
  'Other',
]

export function CollectionPage() {
  const { cards, loadingCards, canViewAll } = useAppState()
  const [category, setCategory] = React.useState<KnotCategory | 'All'>('All')
  const [sortKey, setSortKey] = React.useState<SortKey>('name')
  const [desc, setDesc] = React.useState(true)

  const boss = React.useMemo(() => pickDailyBoss(cards), [cards])

  const visible = React.useMemo(() => {
    let list = cards
    if (category !== 'All') list = list.filter((c) => c.category === category)

    const withComputed = list.map((c) => {
      const isBoss = boss?.id === c.id
      const atk = finalATK(c) * (isBoss ? bossBonusMultiplier() : 1)
      const def = finalDEF(c) * (isBoss ? bossBonusMultiplier() : 1)
      return { c, atk, def, isBoss }
    })

    withComputed.sort((a, b) => {
      if (sortKey === 'name') return a.c.name.localeCompare(b.c.name)
      if (sortKey === 'atk') return a.atk - b.atk
      return a.def - b.def
    })

    if (desc) withComputed.reverse()

    return withComputed
  }, [cards, category, sortKey, desc, boss])

  const obtainedCount = cards.filter((c) => c.obtained).length

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-4 ring-1 ring-white/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100 ring-1 ring-emerald-300/20">
              <Sparkles className="h-4 w-4" />
              WikiGacha • Collection
            </div>
            <h1 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              繩結圖鑑（剪影點亮）
            </h1>
            <p className="mt-1 text-sm text-white/70">
              卡片數值由 Notion 驅動：ATK = Difficulty×10、DEF = Utility×10，再乘上稀有度倍率。
            </p>
          </div>
          <div className="hidden shrink-0 sm:block">
            <div className="rounded-2xl bg-black/30 px-4 py-3 ring-1 ring-white/10">
              <div className="text-xs text-white/60">已獲得</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">
                {obtainedCount}
                <span className="text-base text-white/50">/{cards.length}</span>
              </div>
            </div>
          </div>
        </div>

        {boss ? (
          <div className="mt-4 rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100 ring-1 ring-amber-300/20">
            今日 BOSS：<span className="font-semibold text-white">{boss.name}</span>（當天獲得額外 +{Math.round((bossBonusMultiplier() - 1) * 100)}%
            數值加成與特殊邊框）
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Filter className="h-4 w-4 text-white/70" />
                分類
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => setCategory('All')}
                className={classNames(
                  'rounded-full px-3 py-1.5 text-xs ring-1 transition',
                  category === 'All'
                    ? 'bg-white/10 text-white ring-white/15'
                    : 'bg-white/5 text-white/70 ring-white/10 hover:bg-white/10',
                )}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={classNames(
                    'rounded-full px-3 py-1.5 text-xs ring-1 transition',
                    category === c
                      ? 'bg-white/10 text-white ring-white/15'
                      : 'bg-white/5 text-white/70 ring-white/10 hover:bg-white/10',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SortAsc className="h-4 w-4 text-white/70" />
              排序
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(
                [
                  { key: 'name', label: 'Name' },
                  { key: 'atk', label: 'ATK' },
                  { key: 'def', label: 'DEF' },
                ] as const
              ).map((x) => (
                <button
                  key={x.key}
                  onClick={() => setSortKey(x.key)}
                  className={classNames(
                    'rounded-xl px-3 py-2 text-xs ring-1 transition',
                    sortKey === x.key
                      ? 'bg-white/10 text-white ring-white/15'
                      : 'bg-white/5 text-white/70 ring-white/10 hover:bg-white/10',
                  )}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-sm font-semibold">
              {desc ? (
                <SortDesc className="h-4 w-4 text-white/70" />
              ) : (
                <SortAsc className="h-4 w-4 text-white/70" />
              )}
              方向
            </div>
            <div className="mt-2">
              <button
                onClick={() => setDesc((d) => !d)}
                className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold ring-1 ring-white/15 transition hover:bg-white/15"
              >
                {desc ? 'High → Low' : 'Low → High'}
              </button>
              <div className="mt-2 text-xs text-white/60">
                提示：未獲得卡片會以剪影顯示（Leader / Super 可看全部教學）。
              </div>
            </div>
          </div>
        </div>
      </section>

      {loadingCards ? (
        <div className="grid place-items-center rounded-3xl bg-white/5 py-16 ring-1 ring-white/10">
          <div className="flex items-center gap-3 text-white/80">
            <Loader2 className="h-5 w-5 animate-spin" />
            正在從 Notion 載入卡片...
          </div>
        </div>
      ) : (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-white/70">
              顯示 <span className="font-semibold text-white">{visible.length}</span> 張卡
            </div>
            <div className="sm:hidden">
              <div className="rounded-xl bg-black/30 px-3 py-2 text-xs text-white/70 ring-1 ring-white/10">
                已獲得 <span className="font-semibold text-white">{obtainedCount}</span>/{cards.length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map(({ c, isBoss }) => (
              <CardTile key={c.id} card={c} boss={isBoss} canViewAll={canViewAll} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export function applyObtained(cards: CardRecord[], obtainedIds: string[]): CardRecord[] {
  const set = new Set(obtainedIds)
  return cards.map((c) => ({ ...c, obtained: set.has(c.id) }))
}
