export type RarityKey =
  | 'Basic'
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Epic'
  | 'Legendary'
  | 'Mythic'
  | 'Eternal'

export type KnotCategory =
  | 'Fixed Loop'
  | 'Bend'
  | 'Hitch'
  | 'Binding'
  | 'Stopper'
  | 'Decorative'
  | 'Other'

export type Role = 'member' | 'leader' | 'super'

export interface NotionRichText {
  plain_text: string
}

export interface NotionFile {
  type: 'file' | 'external'
  name?: string
  file?: { url: string }
  external?: { url: string }
}

export interface CardRecord {
  id: string
  name: string
  category: KnotCategory
  difficulty: number // 1-10
  utility: number // 1-10
  rarity: RarityKey
  description: string
  youtubeUrl?: string
  coverImageUrl?: string
  stepsImages: string[]
  obtained: boolean
  updatedAt?: string
}

export interface LearningRecord {
  id: string
  cardId: string
  userId: string
  status: 'learning' | 'passed'
  notes?: string
  updatedAt?: string
}

export interface BadgeRecord {
  id: string
  userId: string
  key: string
  label: string
  earnedAt: string
}

export interface UserState {
  userId: string
  role: Role
  leaderUnlockedAt?: string
  superUnlockedAt?: string
  streak: number
  lastLoginDate?: string
  packs: {
    white: number
    gold: number
    rainbow: number
    boss: number
  }
  obtainedCardIds: string[]
  leaderPasscodes: { code: string; createdAt: string }[]
}
