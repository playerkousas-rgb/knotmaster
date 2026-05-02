import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Loader2, Play, Shield, Swords } from 'lucide-react'
import { useAppState } from '../lib/appState'
import { pickDailyBoss, bossBonusMultiplier } from '../lib/boss'
import { finalATK, finalDEF } from '../lib/calc'
import { RARITY_META } from '../lib/rarity'
import { svgCardDataUri } from '../lib/svgCard'
import { classNames, formatNumber, safeUrl } from '../lib/utils'
import { StatPill } from '../components/StatPill'

export function DetailPage() {
  const { id } = useParams()
  const { cards, loadingCards, canViewAll } = useAppState()

  const card = React.useMemo(() => cards.find((c) => c.id === id), [cards, id])
  const boss = React.useMemo(() => pickDailyBoss(cards), [cards])
  const isBoss = boss?.id === card?.id

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

  if (!card) {
    return (
      <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
        <div className="text-white/70">找不到該卡片。</div>
        <Link to="/collection" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/15 hover:bg-white/15">
          <ArrowLeft className="h-4 w-4" />
          回到圖鑑
        </Link>
      </div>
    )
  }

  const meta = RARITY_META[card.rarity]
  const locked = !card.obtained && !canViewAll

  const atk = finalATK(card) * (isBoss ? bossBonusMultiplier() : 1)
  const def = finalDEF(card) * (isBoss ? bossBonusMultiplier() : 1)

  const img = card.coverImageUrl ? card.coverImageUrl : svgCardDataUri(card, { boss: Boolean(isBoss) })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/75 ring-1 ring-white/10 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>

        {isBoss ? (
          <div className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-100 ring-1 ring-amber-300/20">
            今日 BOSS • +{Math.round((bossBonusMultiplier() - 1) * 100)}%
          </div>
        ) : null}
      </div>

      <div
        className={classNames(
          'overflow-hidden rounded-3xl bg-gradient-to-br p-4 ring-1',
          meta.bg,
          meta.ring,
          isBoss ? 'shadow-[0_0_0_1px_rgba(245,158,11,0.25),0_0_42px_rgba(245,158,11,0.16)]' : 'shadow-xl shadow-black/35',
        )}
      >
        <div className="grid gap-4 sm:grid-cols-[320px,1fr]">
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
            <img
              src={img}
              alt={card.name}
              className={classNames('h-full w-full object-cover', locked ? 'grayscale brightness-[0.35] contrast-125' : '')}
            />
            {locked ? (
              <div className="absolute inset-0 grid place-items-center">
                <div className="rounded-2xl bg-black/55 px-4 py-3 text-center text-sm text-white/85 ring-1 ring-white/10 backdrop-blur">
                  <div className="text-xs uppercase tracking-wider text-white/60">Wiki Mode</div>
                  <div className="mt-1 font-semibold">未獲得：教學鎖定</div>
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className={classNames('rounded-full px-3 py-1 text-xs ring-1', meta.chip)}>{meta.label}</div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10">
                {card.category}
              </div>
              {card.obtained ? (
                <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100 ring-1 ring-emerald-300/20">
                  已獲得
                </div>
              ) : (
                <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10">未獲得</div>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">{card.name}</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{card.description || '（無介紹）'}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatPill label="ATK" value={atk} tone="atk" />
              <StatPill label="DEF" value={def} tone="def" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Swords className="h-4 w-4" />
                  Difficulty ×10
                </div>
                <div className="mt-1 text-sm font-semibold text-white">{card.difficulty} × 10</div>
              </div>
              <div className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Shield className="h-4 w-4" />
                  Utility ×10
                </div>
                <div className="mt-1 text-sm font-semibold text-white">{card.utility} × 10</div>
              </div>
            </div>

            {safeUrl(card.youtubeUrl) && !locked ? (
              <a
                href={card.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
              >
                <Play className="h-4 w-4" />
                YouTube 教學
                <ExternalLink className="h-4 w-4 text-white/70" />
              </a>
            ) : (
              <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/65 ring-1 ring-white/10">
                {locked ? '解鎖全圖鑑模式後可查看教學連結。' : '未提供 YouTube 教學連結。'}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">步驟圖</div>
            <div className="text-xs text-white/60">若 Notion 的「步驟圖」欄位為空，將顯示智慧佔位。</div>
          </div>
          <div className="rounded-xl bg-black/30 px-3 py-2 text-xs text-white/70 ring-1 ring-white/10">
            ATK {formatNumber(Math.round(atk))} • DEF {formatNumber(Math.round(def))}
          </div>
        </div>

        {!locked ? (
          <div className="mt-3">
            {card.stepsImages.length === 0 ? (
              <div className="grid place-items-center rounded-2xl bg-black/25 py-14 text-white/70 ring-1 ring-white/10">
                <div className="text-lg">🛠️ 內容加入中</div>
                <div className="mt-2 text-xs text-white/55">請稍後再回來看看，或由 Leader 補上步驟圖。</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {card.stepsImages.map((u, idx) => (
                  <a
                    key={u}
                    href={u}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-2xl bg-black/25 ring-1 ring-white/10"
                  >
                    <img src={u} alt={`${card.name} step ${idx + 1}`} className="h-40 w-full object-cover transition group-hover:scale-[1.02]" />
                    <div className="px-3 py-2 text-xs text-white/70">Step {idx + 1}</div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 grid place-items-center rounded-2xl bg-black/25 py-14 text-white/70 ring-1 ring-white/10">
            解鎖後可查看步驟圖。
          </div>
        )}
      </section>
    </div>
  )
}
