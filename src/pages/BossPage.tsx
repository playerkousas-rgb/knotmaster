import React from 'react'
import { Flame, Loader2, Swords } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppState } from '../lib/appState'
import { pickDailyBoss, bossBonusMultiplier } from '../lib/boss'
import { finalATK, finalDEF } from '../lib/calc'
import { RARITY_META } from '../lib/rarity'
import { svgCardDataUri } from '../lib/svgCard'
import { classNames, formatNumber } from '../lib/utils'

export function BossPage() {
  const { cards, loadingCards } = useAppState()

  const boss = React.useMemo(() => pickDailyBoss(cards), [cards])

  if (loadingCards) {
    return (
      <div className="grid place-items-center rounded-3xl bg-white/5 py-16 ring-1 ring-white/10">
        <div className="flex items-center gap-3 text-white/80">
          <Loader2 className="h-5 w-5 animate-spin" />
          載入中...
        </div>
      </div>
    )
  }

  if (!boss) {
    return (
      <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
        <div className="text-white/70">沒有卡片資料可選 BOSS。</div>
        <Link to="/settings" className="mt-4 inline-flex rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/15 hover:bg-white/15">
          前往設定
        </Link>
      </div>
    )
  }

  const meta = RARITY_META[boss.rarity]
  const atk = finalATK(boss) * bossBonusMultiplier()
  const def = finalDEF(boss) * bossBonusMultiplier()

  const img = boss.coverImageUrl ? boss.coverImageUrl : svgCardDataUri(boss, { boss: true })

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-br from-amber-400/15 to-white/5 p-4 ring-1 ring-amber-300/25">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-100 ring-1 ring-amber-300/20">
          <Flame className="h-4 w-4" />
          Daily BOSS
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{boss.name}</h1>
        <p className="mt-1 text-sm text-white/70">
          每天自動選出一張繩結作為 BOSS。當天此卡獲得 +{Math.round((bossBonusMultiplier() - 1) * 100)}%
          數值加成與特殊邊框。
        </p>
      </section>

      <section
        className={classNames(
          'overflow-hidden rounded-3xl bg-gradient-to-br p-4 ring-1 shadow-xl shadow-black/35',
          meta.bg,
          meta.ring,
        )}
      >
        <div className="grid gap-4 sm:grid-cols-[320px,1fr]">
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
            <img src={img} alt={boss.name} className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={classNames('rounded-full px-3 py-1 text-xs ring-1', meta.chip)}>{meta.label}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10">
                {boss.category}
              </span>
              <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-100 ring-1 ring-amber-300/20">
                +{Math.round((bossBonusMultiplier() - 1) * 100)}%
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Swords className="h-4 w-4" />
                  ATK
                </div>
                <div className="mt-1 text-xl font-semibold tabular-nums text-white">{formatNumber(Math.round(atk))}</div>
              </div>
              <div className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Swords className="h-4 w-4" />
                  DEF
                </div>
                <div className="mt-1 text-xl font-semibold tabular-nums text-white">{formatNumber(Math.round(def))}</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-black/20 p-3 text-sm text-white/70 ring-1 ring-white/10">
              <div className="text-sm font-semibold text-white">事件說明</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>抽卡與圖鑑中，BOSS 卡會顯示特殊邊框。</li>
                <li>數值破 500 會觸發額外發光特效。</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Link
        to={`/card/${boss.id}`}
        className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
      >
        查看詳情
      </Link>
    </div>
  )
}
