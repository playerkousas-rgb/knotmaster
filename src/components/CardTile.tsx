import { Link } from 'react-router-dom'
import type { CardRecord } from '../lib/types'
import { classNames, formatNumber } from '../lib/utils'
import { finalATK, finalDEF, isOverPower } from '../lib/calc'
import { RARITY_META } from '../lib/rarity'
import { svgCardDataUri } from '../lib/svgCard'

export function CardTile({
  card,
  boss,
  canViewAll,
}: {
  card: CardRecord
  boss: boolean
  canViewAll: boolean
}) {
  const meta = RARITY_META[card.rarity]
  const atk = finalATK(card)
  const def = finalDEF(card)
  const glow = isOverPower(atk) || isOverPower(def)

  const img = card.coverImageUrl ? card.coverImageUrl : svgCardDataUri(card, { boss })

  const locked = !card.obtained && !canViewAll

  return (
    <Link
      to={locked ? '#' : `/card/${card.id}`}
      onClick={(e) => {
        if (locked) e.preventDefault()
      }}
      className={classNames(
        'group relative overflow-hidden rounded-2xl bg-gradient-to-br ring-1 transition',
        meta.bg,
        meta.ring,
        locked ? 'opacity-70' : 'hover:translate-y-[-2px] hover:shadow-2xl',
        glow ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_26px_rgba(96,165,250,0.25)]' : 'shadow-xl shadow-black/30',
      )}
      style={{ aspectRatio: '3 / 4' }}
    >
      {boss ? (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-amber-400/15 px-2 py-1 text-[11px] font-semibold text-amber-100 ring-1 ring-amber-300/30">
          DAILY BOSS
        </div>
      ) : null}

      <div className="absolute inset-0">
        <img
          src={img}
          alt={card.name}
          className={classNames(
            'h-full w-full object-cover opacity-95 transition duration-500',
            locked ? 'grayscale brightness-[0.35] contrast-125' : 'group-hover:scale-[1.03]',
          )}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {locked ? (
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-2xl bg-black/50 px-4 py-3 text-center text-sm text-white/85 ring-1 ring-white/10 backdrop-blur">
            <div className="text-xs uppercase tracking-wider text-white/60">Wiki Mode</div>
            <div className="mt-1 font-semibold">未獲得：剪影</div>
          </div>
        </div>
      ) : null}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="line-clamp-2 text-sm font-semibold text-white">{card.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className={classNames('rounded-full px-2 py-0.5 text-[11px] ring-1', meta.chip)}>
                {meta.label}
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80 ring-1 ring-white/10">
                {card.category}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-black/35 px-2.5 py-2 ring-1 ring-white/10">
            <div className="text-[10px] uppercase tracking-wider text-white/60">ATK</div>
            <div className={classNames('mt-0.5 text-sm font-semibold tabular-nums', glow ? 'text-sky-100' : 'text-white')}>
              {formatNumber(Math.round(atk))}
            </div>
          </div>
          <div className="rounded-xl bg-black/35 px-2.5 py-2 ring-1 ring-white/10">
            <div className="text-[10px] uppercase tracking-wider text-white/60">DEF</div>
            <div className={classNames('mt-0.5 text-sm font-semibold tabular-nums', glow ? 'text-emerald-100' : 'text-white')}>
              {formatNumber(Math.round(def))}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </div>

      {boss ? (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-2xl ring-2 ring-amber-300/30" />
          <div className="absolute inset-0 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.25)]" />
        </div>
      ) : null}
    </Link>
  )
}
