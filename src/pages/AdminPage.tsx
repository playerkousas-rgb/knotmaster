import React from 'react'
import { KeyRound, ShieldAlert, Sparkles, Trash2 } from 'lucide-react'
import { useAppState } from '../lib/appState'
import { generateLeaderCode, isValidLeaderCode, normalizeCode } from '../lib/leader'
import { classNames } from '../lib/utils'

export function AdminPage() {
  const { user, setUser } = useAppState()
  const [codeInput, setCodeInput] = React.useState('')
  const [message, setMessage] = React.useState<string | null>(null)

  const isSuper = user.role === 'super'

  const unlockLeader = () => {
    const normalized = normalizeCode(codeInput)
    if (!isValidLeaderCode(normalized)) {
      setMessage('領袖密碼格式不正確（範例：KNOT-1A2B-3C4D）。')
      return
    }

    const known = user.leaderPasscodes.some((x) => x.code === normalized)
    if (!known && !isSuper) {
      setMessage('此密碼不存在。請向超級管理員索取。')
      return
    }

    setUser((prev) => ({ ...prev, role: 'leader', leaderUnlockedAt: new Date().toISOString() }))
    setMessage('已解鎖 Leader：全圖鑑模式與隨機考核功能。')
    setCodeInput('')
  }

  const unlockSuper = () => {
    // For demo: local-only super unlock with a hardcoded phrase
    if (codeInput.trim() !== 'SUPER-LOCAL-ONLY') {
      setMessage('超級管理員解鎖碼錯誤（本 Demo 使用 SUPER-LOCAL-ONLY）。')
      return
    }

    setUser((prev) => ({ ...prev, role: 'super', superUnlockedAt: new Date().toISOString() }))
    setMessage('已解鎖 Super Admin：可生成領袖密碼。')
    setCodeInput('')
  }

  const generate = () => {
    if (!isSuper) {
      setMessage('僅 Super Admin 可生成領袖密碼。')
      return
    }

    const code = generateLeaderCode(user.userId)
    setUser((prev) => ({
      ...prev,
      leaderPasscodes: [{ code, createdAt: new Date().toISOString() }, ...prev.leaderPasscodes],
    }))
    setMessage('已生成一組領袖密碼。')
  }

  const removeCode = (code: string) => {
    setUser((prev) => ({ ...prev, leaderPasscodes: prev.leaderPasscodes.filter((x) => x.code !== code) }))
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-4 ring-1 ring-white/10">
        <div className="inline-flex items-center gap-2 rounded-full bg-fuchsia-400/10 px-3 py-1 text-xs text-fuchsia-100 ring-1 ring-fuchsia-300/20">
          <ShieldAlert className="h-4 w-4" />
          Permission System
        </div>
        <h1 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">權限管理</h1>
        <p className="mt-1 text-sm text-white/70">
          超級管理員可生成領袖密碼。Leader 解鎖全圖鑑模式與「隨機考核」。一般成員僅能看自己的集卡冊與抽卡。
        </p>
      </section>

      <section className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">輸入密碼</div>
            <div className="text-xs text-white/60">Leader：KNOT-XXXX-XXXX（由 Super 生成）。Super Demo：SUPER-LOCAL-ONLY。</div>
          </div>
          <div className="flex w-full max-w-xl gap-2">
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="KNOT-1A2B-3C4D"
              className="w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-sky-300/40"
            />
            <button
              onClick={unlockLeader}
              className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15"
            >
              Unlock
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={unlockSuper}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100 ring-1 ring-amber-300/20 hover:bg-amber-400/15"
          >
            <KeyRound className="h-4 w-4" />
            解鎖 Super Admin
          </button>

          <button
            onClick={() => setUser((p) => ({ ...p, role: 'member' }))}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 ring-1 ring-white/10 hover:bg-white/10"
          >
            <Trash2 className="h-4 w-4" />
            退出權限（回到 member）
          </button>
        </div>

        {message ? (
          <div className="mt-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/85 ring-1 ring-white/15">{message}</div>
        ) : null}
      </section>

      <section className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">領袖密碼</div>
            <div className="text-xs text-white/60">僅 Super Admin 可新增 / 移除。</div>
          </div>
          <button
            onClick={generate}
            className={classNames(
              'inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ring-1 transition',
              isSuper
                ? 'bg-fuchsia-400/10 text-fuchsia-100 ring-fuchsia-300/20 hover:bg-fuchsia-400/15'
                : 'bg-white/5 text-white/50 ring-white/10',
            )}
          >
            <Sparkles className="h-4 w-4" />
            生成密碼
          </button>
        </div>

        {user.leaderPasscodes.length === 0 ? (
          <div className="mt-3 rounded-2xl bg-black/25 px-4 py-10 text-center text-sm text-white/65 ring-1 ring-white/10">
            尚未生成任何密碼。
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {user.leaderPasscodes.map((x) => (
              <div key={x.code} className="flex items-center justify-between gap-3 rounded-2xl bg-black/25 px-4 py-3 ring-1 ring-white/10">
                <div>
                  <div className="font-mono text-sm text-white">{x.code}</div>
                  <div className="text-xs text-white/55">Created: {new Date(x.createdAt).toLocaleString()}</div>
                </div>
                <button
                  onClick={() => removeCode(x.code)}
                  disabled={!isSuper}
                  className={classNames(
                    'rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition',
                    isSuper
                      ? 'bg-white/10 text-white ring-white/15 hover:bg-white/15'
                      : 'bg-white/5 text-white/40 ring-white/10',
                  )}
                >
                  移除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <AssessmentPanel />
    </div>
  )
}

function AssessmentPanel() {
  const { cards, canViewAll } = useAppState()
  const [picked, setPicked] = React.useState<string | null>(null)

  const doPick = () => {
    if (cards.length === 0) return
    const idx = Math.floor(Math.random() * cards.length)
    setPicked(cards[idx]?.id ?? null)
  }

  const card = cards.find((c) => c.id === picked)

  return (
    <section className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">隨機考核</div>
          <div className="text-xs text-white/60">Leader / Super 可用：隨機抽出一張卡供現場測試。</div>
        </div>
        <button
          onClick={doPick}
          disabled={!canViewAll}
          className={classNames(
            'rounded-2xl px-4 py-3 text-sm font-semibold ring-1 transition',
            canViewAll
              ? 'bg-sky-400/10 text-sky-100 ring-sky-300/20 hover:bg-sky-400/15'
              : 'bg-white/5 text-white/40 ring-white/10',
          )}
        >
          抽一題
        </button>
      </div>

      {card ? (
        <div className="mt-3 rounded-2xl bg-black/25 p-4 ring-1 ring-white/10">
          <div className="text-xs uppercase tracking-wider text-white/60">Assessment Card</div>
          <div className="mt-1 text-lg font-semibold text-white">{card.name}</div>
          <div className="mt-2 text-sm text-white/70">請現場示範：打結流程、用途、注意事項。</div>
        </div>
      ) : (
        <div className="mt-3 rounded-2xl bg-black/25 p-4 text-sm text-white/65 ring-1 ring-white/10">
          尚未抽題。
        </div>
      )}
    </section>
  )
}
