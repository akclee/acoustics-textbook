import { readFileSync } from 'fs'
import { join } from 'path'

type ArticleChunk = {
  id: string
  source: string
  pdfUrl: string
  chunkIndex: number
  text: string
  keywords: string[]
}

// Cache the articles in memory after first load
let cache: ArticleChunk[] | null = null

function loadArticles(): ArticleChunk[] {
  if (cache) return cache
  try {
    const raw = readFileSync(join(process.cwd(), 'data/articles.json'), 'utf-8')
    cache = JSON.parse(raw)
    console.log(`Loaded ${cache!.length} article chunks`)
    return cache!
  } catch {
    // data/articles.json doesn't exist yet — that's OK
    return []
  }
}

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'is','are','was','were','be','been','have','has','had','do','does','did',
  'will','would','could','should','may','might','can','this','that','these',
])

export function searchArticles(query: string, topK = 3): ArticleChunk[] {
  const articles = loadArticles()
  if (articles.length === 0) return []

  // Tokenize the query
  const queryWords = query.toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))

  if (queryWords.length === 0) return []

  // Score each chunk by keyword relevance
  const scored = articles.map(chunk => {
    let score = 0
    const lowerText = chunk.text.toLowerCase()

    for (const word of queryWords) {
      // Term frequency in text
      const matches = (lowerText.match(new RegExp(`\\b${word}`, 'g')) || []).length
      score += matches

      // Bonus for keyword index hits (pre-computed top terms)
      if (chunk.keywords.includes(word)) score += 3
    }

    return { chunk, score }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk)
}

export function formatForContext(chunks: ArticleChunk[]): string {
  if (chunks.length === 0) return ''

  return chunks
    .map((chunk, i) =>
      `--- Acoustics Today Article Excerpt ${i + 1} ---\nSource: ${chunk.source}\n\n${chunk.text}`
    )
    .join('\n\n')
}