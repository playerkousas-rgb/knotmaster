import React from 'react'
import { motion } from 'framer-motion'
import { Gift, Loader2, PartyPopper, Sparkles } from 'lucide-react'
import { useAppState } from '../lib/appState'
import { packRules, type PackType, drawCard, rarityAtLeast } from '../lib/gacha'
import { RARITY_META } from '../lib/rarity'
import { classNames } from '../lib/utils'
import type { CardRecord } from '../lib/types'
import { svgCardDataUri } from '../lib/svgCard'

function seededRng(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

export function GachaPage() {
  const { user, setUser, cards, loadingCards, loginReward } = useAppState()
  const [toast, setToast] = React.useState<string | null>(null)
  const [pulls, setPulls] = React.useState<CardRecord[]>([])
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    const r = loginReward()
    if (r.awarded.white || r.awarded.gold || r.awarded.rainbow) {
      setToast(
        `登入獎勵：白卡包 +${r.awarded.white}、金卡包 +${r.awarded.gold}、彩虹卡包 +${r.awarded.rainbow}`,
      )
      const t = window.setTimeout(() => setToast(null), 4200)
      return () => window.clearTimeout(t)
    }
    return
  }, [loginReward])

  const totalPacks = user.packs.white + user.packs.gold + user.packs.rainbow

  const doOpen = async (pack: PackType) => {
    if (busy) return
    if (loadingCards) return
    if (cards.length === 0) {
      setToast('尚無卡片資料（請在設定頁填入 Notion Token/DB，或使用 Demo）。')
      return
    }

    const have = user.packs[pack]
    if (have <= 0) {
      setToast('此卡包數量不足。')
      return
    }

    setBusy(true)
    setPulls([])

    // seed by time to feel random while stable within one open.
    const rng = seededRng(Math.floor(Date.now() / 10))
    const rule = packRules(pack)

    const opened: CardRecord[] = []
    for (let i = 0; i < rule.pulls; i++) {
      let c = drawCard(cards, rng)
      // enforce minimum rarity
      let safety = 0
      while (!rarityAtLeast(c.rarity, rule.minRarity) && safety < 50) {
        c = drawCard(cards, rng)
        safety++
      }
      opened.push(c)
    }

    // apply obtained
    setUser((prev) => {
      const nextObtained = new Set(prev.obtainedCardIds)
      for (const c of opened) nextObtained.add(c.id)

      return {
        ...prev,
        packs: { ...prev.packs, [pack]: Math.max(0, prev.packs[pack] - 1) },
        obtainedCardIds: [...nextObtained],
      }
    })

    // reveal with animation
    await new Promise((r) => setTimeout(r, 180))
    setPulls(opened)

    setToast(`已開啟 ${pack === 'white' ? '白卡包' : pack === 'gold' ? '金卡包' : '彩虹卡包'}！`)
    window.setTimeout(() => setToast(null), 4200)
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-4 ring-1 ring-white/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-400/10 px-3 py-1 text-xs text-sky-100 ring-1 ring-sky-300/20">
              <Gift className="h-4 w-4" />
              Daily login & packs
            </div>
            <h1 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">每日抽卡</h1>
            <p className="mt-1 text-sm text-white/70">
              每日登入：白卡包 +1。連續 7 天：金卡包 +1。連續 30 天：彩虹卡包 +1。
            </p>
          </div>

          <div className="rounded-2xl bg-black/30 px-4 py-3 ring-1 ring-white/10">
            <div className="text-xs text-white/60">總卡包</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{totalPacks}</div>
            <div className="mt-2 text-xs text-white/55">Streak: {user.streak} day(s)</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PackButton
            title="白卡包"
            subtitle="3 抽 • 基礎池"
            count={user.packs.white}
            tone="white"
            disabled={busy}
            onOpen={() => void doOpen('white')}
          />
          <PackButton
            title="金卡包"
            subtitle="4 抽 • Rare+"
            count={user.packs.gold}
            tone="gold"
            disabled={busy}
            onOpen={() => void doOpen('gold')}
          />
          <PackButton
            title="彩虹卡包"
            subtitle="5 抽 • Epic+"
            count={user.packs.rainbow}
            tone="rainbow"
            disabled={busy}
            onOpen={() => void doOpen('rainbow')}
          />
        </div>

        {toast ? (
          <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/85 ring-1 ring-white/15">
            {toast}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-white/70" />
            抽取結果
          </div>
          {busy || loadingCards ? (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingCards ? '載入卡片中' : '開啟中'}
            </div>
          ) : null}
        </div>

        {pulls.length === 0 ? (
          <div className="mt-3 grid place-items-center rounded-2xl bg-black/25 py-16 text-white/65 ring-1 ring-white/10">
            <div className="text-lg">開啟卡包以獲得新卡</div>
            <div className="mt-2 text-xs text-white/55">你抽到的卡會自動點亮圖鑑。</div>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pulls.map((c, idx) => {
              const meta = RARITY_META[c.rarity]
              const img = c.coverImageUrl ? c.coverImageUrl : svgCardDataUri(c)

              return (
                <motion.div
                  key={`${c.id}-${idx}`}
                  initial={{ opacity: 0, y: 10, rotate: -1 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ duration: 0.28, delay: idx * 0.05 }}
                  className={classNames(
                    'overflow-hidden rounded-2xl bg-gradient-to-br ring-1',
                    meta.bg,
                    meta.ring,
                    'shadow-xl shadow-black/35',
                  )}
                  style={{ aspectRatio: '3 / 4' }}
                >
                  <div className="relative h-full w-full">
                    <img src={img} alt={c.name} className="absolute inset-0 h-full w-full object-cover opacity-95" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="text-sm font-semibold text-white">{c.name}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={classNames('rounded-full px-2 py-0.5 text-[11px] ring-1', meta.chip)}>
                          {meta.label}
                        </span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80 ring-1 ring-white/10">
                          {c.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <PartyPopper className="h-4 w-4 text-white/70" />
          小提醒
        </div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
          <li>未填 Notion 設定時會使用內建 Demo 卡片（可直接體驗）。</li>
          <li>抽到的卡會加入「已獲得」並在圖鑑點亮。</li>
          <li>Leader / Super 解鎖後可直接查看所有卡片教學（不受剪影限制）。</li>
        </ul>
      </section>
    </div>
  )
}

function PackButton({
  title,
  subtitle,
  count,
  tone,
  disabled,
  onOpen,
}: {
  title: string
  subtitle: string
  count: number
  tone: 'white' | 'gold' | 'rainbow'
  disabled: boolean
  onOpen: () => void
}) {
  const cls =
    tone === 'white'
      ? 'from-slate-200/15 to-slate-200/5 ring-white/15'
      : tone === 'gold'
        ? 'from-amber-400/20 to-amber-400/5 ring-amber-300/25'
        : 'from-emerald-400/20 via-sky-400/15 to-fuchsia-400/15 ring-white/15'

  return (
    <button
      onClick={onOpen}
      disabled={disabled}
      className={classNames(
        'group rounded-3xl bg-gradient-to-br p-4 text-left ring-1 transition',
        cls,
        disabled ? 'opacity-60' : 'hover:translate-y-[-2px] hover:bg-white/5',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-white">{title}</div>
          <div className="mt-1 text-xs text-white/60">{subtitle}</div>
        </div>
        <div className="rounded-2xl bg-black/30 px-3 py-2 text-xs text-white/70 ring-1 ring-white/10">
          x{count}
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-black/30 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition group-hover:bg-black/40">
        Open
      </div>
    </button>
  )
}
