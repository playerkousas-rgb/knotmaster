import React from 'react'
import { DatabaseZap, RefreshCw, Save, Wand2 } from 'lucide-react'
import { useAppState } from '../lib/appState'
import { classNames } from '../lib/utils'

export function SettingsPage() {
  const { cfg, setCfg, reloadCards, loadingCards } = useAppState()
  const [token, setToken] = React.useState(cfg.notionToken ?? '')
  const [cardsDb, setCardsDb] = React.useState(cfg.cardsDb ?? '')
  const [learningDb, setLearningDb] = React.useState(cfg.learningDb ?? '')
  const [badgesDb, setBadgesDb] = React.useState(cfg.badgesDb ?? '')
  const [msg, setMsg] = React.useState<string | null>(null)

  const save = async () => {
    const next = {
      notionToken: token.trim() || undefined,
      cardsDb: cardsDb.trim() || undefined,
      learningDb: learningDb.trim() || undefined,
      badgesDb: badgesDb.trim() || undefined,
    }
    setCfg(next)
    setMsg('已儲存設定。正在重新載入 Notion 資料...')
    try {
      await reloadCards()
      setMsg('完成：已重新載入卡片。')
    } catch (e) {
      setMsg(`載入失敗：${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const resetDemo = async () => {
    setToken('')
    setCardsDb('')
    setLearningDb('')
    setBadgesDb('')
    setCfg({})
    setMsg('已切換回 Demo 資料。')
    await reloadCards()
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-4 ring-1 ring-white/10">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-400/10 px-3 py-1 text-xs text-sky-100 ring-1 ring-sky-300/20">
          <DatabaseZap className="h-4 w-4" />
          Notion API
        </div>
        <h1 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">後台設定</h1>
        <p className="mt-1 text-sm text-white/70">
          本前端可直接查詢 Notion Databases（Cards / Learning / Badges）。為了在前端執行，本 Demo 將 Token
          存在瀏覽器 localStorage；正式上線建議改為 Serverless Proxy。
        </p>
      </section>

      <section className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Notion Integration Token" value={token} onChange={setToken} placeholder="secret_..." />
          <Field label="Cards DB ID" value={cardsDb} onChange={setCardsDb} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          <Field label="Learning DB ID" value={learningDb} onChange={setLearningDb} placeholder="(optional)" />
          <Field label="Badges DB ID" value={badgesDb} onChange={setBadgesDb} placeholder="(optional)" />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => void save()}
            className={classNames(
              'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ring-1 transition',
              loadingCards
                ? 'bg-white/5 text-white/50 ring-white/10'
                : 'bg-white/10 text-white ring-white/15 hover:bg-white/15',
            )}
            disabled={loadingCards}
          >
            <Save className="h-4 w-4" />
            儲存並重新載入
          </button>
          <button
            onClick={() => void reloadCards()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-400/10 px-4 py-3 text-sm font-semibold text-sky-100 ring-1 ring-sky-300/20 hover:bg-sky-400/15"
          >
            <RefreshCw className="h-4 w-4" />
            重新載入
          </button>
          <button
            onClick={() => void resetDemo()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/20 hover:bg-emerald-400/15"
          >
            <Wand2 className="h-4 w-4" />
            使用 Demo 資料
          </button>
        </div>

        {msg ? (
          <div className="mt-3 rounded-2xl bg-black/25 px-4 py-3 text-sm text-white/75 ring-1 ring-white/10">{msg}</div>
        ) : null}
      </section>

      <section className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="text-sm font-semibold text-white">資料結構建議（Notion）</div>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <HintCard
            title="Cards"
            lines={[
              'Name (title)',
              'Category (select)',
              'Difficulty (number)',
              'Utility (number)',
              'Rarity (select)',
              'Description (rich text)',
              'YouTube (url/rich text)',
              'Image (files)',
              'Steps (files)',
            ]}
          />
          <HintCard title="Learning" lines={['UserId (text)', 'CardId (text)', 'Status (select)', 'Notes (rich text)']} />
          <HintCard title="Badges" lines={['UserId (text)', 'Key (text)', 'Label (text)', 'EarnedAt (date)']} />
        </div>
      </section>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-white/65">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-sky-300/40"
      />
    </label>
  )
}

function HintCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-2xl bg-black/25 p-4 ring-1 ring-white/10">
      <div className="text-sm font-semibold text-white">{title}</div>
      <ul className="mt-2 space-y-1 text-xs text-white/65">
        {lines.map((l) => (
          <li key={l} className="font-mono">
            {l}
          </li>
        ))}
      </ul>
    </div>
  )
}
