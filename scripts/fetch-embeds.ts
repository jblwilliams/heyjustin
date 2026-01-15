/**
 * Embed Metadata Fetcher
 *
 * Scans markdown files for standalone embed links (Twitter/X, Substack),
 * fetches their metadata via microlink.io, and updates embedMetadata.ts.
 *
 * Usage: npm run fetch-embeds
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = path.join(projectRoot, 'src', 'content', 'notes')
const outputPath = path.join(projectRoot, 'src', 'data', 'embedMetadata.ts')

// URL patterns for embeddable content
const TWITTER_PATTERN = /^https?:\/\/(twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/
const SUBSTACK_PATTERN = /^https?:\/\/([^.]+)\.substack\.com\/p\/([^?\s]+)/

// Microlink API endpoint
const MICROLINK_API = 'https://api.microlink.io'

interface MicrolinkResponse {
  status: string
  data: {
    title?: string
    description?: string
    image?: { url: string }
    logo?: { url: string }
    author?: string
    publisher?: string
    date?: string
    url: string
  }
}

interface TweetMetadata {
  type: 'tweet'
  authorName: string
  authorHandle: string
  authorAvatar: string
  text: string
  date: string
  url: string
}

interface SubstackMetadata {
  type: 'substack'
  publicationName: string
  publicationLogo: string
  title: string
  description: string
  authorName: string
  url: string
}

type EmbedMetadata = TweetMetadata | SubstackMetadata

async function getMarkdownFiles(): Promise<string[]> {
  try {
    const entries = await fs.readdir(contentDir, { withFileTypes: true })
    return entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .map(entry => path.join(contentDir, entry.name))
  } catch {
    console.error(`Content directory not found: ${contentDir}`)
    return []
  }
}

function findEmbedUrls(content: string): string[] {
  const urls: string[] = []

  const standaloneLinkRegex = /^\s*\[([^\]]*)\]\(([^)]+)\)\s*$/gm

  let match
  while ((match = standaloneLinkRegex.exec(content)) !== null) {
    const url = match[2]
    if (TWITTER_PATTERN.test(url) || SUBSTACK_PATTERN.test(url)) {
      urls.push(url)
    }
  }

  return urls
}

async function fetchMetadata(url: string): Promise<MicrolinkResponse | null> {
  const apiUrl = `${MICROLINK_API}?url=${encodeURIComponent(url)}`

  try {
    const response = await fetch(apiUrl)
    if (!response.ok) {
      console.error(`  ✗ API error for ${url}: ${response.status}`)
      return null
    }

    const data = await response.json() as MicrolinkResponse
    if (data.status !== 'success') {
      console.error(`  ✗ Failed to fetch metadata for ${url}`)
      return null
    }

    return data
  } catch (error) {
    console.error(`  ✗ Network error fetching ${url}:`, error)
    return null
  }
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

async function fetchTwitterAvatar(username: string): Promise<string> {
  // Try fetching the user's profile page for their actual avatar
  const profileUrl = `https://x.com/${username}`

  try {
    const response = await fetch(`${MICROLINK_API}?url=${encodeURIComponent(profileUrl)}`)
    if (response.ok) {
      const data = await response.json() as MicrolinkResponse
      if (data.status === 'success' && data.data.image?.url) {
        const imageUrl = data.data.image.url
        // Check if it looks like a profile image (from pbs.twimg.com)
        if (imageUrl.includes('pbs.twimg.com/profile_images')) {
          return imageUrl
        }
      }
    }
  } catch {
    // ignore
  }

  // Fallback: use unavatar.io which aggregates avatars from multiple sources
  return `https://unavatar.io/twitter/${username}`
}

async function buildTweetMetadata(url: string, data: MicrolinkResponse['data']): Promise<TweetMetadata> {
  const match = url.match(TWITTER_PATTERN)
  const handle = match?.[2] || 'unknown'
  const avatar = await fetchTwitterAvatar(handle)

  return {
    type: 'tweet',
    authorName: data.author || data.publisher || handle,
    authorHandle: handle,
    authorAvatar: avatar,
    text: data.description || data.title || '',
    date: formatDate(data.date),
    url: data.url || url,
  }
}

function extractMetaTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {}

  // Match og: meta tags (both attribute orders)
  const ogRegex1 = /<meta\s+(?:property|name)=["']og:([^"']+)["']\s+content=["']([^"']*)["']/gi
  const ogRegex2 = /<meta\s+content=["']([^"']*)["']\s+(?:property|name)=["']og:([^"']+)["']/gi

  let match
  while ((match = ogRegex1.exec(html)) !== null) {
    tags[`og:${match[1]}`] = match[2]
  }
  while ((match = ogRegex2.exec(html)) !== null) {
    tags[`og:${match[2]}`] = match[1]
  }

  return tags
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '...')
}

/**
 * Strip HTML tags from a string, preserving text content.
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract the opening content of a Substack article.
 * Looks for the article body and extracts the first meaningful text.
 */
function extractSubstackSubtitle(html: string): string | null {
  // Method 1: Look for truncated_body_text in embedded JSON (what Substack uses for embeds)
  const truncatedMatch = html.match(/"truncated_body_text"\s*:\s*"([^"]{50,})"/i)
  if (truncatedMatch) {
    // Unescape JSON string
    const text = truncatedMatch[1]
      .replace(/\\n/g, ' ')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
    return decodeHtmlEntities(text).trim()
  }

  // Method 2: Find the article body and extract opening text
  // Substack uses class="body markup" or similar for article content
  const bodyMatch = html.match(/<div[^>]*class=["'][^"']*(?:body|post-content|article-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
  if (bodyMatch) {
    const bodyHtml = bodyMatch[1]
    // Get first ~500 chars of text content
    const text = stripHtmlTags(bodyHtml).slice(0, 500)
    if (text.length > 50) {
      // Find a good sentence boundary to end on (prefer ending around 200-400 chars)
      let cutoff = text.length
      // Look for sentence endings (.!?) followed by space, starting from the end
      for (let i = Math.min(400, text.length - 1); i >= 150; i--) {
        if (/[.!?]/.test(text[i]) && (i === text.length - 1 || /\s/.test(text[i + 1]))) {
          cutoff = i + 1
          break
        }
      }
      return decodeHtmlEntities(text.slice(0, cutoff)).trim()
    }
  }

  // Method 3: Look for the first substantial paragraph after the title
  // Match paragraphs with substantial content (at least 50 chars)
  const paragraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || []
  for (const p of paragraphs) {
    const text = stripHtmlTags(p)
    // Skip short paragraphs (likely navigation, dates, etc.)
    if (text.length > 50 && text.length < 600) {
      // Skip if it looks like metadata (dates, "by author", etc.)
      if (!/^(by |written by |published |updated |\d{1,2}[\/\-])/i.test(text)) {
        return decodeHtmlEntities(text).trim()
      }
    }
  }

  // Method 4: Fall back to og:description
  const ogDescMatch = html.match(/property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/content=["']([^"']+)["'][^>]+property=["']og:description["']/i)
  if (ogDescMatch) {
    return decodeHtmlEntities(ogDescMatch[1]).trim()
  }

  return null
}

// Fetch Substack page directly to extract richer metadata than microlink provides
async function fetchSubstackDirect(url: string): Promise<{
  title: string
  description: string
  author: string
  publicationName: string
  publicationLogo: string
} | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    if (!response.ok) return null

    const html = await response.text()
    const tags = extractMetaTags(html)

    // Extract publication logo - prefer apple-touch-icon (higher quality)
    let logo = ''
    const appleIconMatch = html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i)
      || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon["']/i)
    if (appleIconMatch) {
      logo = appleIconMatch[1]
    }
    if (!logo) {
      const iconMatch = html.match(/<link[^>]+rel=["']icon["'][^>]+href=["']([^"']+)["']/i)
      if (iconMatch) {
        logo = iconMatch[1]
      }
    }

    // Get the subtitle/preview text - this is what Substack shows in embeds
    const subtitle = extractSubstackSubtitle(html)
    const description = subtitle || tags['og:description'] || ''

    // Extract author (handles both attribute orders)
    const authorMatch = html.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']author["']/i)
    const author = authorMatch?.[1] || ''
    const publicationName = tags['og:site_name'] || ''

    return {
      title: tags['og:title'] || '',
      description,
      author,
      publicationName,
      publicationLogo: logo,
    }
  } catch {
    return null
  }
}

async function buildSubstackMetadata(url: string, data: MicrolinkResponse['data']): Promise<SubstackMetadata> {
  const match = url.match(SUBSTACK_PATTERN)
  const subdomain = match?.[1] || 'unknown'

  // Try direct fetching first for richer metadata
  const directData = await fetchSubstackDirect(url)

  // Use direct data where available, fall back to microlink
  const title = directData?.title || data.title || ''
  const description = directData?.description || data.description || ''
  const authorName = directData?.author || data.author || ''
  const publicationName = directData?.publicationName || data.publisher || subdomain

  // For logo, prefer direct extraction, then construct Substack CDN URL
  let logo = directData?.publicationLogo || ''
  if (!logo || logo.includes('favicon')) {
    // Construct the Substack CDN URL pattern for publication icons
    logo = `https://substackcdn.com/image/fetch/w_96,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2F${subdomain}.substack.com%2Ficon.png`
  }

  return {
    type: 'substack',
    publicationName,
    publicationLogo: logo,
    title,
    description,
    authorName,
    url: data.url || url,
  }
}

function generateTypeScriptFile(metadata: Map<string, EmbedMetadata>): string {
  const entries = Array.from(metadata.entries())

  let content = `/**
 * Metadata registry for rich embeds (Twitter/X, Substack, etc.)
 *
 * AUTO-GENERATED by scripts/fetch-embeds.ts
 * Run \`npm run fetch-embeds\` to update.
 *
 * Last updated: ${new Date().toISOString()}
 */

export interface TweetMetadata {
  type: 'tweet'
  authorName: string
  authorHandle: string
  authorAvatar: string
  text: string
  date: string
  url: string
}

export interface SubstackMetadata {
  type: 'substack'
  publicationName: string
  publicationLogo: string
  title: string
  description: string
  authorName: string
  url: string
}

export type EmbedMetadata = TweetMetadata | SubstackMetadata

/**
 * Registry of embed metadata, keyed by URL.
 */
export const embedRegistry: Record<string, EmbedMetadata> = {
`

  for (const [url, meta] of entries) {
    const escapedUrl = url.replace(/'/g, "\\'")

    if (meta.type === 'tweet') {
      content += `  // Tweet by @${meta.authorHandle}
  '${escapedUrl}': {
    type: 'tweet',
    authorName: ${JSON.stringify(meta.authorName)},
    authorHandle: ${JSON.stringify(meta.authorHandle)},
    authorAvatar: ${JSON.stringify(meta.authorAvatar)},
    text: ${JSON.stringify(meta.text)},
    date: ${JSON.stringify(meta.date)},
    url: ${JSON.stringify(meta.url)},
  },

`
    } else {
      content += `  // ${meta.title} by ${meta.authorName}
  '${escapedUrl}': {
    type: 'substack',
    publicationName: ${JSON.stringify(meta.publicationName)},
    publicationLogo: ${JSON.stringify(meta.publicationLogo)},
    title: ${JSON.stringify(meta.title)},
    description: ${JSON.stringify(meta.description)},
    authorName: ${JSON.stringify(meta.authorName)},
    url: ${JSON.stringify(meta.url)},
  },

`
    }
  }

  content += `}

/**
 * Look up metadata for a given URL.
 * Matches by prefix to handle URL variations (query params, etc.)
 */
export function getEmbedMetadata(url: string): EmbedMetadata | null {
  // Try exact match first
  if (embedRegistry[url]) {
    return embedRegistry[url]
  }

  // Try prefix match (handles query params, fragments, etc.)
  const baseUrl = url.split('?')[0]
  for (const [key, metadata] of Object.entries(embedRegistry)) {
    const keyBase = key.split('?')[0]
    if (baseUrl === keyBase || baseUrl.startsWith(keyBase) || keyBase.startsWith(baseUrl)) {
      return metadata
    }
  }

  return null
}
`

  return content
}

async function loadExistingMetadata(): Promise<Map<string, EmbedMetadata>> {
  const metadata = new Map<string, EmbedMetadata>()

  try {
    const content = await fs.readFile(outputPath, 'utf-8')
    const entryRegex = /'([^']+)':\s*\{([^}]+type:\s*'(tweet|substack)'[^}]+)\}/g

    let match
    while ((match = entryRegex.exec(content)) !== null) {
      const url = match[1]
      const type = match[3] as 'tweet' | 'substack'
      const block = match[2]

      if (type === 'tweet') {
        const authorName = block.match(/authorName:\s*["']([^"']+)["']/)?.[1] || ''
        const authorHandle = block.match(/authorHandle:\s*["']([^"']+)["']/)?.[1] || ''
        const authorAvatar = block.match(/authorAvatar:\s*["']([^"']+)["']/)?.[1] || ''
        const text = block.match(/text:\s*["'](.+?)["'],?\s*\n/)?.[1] || ''
        const date = block.match(/date:\s*["']([^"']+)["']/)?.[1] || ''

        metadata.set(url, {
          type: 'tweet',
          authorName,
          authorHandle,
          authorAvatar,
          text,
          date,
          url,
        })
      } else {
        const publicationName = block.match(/publicationName:\s*["']([^"']+)["']/)?.[1] || ''
        const publicationLogo = block.match(/publicationLogo:\s*["']([^"']+)["']/)?.[1] || ''
        const title = block.match(/title:\s*["']([^"']+)["']/)?.[1] || ''
        const description = block.match(/description:\s*["'](.+?)["'],?\s*\n/)?.[1] || ''
        const authorName = block.match(/authorName:\s*["']([^"']+)["']/)?.[1] || ''

        metadata.set(url, {
          type: 'substack',
          publicationName,
          publicationLogo,
          title,
          description,
          authorName,
          url,
        })
      }
    }
  } catch {
    // ignore
  }

  return metadata
}

async function main() {
  console.log('🔍 Scanning markdown files for embed URLs...\n')

  const files = await getMarkdownFiles()
  if (!files.length) {
    console.log('No markdown files found.')
    return
  }

  // Collect all unique embed URLs
  const allUrls = new Set<string>()

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf-8')
    const urls = findEmbedUrls(content)

    if (urls.length) {
      const fileName = path.basename(filePath)
      console.log(`📄 ${fileName}`)
      for (const url of urls) {
        console.log(`   └─ ${url}`)
        allUrls.add(url)
      }
    }
  }

  if (!allUrls.size) {
    console.log('\nNo embed URLs found in markdown files.')
    return
  }

  console.log(`\n📦 Found ${allUrls.size} unique embed URL(s)\n`)

  const metadata = await loadExistingMetadata()
  const existingCount = metadata.size

  if (existingCount) {
    console.log(`📋 Loaded ${existingCount} existing embed(s) from registry\n`)
  }

  let fetchedCount = 0
  let skippedCount = 0

  for (const url of allUrls) {
    const baseUrl = url.split('?')[0]
    const existing = Array.from(metadata.keys()).find(key =>
      key.split('?')[0] === baseUrl
    )

    if (existing) {
      console.log(`⏭️  Skipping (already exists): ${url}`)
      skippedCount++
      continue
    }

    console.log(`🌐 Fetching: ${url}`)
    const response = await fetchMetadata(url)

    if (response) {
      const { data } = response

      if (TWITTER_PATTERN.test(url)) {
        const tweetMeta = await buildTweetMetadata(url, data)
        metadata.set(url, tweetMeta)
        console.log(`   ✓ @${tweetMeta.authorHandle}: "${tweetMeta.text.slice(0, 50)}..."`)
      } else if (SUBSTACK_PATTERN.test(url)) {
        const substackMeta = await buildSubstackMetadata(url, data)
        metadata.set(url, substackMeta)
        console.log(`   ✓ ${substackMeta.title} by ${substackMeta.authorName}`)
      }

      fetchedCount++
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log(`\n📝 Writing embedMetadata.ts...`)
  const fileContent = generateTypeScriptFile(metadata)
  await fs.writeFile(outputPath, fileContent, 'utf-8')

  console.log(`\n✅ Done!`)
  console.log(`   - Total embeds in registry: ${metadata.size}`)
  console.log(`   - Newly fetched: ${fetchedCount}`)
  console.log(`   - Skipped (existing): ${skippedCount}`)
}

main().catch(error => {
  console.error('Error:', error)
  process.exitCode = 1
})
