import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Loader2, PartyPopper, Sparkles, Flame } from 'lucide-react'
import { useAppState } from '../lib/appState'
import { packRules, type PackType, drawCard, rarityAtLeast, PACK_IMAGES } from '../lib/gacha'
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
    // 這裡我們只顯示基礎獎勵提示，BOSS 包由特殊邏輯觸發
    if (r.awarded.white || r.awarded.gold || r.awarded.rainbow) {
      setToast(
        `登入獎勵：白卡包 +${r.awarded.white}、金卡包 +${r.awarded.gold}、彩虹卡包 +${r.awarded.rainbow}`,
      )
      const t = window.setTimeout(() => setToast(null), 4200)
      return () => window.clearTimeout(t)
    }
    return
  }, [loginReward])

  // 計算總卡包數量 (包含 boss)
  const totalPacks = user.packs.white + user.packs.gold + user.packs.rainbow + (user.packs.boss || 0)

  const doOpen = async (pack: PackType) => {
    if (busy) return
    if (loadingCards) return
    if (cards.length === 0) {
      setToast('尚無卡片資料（請在設定頁填入 Notion Token/DB，或使用 Demo）。')
      return
    }

    // 關鍵修正：解決 TS7053，確保 boss 包存在於判斷中
    const have = user.packs[pack] || 0
    if (have <= 0) {
      setToast('此卡包數量不足。')
      return
    }

    setBusy(true)
    setPulls([])

    const rng = seededRng(Math.floor(Date.now() / 10))
    const rule = packRules(pack)

    const opened: CardRecord[] = []
    for (let i = 0; i < rule.pulls; i++) {
      let c = drawCard(cards, rng)
      let safety = 0
      while (!rarityAtLeast(c.rarity, rule.minRarity) && safety < 50) {
        c = drawCard(cards, rng)
        safety++
      }
      opened.push(c)
    }

    setUser((prev) => {
      const nextObtained = new Set(prev.obtainedCardIds)
      for (const c of opened) nextObtained.add(c.id)

      return {
        ...prev,
        packs: { ...prev.packs, [pack]: Math.max(0, (prev.packs[pack] || 0) - 1) },
        obtainedCardIds: [...nextObtained],
      }
    })

    await new Promise((r) => setTimeout(r, 200))
    setPulls(opened)

    const packName = pack === 'white' ? '白卡包' : pack === 'gold' ? '金卡包' : pack === 'rainbow' ? '彩虹卡包' : 'BOSS 特殊包'
    setToast(`已開啟 ${packName}！`)
    window.setTimeout(() => setToast(null), 4200)
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-4 ring-1 ring-white/10 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-400/10 px-3 py-1 text-xs text-sky-100 ring-1 ring-sky-300/20">
              <Gift className="h-4 w-4" />
              WikiGacha System v2.0
            </div>
            <h1 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl italic font-black">
              KNOT GACHA <span className="text-indigo-400">倉庫</span>
            </h1>
            <p className="mt-1 text-sm text-white/70">
              BOSS 包：每日隨機產生。保底傳奇以上。
            </p>
          </div>

          <div className="rounded-2xl bg-black/30 px-4 py-3 ring-1 ring-white/10 text-right">
            <div className="text-xs text-white/60 uppercase tracking-widest">Total Packs</div>
            <div className="mt-1 text-2xl font-black tabular-nums text-indigo-400">{totalPacks}</div>
            <div className="mt-2 text-[10px] text-white/40 uppercase">Streak: {user.streak} Days</div>
          </div>
        </div>

        {/* 四種卡包按鈕區域 */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          {/* 新增 BOSS 包按鈕 */}
          <PackButton
            title="BOSS 包"
            subtitle="1 抽 • Legendary+"
            count={user.packs.boss || 0}
            tone="boss"
            disabled={busy}
            onOpen={() => void doOpen('boss')}
          />
        </div>

        {toast ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl bg-indigo-500/20 px-4 py-3 text-sm text-indigo-100 ring-1 ring-indigo-500/30"
          >
            {toast}
          </motion.div>
        ) : null}
      </section>

      {/* 抽取結果 */}
      <section className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/80 uppercase tracking-widest">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Result
          </div>
          {busy || loadingCards ? (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          ) : null}
        </div>

        {pulls.length === 0 ? (
          <div className="mt-3 grid place-items-center rounded-2xl bg-black/25 py-20 text-white/40 ring-1 ring-white/5 border border-dashed border-white/10">
            <div className="text-lg font-medium">開啟卡包以獲得新卡</div>
            <div className="mt-2 text-xs">抽到的卡會自動點亮圖鑑。</div>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {pulls.map((c, idx) => {
              const meta = RARITY_META[c.rarity]
              const img = c.coverImageUrl ? c.coverImageUrl : svgCardDataUri(c)

              return (
                <motion.div
                  key={`${c.id}-${idx}`}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1, type: 'spring' }}
                  className={classNames(
                    'overflow-hidden rounded-2xl bg-gradient-to-br ring-1',
                    meta.bg,
                    meta.ring,
                    'shadow-2xl shadow-black/50',
                  )}
                  style={{ aspectRatio: '3 / 4' }}
                >
                  <div className="relative h-full w-full group">
                    <img src={img} alt={c.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="text-sm font-bold text-white truncate">{c.name}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={classNames('rounded-full px-2 py-0.5 text-[10px] font-black uppercase ring-1', meta.chip)}>
                          {meta.label}
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
  tone: 'white' | 'gold' | 'rainbow' | 'boss'
  disabled: boolean
  onOpen: () => void
}) {
  const cls =
    tone === 'white'
      ? 'from-slate-200/15 to-slate-200/5 ring-white/15'
      : tone === 'gold'
        ? 'from-amber-400/20 to-amber-400/5 ring-amber-300/25'
        : tone === 'rainbow'
          ? 'from-emerald-400/20 via-sky-400/15 to-fuchsia-400/15 ring-white/15'
          : 'from-amber-600/30 to-red-600/20 ring-amber-500/40 border border-amber-500/20' // BOSS 包顏色

  return (
    <button
      onClick={onOpen}
      disabled={disabled || count <= 0}
      className={classNames(
        'group relative overflow-hidden rounded-3xl bg-gradient-to-br p-4 text-left ring-1 transition-all duration-300',
        cls,
        disabled || count <= 0 ? 'opacity-40 grayscale' : 'hover:translate-y-[-4px] hover:shadow-xl hover:shadow-indigo-500/10',
      )}
    >
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight text-white">{title}</span>
            {tone === 'boss' && <Flame className="h-4 w-4 text-amber-500 animate-pulse" />}
          </div>
          <div className="mt-1 text-[10px] font-medium text-white/50 uppercase tracking-widest">{subtitle}</div>
        </div>
        <div className="rounded-xl bg-black/40 px-2 py-1 text-xs font-bold text-white/80 ring-1 ring-white/10 backdrop-blur-sm">
          x{count}
        </div>
      </div>

      <div className="mt-6 aspect-square relative z-10 w-full rounded-2xl overflow-hidden bg-black/20 ring-1 ring-white/5">
        <img 
          src={PACK_IMAGES[tone]} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="mt-4 rounded-2xl bg-white/10 px-4 py-2 text-center text-xs font-black uppercase tracking-widest text-white ring-1 ring-white/10 transition group-hover:bg-white/20">
        Open Pack
      </div>
    </button>
  )
}
