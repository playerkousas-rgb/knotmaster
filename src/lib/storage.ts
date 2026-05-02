import type { UserState } from './types'

const KEY = 'knotgacha:user:v1'

export function loadUserState(): UserState {
  const raw = localStorage.getItem(KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as UserState
    } catch {
      // ignore
    }
  }

  const userId = crypto.randomUUID()
  const init: UserState = {
    userId,
    role: 'member',
    streak: 0,
    packs: { white: 0, gold: 0, rainbow: 0, boss: 0 },
    obtainedCardIds: [],
    leaderPasscodes: [],
  }
  localStorage.setItem(KEY, JSON.stringify(init))
  return init
}

export function saveUserState(s: UserState): void {
  localStorage.setItem(KEY, JSON.stringify(s))
}
