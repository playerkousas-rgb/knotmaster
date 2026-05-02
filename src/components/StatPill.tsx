import { classNames } from '../lib/utils'
import { isOverPower } from '../lib/calc'

export function StatPill({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: number
  tone?: 'atk' | 'def' | 'neutral'
}) {
  const glow = isOverPower(value)
  const toneCls =
    tone === 'atk'
      ? 'from-rose-400/20 to-fuchsia-400/10 text-rose-100 ring-rose-300/25'
      : tone === 'def'
        ? 'from-sky-400/20 to-emerald-400/10 text-sky-100 ring-sky-300/25'
        : 'from-white/10 to-white/5 text-white/85 ring-white/15'

  return (
    <div
      className={classNames(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br px-3 py-2 ring-1',
        toneCls,
        glow ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_26px_rgba(96,165,250,0.28)]' : '',
      )}
    >
      {glow ? (
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-sky-400/20 blur-2xl" />
          <div className="absolute -right-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-fuchsia-400/20 blur-2xl" />
        </div>
      ) : null}
      <div className="relative flex items-baseline justify-between gap-3">
        <div className="text-[11px] uppercase tracking-wider text-white/60">{label}</div>
        <div className="text-sm font-semibold tabular-nums">{Math.round(value)}</div>
      </div>
    </div>
  )
}
