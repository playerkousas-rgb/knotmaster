import React from 'react'
import type { CardRecord, Role, UserState } from './types'
import { loadUserState, saveUserState } from './storage'
import { dateKey } from './utils'
import { fetchCards, type NotionConfig } from './notion'
import { applyObtained } from '../pages/CollectionPage'

// 1. 在 AppCtx 型別定義中，補上 awarded.boss (雖然登入不一定送，但型別要對齊)
type AppCtx = {
  cfg: NotionConfig
  setCfg: (cfg: NotionConfig) => void
  user: UserState
  setUser: (next: UserState | ((prev: UserState) => UserState)) => void
  cards: CardRecord[]
  loadingCards: boolean
  reloadCards: () => Promise<void>
  canViewAll: boolean
  loginReward: () => { awarded: { white: number; gold: number; rainbow: number; boss: number }; streak: number }
  setRole: (role: Role) => void
}

const Ctx = React.createContext<AppCtx | null>(null)

const CFG_KEY = 'knotgacha:cfg:v1'

function loadCfg(): NotionConfig {
  const raw = localStorage.getItem(CFG_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as NotionConfig
  } catch {
    return {}
  }
}

function saveCfg(cfg: NotionConfig): void {
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg))
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [cfg, _setCfg] = React.useState<NotionConfig>(() => loadCfg())
  const [user, _setUser] = React.useState<UserState>(() => loadUserState())
  const [cards, setCards] = React.useState<CardRecord[]>([])
  const [loadingCards, setLoadingCards] = React.useState(true)

  const setCfg: AppCtx['setCfg'] = (next) => {
    _setCfg(next)
    saveCfg(next)
  }

  const setUser: AppCtx['setUser'] = (next) => {
    _setUser((prev) => {
      const computed = typeof next === 'function' ? (next as (p: UserState) => UserState)(prev) : next
      saveUserState(computed)
      return computed
    })
  }

  const reloadCards = React.useCallback(async () => {
    setLoadingCards(true)
    try {
      const result = await fetchCards(cfg)
      setCards(applyObtained(result, user.obtainedCardIds))
    } finally {
      setLoadingCards(false)
    }
  }, [cfg, user.obtainedCardIds])

  React.useEffect(() => {
    void reloadCards()
  }, [reloadCards])

  const canViewAll = user.role === 'leader' || user.role === 'super'

  // 2. 在 loginReward 邏輯中補上 boss
  const loginReward = React.useCallback(() => {
    const todayKey = dateKey(new Date())
    // 預設登入獎勵增加 boss 欄位
    let awarded = { white: 0, gold: 0, rainbow: 0, boss: 0 }

    setUser((prev) => {
      if (prev.lastLoginDate === todayKey) return prev

      const yesterdayKey = dateKey(new Date(Date.now() - 24 * 60 * 60 * 1000))
      const streak = prev.lastLoginDate === yesterdayKey ? prev.streak + 1 : 1

      // 這裡你可以自行決定要不要透過登入送 BOSS 包，目前先設為 0
      awarded = { 
        white: 1, 
        gold: streak % 7 === 0 ? 1 : 0, 
        rainbow: streak % 30 === 0 ? 1 : 0,
        boss: 0 
      }

      return {
        ...prev,
        lastLoginDate: todayKey,
        streak,
        packs: {
          white: prev.packs.white + awarded.white,
          gold: prev.packs.gold + awarded.gold,
          rainbow: prev.packs.rainbow + awarded.rainbow,
          boss: (prev.packs.boss || 0) + awarded.boss, // 3. 確保這裡也處理 boss 數量的加總
        },
      }
    })

    return { awarded, streak: user.streak }
  }, [setUser, user.streak])

  const setRole = (role: Role) => setUser((prev) => ({ ...prev, role }))

  const value: AppCtx = {
    cfg,
    setCfg,
    user,
    setUser,
    cards,
    loadingCards,
    reloadCards,
    canViewAll,
    loginReward,
    setRole,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAppState(): AppCtx {
  const v = React.useContext(Ctx)
  if (!v) throw new Error('useAppState must be used inside AppStateProvider')
  return v
}
