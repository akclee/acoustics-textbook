// scripts/scrape-articles.mjs  (v4)
//
// Strategy:
//   1. WordPress REST API  → gets all recent PDFs quickly
//   2. Targeted per-issue probing  → for any issues still missing after step 1,
//      tries ~25 focused URLs per issue (not thousands), 5 at a time in parallel
//   3. Download + parse every found PDF with pdfjs-dist
//
// Run with:  node scripts/scrape-articles.mjs
// Prerequisites: npm install pdfjs-dist

import { writeFileSync, readFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
const readFile = readFileSync  // alias for local PDF reads
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BASE = 'https://acousticstoday.org/wp-content/uploads'

const ALL_MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12']
const SEASONS = ['SPRING', 'SUMMER', 'FALL', 'WINTER']
const START_YEAR = 2005
const END_YEAR = new Date().getFullYear()

// ─── Manual PDF URLs ──────────────────────────────────────────────────────────
// For any issues the scraper can't find automatically, paste their PDF URLs here.
// Use Chrome's Network tab (F12) on the issue page to find the URL.
// Format: 'https://acousticstoday.org/wp-content/uploads/YYYY/MM/filename.pdf'

const MANUAL_PDFS = [
  'https://acousticalsociety.org/wp-content/uploads/2019/10/Spring-2006.pdf',
  'https://acousticstoday.org/wp-content/uploads/2019/10/Winter-2008.pdf',
  'https://acousticstoday.org/wp-content/uploads/2019/09/winter2010.pdf',
  'https://acousticstoday.org/wp-content/uploads/2019/09/apr2010.pdf',
  'https://acousticstoday.org/wp-content/uploads/2019/10/Summer-2007.pdf',
  'https://acousticstoday.org/wp-content/uploads/2019/09/winter2011.pdf',
  'https://acousticstoday.org/wp-content/uploads/2019/09/summer2011.pdf',
  'https://acousticstoday.org/wp-content/uploads/2019/09/spring2011.pdf',
]

// ─── Local PDF folder ─────────────────────────────────────────────────────────
// Any PDFs you downloaded manually and placed in data/Download/ will be picked
// up automatically. The filename must contain a recognisable season/year pattern,
// e.g. "Spring2005.pdf", "AT-FALL-2017_FINAL.pdf", "January-2005.pdf".
const LOCAL_PDF_DIR = join(ROOT, 'data', 'Download')

// ─── WordPress REST API ───────────────────────────────────────────────────────

async function fetchPdfsViaApi() {
  const pdfs = []
  let page = 1
  console.log('Phase 1: Fetching PDFs via WordPress REST API...')
  while (true) {
    const url = `https://acousticstoday.org/wp-json/wp/v2/media?mime_type=application/pdf&per_page=100&page=${page}`
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AcousticsTextbook/1.0)' },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) break
      const items = await res.json()
      if (!Array.isArray(items) || items.length === 0) break
      for (const item of items) {
        const src = item.source_url || ''
        if (src.endsWith('.pdf') && isIssuePdf(src)) pdfs.push(src)
      }
      const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10)
      console.log(`  Page ${page}/${totalPages}: ${pdfs.length} issue PDFs so far`)
      if (page >= totalPages) break
      page++
      await delay(300)
    } catch {
      break
    }
  }
  return pdfs
}

// ─── Issue PDF filter ─────────────────────────────────────────────────────────
// Checks the filename only — not the full URL — to avoid individual article PDFs
// like "sound-observations-yost.pdf" which live on the same domain.

function isIssuePdf(url) {
  const filename = (url.split('/').pop() || '').toLowerCase()
  if (/^at[-_]?(spring|summer|fall|winter)/.test(filename)) return true  // AT-SPRING-2025_FINAL.pdf, ATfall2021.pdf
  if (/^(spring|summer|fall|winter)[-\d]/.test(filename)) return true     // Spring2019.pdf, Summer-2006.pdf
  if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*[-\d]/.test(filename)) return true  // Jan2009.pdf, January-2006.pdf
  return false
}

// ─── Targeted per-issue URL candidates ───────────────────────────────────────
// Confirmed upload path patterns:
//   2005–2019: batch-uploaded to /2019/09–11/ during site migration
//   2020+:     uploaded in the actual issue year

function candidatesForIssue(year, season) {
  const title  = season.charAt(0) + season.slice(1).toLowerCase()  // Spring
  const lower  = season.toLowerCase()                               // spring

  if (year <= 2019) {
    // Old issues were batch-uploaded to /2019/ — confirmed in /2019/09/ and /2019/10/
    const uploadPaths = [`${BASE}/2019/09`, `${BASE}/2019/10`, `${BASE}/2019/11`]

    // Seasonal filenames (confirmed: Spring2019.pdf, Summer-2006.pdf)
    const seasonal = [
      `${title}${year}.pdf`,
      `${title}-${year}.pdf`,
      `${season}${year}.pdf`,
    ]

    // Monthly filenames — try the 3 months most associated with each season
    // (confirmed: Jan2009.pdf, January-2006.pdf)
    const SEASON_MONTHS = {
      SPRING: [['Mar','March'], ['Apr','April'], ['May','May']],
      SUMMER: [['Jun','June'],  ['Jul','July'],  ['Aug','August']],
      FALL:   [['Sep','September'], ['Oct','October'], ['Nov','November']],
      WINTER: [['Dec','December'], ['Jan','January'], ['Feb','February']],
    }
    const issueYear = (season === 'WINTER') ? year + 1 : year
    const monthly = (SEASON_MONTHS[season] || []).flatMap(([abbr, full]) => [
      `${abbr}${issueYear}.pdf`,
      `${full}-${issueYear}.pdf`,
    ])

    const filenames = [...seasonal, ...monthly]
    return uploadPaths.flatMap(path => filenames.map(f => `${path}/${f}`))

  } else {
    // New format: uploaded in the issue year itself
    const filenames = [
      `AT-${season}-${year}_FINAL.pdf`,
      `AT-${season}-${year}-corrected.pdf`,
      `AT-${season}-${year}.pdf`,
      `AT${lower}${year}.pdf`,
      `AT${title}${year}.pdf`,
      `AT-${lower}-${year}.pdf`,
    ]
    const SEASON_MONTHS = {
      SPRING: ['03','04','05','06'],
      SUMMER: ['06','07','08','09'],
      FALL:   ['09','10','11','12'],
      WINTER: ['11','12'],
    }
    const uploadMonths = SEASON_MONTHS[season] || ALL_MONTHS
    const uploadYears  = season === 'WINTER'
      ? [String(year), String(year + 1)]
      : [String(year)]
    return uploadYears.flatMap(uy =>
      uploadMonths.flatMap(m =>
        filenames.map(f => `${BASE}/${uy}/${m}/${f}`)
      )
    )
  }
}

// ─── Parallel URL existence check ─────────────────────────────────────────────

async function urlExists(url) {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AcousticsTextbook/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    return res.ok
  } catch {
    return false
  }
}

// Try candidates in batches of `concurrency`, stop as soon as one is found
async function findFirstUrl(candidates, concurrency = 5) {
  for (let i = 0; i < candidates.length; i += concurrency) {
    const batch = candidates.slice(i, i + concurrency)
    const results = await Promise.all(batch.map(async url => ({ url, ok: await urlExists(url) })))
    const hit = results.find(r => r.ok)
    if (hit) return hit.url
    await delay(150)
  }
  return null
}

// ─── PDF parsing ──────────────────────────────────────────────────────────────

async function parsePdfBuffer(buffer) {
  const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str || '').join(' ') + '\n'
  }
  return { text, pages: pdf.numPages }
}

async function downloadAndParsePdf(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AcousticsTextbook/1.0)' },
    signal: AbortSignal.timeout(60000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  return parsePdfBuffer(Buffer.from(arrayBuffer))
}

// ─── Text chunking ────────────────────────────────────────────────────────────

function chunkText(text, chunkSize = 2000) {
  const cleaned = text
    .replace(/\f/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  const paragraphs = cleaned.split(/\n\n+/)
  const chunks = []
  let current = ''
  for (const para of paragraphs) {
    if (para.trim().length < 20) continue
    if (current.length + para.length > chunkSize && current.length > 300) {
      chunks.push(current.trim())
      current = para
    } else {
      current += '\n\n' + para
    }
  }
  if (current.trim().length > 200) chunks.push(current.trim())
  return chunks
}

// ─── Keyword extraction ───────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'is','are','was','were','be','been','have','has','had','do','does','did',
  'will','would','could','should','may','might','can','this','that','these',
  'those','it','its','from','by','as','not','also','which','when','where',
  'what','how','all','more','than','their','they','them','there','here',
])

function extractKeywords(text) {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))
  const freq = {}
  for (const w of words) freq[w] = (freq[w] || 0) + 1
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([w]) => w)
}

// ─── Metadata from URL ────────────────────────────────────────────────────────

function metaFromUrl(url) {
  const f = url.split('/').pop() || ''
  // AT-SPRING-2025_FINAL.pdf  or  AT-SUMMER-2023-corrected.pdf
  const dashFmt = f.match(/AT-(SPRING|SUMMER|FALL|WINTER|Spring|Summer|Fall|Winter)-?(\d{4})/i)
  if (dashFmt) return { season: dashFmt[1].toUpperCase(), year: parseInt(dashFmt[2], 10) }
  // ATfall2021.pdf
  const noDashFmt = f.match(/AT(spring|summer|fall|winter)(\d{4})/i)
  if (noDashFmt) return { season: noDashFmt[1].toUpperCase(), year: parseInt(noDashFmt[2], 10) }
  // Spring2019.pdf  or  Summer-2006.pdf
  const seasonFmt = f.match(/^(Spring|Summer|Fall|Winter)-?(\d{4})/i)
  if (seasonFmt) return { season: seasonFmt[1].toUpperCase(), year: parseInt(seasonFmt[2], 10) }
  // Jan2009.pdf  or  January-2006.pdf
  const MONTH_MAP = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12}
  const monthFmt = f.match(/^(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-?(\d{4})/i)
  if (monthFmt) {
    const m = MONTH_MAP[monthFmt[1].slice(0,3).toLowerCase()] || 0
    const season = (m <= 2 || m === 12) ? 'WINTER' : m <= 5 ? 'SPRING' : m <= 8 ? 'SUMMER' : 'FALL'
    return { season, year: parseInt(monthFmt[2], 10) }
  }
  const yearMatch = url.match(/uploads\/(\d{4})\//)
  return { season: 'UNKNOWN', year: yearMatch ? parseInt(yearMatch[1], 10) : 0 }
}

const delay = ms => new Promise(r => setTimeout(r, ms))

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Acoustics Today Scraper v4 ===\n')

  // ── Load existing articles.json upfront so all phases can skip cached issues
  const dataDir = join(ROOT, 'data')
  const outputPath = join(dataDir, 'articles.json')
  let allChunks = []
  const alreadyDownloaded = new Set()

  if (existsSync(outputPath)) {
    try {
      const existing = JSON.parse(readFileSync(outputPath, 'utf-8'))
      allChunks = existing
      for (const chunk of existing) {
        alreadyDownloaded.add(`${chunk.year}-${chunk.season}`)
      }
      console.log(`Loaded ${existing.length} existing chunks (${alreadyDownloaded.size} issues already cached)\n`)
    } catch {
      console.log('Could not read existing articles.json — starting fresh\n')
    }
  }

  // ── Phase 1: API ─────────────────────────────────────────────────────────
  const apiUrls = await fetchPdfsViaApi()
  console.log(`  API total: ${apiUrls.length} issue PDFs\n`)

  // Track what we have so far (keyed by "year-SEASON")
  const foundMap = new Map()  // key → url
  for (const url of apiUrls) {
    const { year, season } = metaFromUrl(url)
    const key = `${year}-${season}`
    if (!foundMap.has(key)) foundMap.set(key, url)
  }

  // ── Phase 2: Targeted probing for missing issues ──────────────────────────
  // Build the full expected set
  const expected = []
  const now = new Date()
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    for (const season of SEASONS) {
      if (year === END_YEAR) {
        const month = now.getMonth() + 1
        if (season === 'SUMMER' && month < 6) continue
        if (season === 'FALL'   && month < 9) continue
        if (season === 'WINTER' && month < 11) continue
      }
      expected.push({ year, season })
    }
  }

  const missing = expected.filter(({ year, season }) => !foundMap.has(`${year}-${season}`))
  console.log(`Phase 2: Probing for ${missing.length} missing issues (5 parallel requests)...\n`)

  let probeFound = 0
  for (const { year, season } of missing) {
    process.stdout.write(`  ${season} ${year}... `)
    const candidates = candidatesForIssue(year, season)
    const url = await findFirstUrl(candidates)
    if (url) {
      foundMap.set(`${year}-${season}`, url)
      probeFound++
      console.log(`✓ ${url}`)
    } else {
      console.log(`✗ not found (tried ${candidates.length} URLs)`)
    }
  }

  console.log(`\nProbing done: found ${probeFound} of ${missing.length} missing issues`)

  // ── Phase 2b: Add any manually provided URLs ──────────────────────────────
  if (MANUAL_PDFS.length > 0) {
    console.log(`\nPhase 2b: Adding ${MANUAL_PDFS.length} manual PDF(s)...`)
    for (const url of MANUAL_PDFS) {
      const { year, season } = metaFromUrl(url)
      const key = `${year}-${season}`
      if (year === 0 || season === 'UNKNOWN') {
        console.log(`  ⚠️  Could not parse year/season from: ${url}`)
        console.log(`      Check the filename matches a known pattern (e.g. Spring2010.pdf)`)
        continue
      }
      if (foundMap.has(key)) {
        console.log(`  ~ ${season} ${year} already found — skipping manual entry`)
      } else {
        foundMap.set(key, url)
        console.log(`  ✓ Added ${season} ${year}: ${url}`)
      }
    }
  }

  // ── Phase 2c: Local PDFs from data/Download/ ──────────────────────────────
  if (existsSync(LOCAL_PDF_DIR)) {
    const localFiles = readdirSync(LOCAL_PDF_DIR).filter(f => f.toLowerCase().endsWith('.pdf'))
    if (localFiles.length > 0) {
      console.log(`\nPhase 2c: Found ${localFiles.length} local PDF(s) in data/Download/`)
      for (const filename of localFiles) {
        const filePath = join(LOCAL_PDF_DIR, filename)
        const { year, season } = metaFromUrl(filename)
        const key = `${year}-${season}`
        if (year === 0 || season === 'UNKNOWN') {
          console.log(`  ⚠️  Cannot parse year/season from filename: ${filename}`)
          console.log(`      Rename it to a recognised pattern, e.g. Spring2005.pdf`)
          continue
        }
        if (alreadyDownloaded.has(key)) {
          console.log(`  ~ ${season} ${year} already in index — skipping ${filename}`)
          continue
        }
        // Store as a special "local:// " source so Phase 3 knows to read from disk
        if (!foundMap.has(key)) {
          foundMap.set(key, `local://${filePath}`)
          console.log(`  ✓ Queued ${season} ${year}: ${filename}`)
        }
      }
    }
  }

  console.log(`\nTotal issues to download: ${foundMap.size}\n`)

  // ── Phase 3: Download + parse ─────────────────────────────────────────────
  const toDownload = [...foundMap.entries()]
    .sort()
    .filter(([key]) => !alreadyDownloaded.has(key))

  console.log(`Downloading ${toDownload.length} new issues (${foundMap.size - toDownload.length} already cached)...\n`)

  let issueNum = 0

  for (const [key, pdfUrl] of toDownload) {
    const [yearStr, season] = key.split('-')
    const year = parseInt(yearStr, 10)
    issueNum++
    console.log(`[${issueNum}/${toDownload.length}] ${season} ${year}`)

    try {
      let parsed
      if (pdfUrl.startsWith('local://')) {
        // Read from local disk
        const filePath = pdfUrl.slice('local://'.length)
        const buffer = readFile(filePath)
        parsed = await parsePdfBuffer(buffer)
      } else {
        parsed = await downloadAndParsePdf(pdfUrl)
      }
      const { text, pages } = parsed
      const chunks = chunkText(text)
      for (let i = 0; i < chunks.length; i++) {
        allChunks.push({
          id: `${year}-${season}-chunk-${i}`,
          year, season, pdfUrl,
          chunkIndex: i,
          text: chunks[i],
          keywords: extractKeywords(chunks[i]),
        })
      }
      console.log(`  ✓ ${pages} pages → ${chunks.length} chunks`)
      await delay(1000)
    } catch (err) {
      console.error(`  ✗ ${err.message}`)
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
  writeFileSync(outputPath, JSON.stringify(allChunks, null, 2))

  const sizeMB = (JSON.stringify(allChunks).length / 1024 / 1024).toFixed(1)
  console.log(`\n✅ Done!`)
  console.log(`   Issues: ${foundMap.size}   Chunks: ${allChunks.length}   Size: ${sizeMB} MB`)
  console.log(`   Saved to: data/articles.json`)
  console.log(`\nNext: git add data/articles.json && git commit -m "Add article index"`)
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message)
  process.exit(1)
})