import type { CardRecord, KnotCategory, NotionFile, RarityKey } from './types'

type NotionQueryResponse = {
  results: Array<{
    id: string
    properties: Record<string, any>
    cover?: { type: string; file?: { url: string }; external?: { url: string } } | null
    last_edited_time?: string
  }>
}

function getText(prop: any): string {
  const rt = prop?.rich_text ?? prop?.title
  if (Array.isArray(rt) && rt.length > 0) return rt.map((x: any) => x?.plain_text ?? '').join('')
  return ''
}

function getSelectName(prop: any): string {
  return prop?.select?.name ?? ''
}

function getNumber(prop: any): number {
  const n = prop?.number
  return typeof n === 'number' ? n : 0
}

function getFiles(prop: any): NotionFile[] {
  const f = prop?.files
  return Array.isArray(f) ? (f as NotionFile[]) : []
}

function fileUrl(f: NotionFile): string | undefined {
  if (f.type === 'external') return f.external?.url
  return f.file?.url
}

function coverUrl(cover: any): string | undefined {
  if (!cover) return undefined
  if (cover.type === 'external') return cover.external?.url
  return cover.file?.url
}

export type NotionConfig = {
  notionToken?: string
  cardsDb?: string
  learningDb?: string
  badgesDb?: string
}

export async function fetchCards(cfg: NotionConfig): Promise<CardRecord[]> {
  const { notionToken, cardsDb } = cfg
  if (!notionToken || !cardsDb) {
    // Demo dataset for local/dev without Notion.
    const demo: CardRecord[] = [
      {
        id: 'demo-bowline',
        name: 'Bowline (布林結)',
        category: 'Fixed Loop',
        difficulty: 4,
        utility: 9,
        rarity: 'Common',
        description:
          '經典固定圈結，可快速打結且在受力後仍可解開。適用於救援、登山與一般繩索作業。',
        youtubeUrl: 'https://www.youtube.com/watch?v=6oK-QcZfJfs',
        coverImageUrl: undefined,
        stepsImages: [],
        obtained: true,
      },
      {
        id: 'demo-figure8',
        name: 'Figure Eight (8字結)',
        category: 'Stopper',
        difficulty: 3,
        utility: 8,
        rarity: 'Basic',
        description: '常用止結，防止繩尾穿過孔洞。也可作為八字圈與攀岩保護系統的基礎。',
        youtubeUrl: 'https://www.youtube.com/watch?v=ZMw8oR2z2Gk',
        coverImageUrl: undefined,
        stepsImages: [],
        obtained: false,
      },
      {
        id: 'demo-sheetbend',
        name: 'Sheet Bend (單套結)',
        category: 'Bend',
        difficulty: 5,
        utility: 7,
        rarity: 'Rare',
        description: '用於連接不同粗細的兩條繩子，在戶外與帆船領域常見。',
        youtubeUrl: 'https://www.youtube.com/watch?v=6O2QxHh0v-Q',
        coverImageUrl: undefined,
        stepsImages: [],
        obtained: false,
      },
      {
        id: 'demo-clove',
        name: 'Clove Hitch (丁香結)',
        category: 'Hitch',
        difficulty: 4,
        utility: 8,
        rarity: 'Uncommon',
        description: '快速繞柱固定，適合臨時拉緊與調整，但在震動下可能滑動，需注意。',
        youtubeUrl: 'https://www.youtube.com/watch?v=H0wToY9cG8g',
        coverImageUrl: undefined,
        stepsImages: [],
        obtained: true,
      },
      {
        id: 'demo-constrictor',
        name: 'Constrictor (束縛結)',
        category: 'Binding',
        difficulty: 7,
        utility: 9,
        rarity: 'Epic',
        description: '強力束縛結，適合固定物件或臨時止血綁帶；解開難度較高。',
        youtubeUrl: 'https://www.youtube.com/watch?v=0lFQ1uJ2dG8',
        coverImageUrl: undefined,
        stepsImages: [],
        obtained: false,
      },
      {
        id: 'demo-eternal',
        name: 'Eternal Weave (永恆編織)',
        category: 'Decorative',
        difficulty: 10,
        utility: 10,
        rarity: 'Eternal',
        description: '示範用的高稀有度卡，代表極高的難度與實用性數值呈現。',
        youtubeUrl: undefined,
        coverImageUrl: undefined,
        stepsImages: [],
        obtained: false,
      },
    ]
    return demo
  }

  const res = await fetch(`https://api.notion.com/v1/databases/${cardsDb}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page_size: 100 }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Notion query failed: ${res.status} ${txt}`)
  }

  const data = (await res.json()) as NotionQueryResponse

  return data.results.map((p): CardRecord => {
    const props = p.properties

    const name = getText(props.Name ?? props['名稱'] ?? props['name']) || 'Untitled'
    const category = (getSelectName(props.Category ?? props['種類'] ?? props['category']) || 'Other') as KnotCategory
    const rarity = (getSelectName(props.Rarity ?? props['稀有度'] ?? props['rarity']) || 'Basic') as RarityKey
    const difficulty = getNumber(props.Difficulty ?? props['難度'] ?? props['difficulty'])
    const utility = getNumber(props.Utility ?? props['實用性'] ?? props['utility'])
    const description = getText(props.Description ?? props['介紹'] ?? props['description'])
    const youtubeUrl = getText(props.YouTube ?? props['YouTube教學'] ?? props['youtube']) || undefined

    const images = getFiles(props.Image ?? props['圖片'] ?? props['Cover'] ?? props['cover'])
      .map(fileUrl)
      .filter(Boolean) as string[]

    const stepsImages = getFiles(props.Steps ?? props['步驟圖'] ?? props['steps'])
      .map(fileUrl)
      .filter(Boolean) as string[]

    const cover = images[0] ?? coverUrl(p.cover)

    return {
      id: p.id,
      name,
      category,
      difficulty,
      utility,
      rarity,
      description,
      youtubeUrl,
      coverImageUrl: cover,
      stepsImages,
      obtained: false,
      updatedAt: p.last_edited_time,
    }
  })
}
