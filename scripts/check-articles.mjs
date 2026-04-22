// scripts/check-articles.mjs
// Shows which Acoustics Today issues were downloaded and which are missing.
// Run with: node scripts/check-articles.mjs

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA_FILE = join(ROOT, 'data', 'articles.json')

// All issues that should exist (quarterly from 2005 to present)
const SEASONS = ['SPRING', 'SUMMER', 'FALL', 'WINTER']
const START_YEAR = 2005
const END_YEAR = new Date().getFullYear()

function buildExpected() {
  const expected = []
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    for (const season of SEASONS) {
      // Skip future issues (rough check: we're not past mid-year for FALL/WINTER)
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1 // 1-12
      if (year === currentYear) {
        if (season === 'SUMMER' && currentMonth < 6) continue
        if (season === 'FALL'   && currentMonth < 9) continue
        if (season === 'WINTER' && currentMonth < 12) continue
      }
      expected.push(`${year}-${season}`)
    }
  }
  return expected
}

// ─── Load and summarise ───────────────────────────────────────────────────────

if (!existsSync(DATA_FILE)) {
  console.error('❌  data/articles.json not found.')
  console.error('    Run the scraper first: node scripts/scrape-articles.mjs')
  process.exit(1)
}

const chunks = JSON.parse(readFileSync(DATA_FILE, 'utf-8'))

// Group chunks by issue (year + season)
const issueMap = new Map()
for (const chunk of chunks) {
  const key = `${chunk.year}-${chunk.season}`
  if (!issueMap.has(key)) {
    issueMap.set(key, { year: chunk.year, season: chunk.season, chunks: 0, pdfUrl: chunk.pdfUrl })
  }
  issueMap.get(key).chunks++
}

// Sort found issues by year then season order
const seasonOrder = { SPRING: 0, SUMMER: 1, FALL: 2, WINTER: 3 }
const found = [...issueMap.values()].sort((a, b) =>
  a.year !== b.year ? a.year - b.year : (seasonOrder[a.season] ?? 4) - (seasonOrder[b.season] ?? 4)
)

// Compare against expected
const expected = buildExpected()
const foundKeys = new Set(issueMap.keys())
const missing = expected.filter(k => !foundKeys.has(k))

// ─── Report ───────────────────────────────────────────────────────────────────

console.log('=== Acoustics Today — Article Index Audit ===\n')
console.log(`Total chunks in index : ${chunks.length}`)
console.log(`Issues found          : ${found.length}`)
console.log(`Issues expected       : ${expected.length}`)
console.log(`Issues missing        : ${missing.length}\n`)

console.log('─── FOUND ISSUES ────────────────────────────────────────────────')
for (const issue of found) {
  const label = `${issue.season} ${issue.year}`.padEnd(14)
  const chunkBar = '█'.repeat(Math.min(issue.chunks, 40))
  console.log(`  ✓ ${label}  ${issue.chunks.toString().padStart(3)} chunks  ${chunkBar}`)
}

if (missing.length > 0) {
  console.log('\n─── MISSING ISSUES ──────────────────────────────────────────────')
  // Group missing by year for readability
  let lastYear = null
  for (const key of missing) {
    const [year, season] = key.split('-')
    if (year !== lastYear) {
      process.stdout.write(`\n  ${year}: `)
      lastYear = year
    }
    process.stdout.write(`${season}  `)
  }
  console.log('\n')
  console.log('Tip: copy any missing issue URL from acousticstoday.org and add it')
  console.log('     to the MANUAL_PDFS list at the bottom of scrape-articles.mjs')
} else {
  console.log('\n✅  All expected issues are present!')
}