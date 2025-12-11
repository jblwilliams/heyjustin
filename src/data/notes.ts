/**
 * Represents a note with metadata and markdown content.
 */
export interface Note {
  slug: string
  title: string
  date: string
  preview: string
  content: string
}

/**
 * Raw frontmatter data parsed from markdown files.
 */
interface NoteFrontmatter {
  slug: string
  title: string
  date: string
  preview: string
}

/**
 * Import all markdown files from the content/notes directory.
 * Vite's glob import with ?raw returns the raw file contents as strings.
 */
const noteFiles = import.meta.glob<string>('../content/notes/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

/**
 * Format a date string or Date object into a human-readable format.
 * Example: "2024-11-28" -> "November 28, 2024"
 */
function formatDate(dateIso: string): string {
  const dateObj = new Date(dateIso)
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Minimal, browser-safe frontmatter parser.
 * Supports YAML-like `key: value` pairs between leading `---` markers.
 */
function parseFrontmatter(raw: string): { data: Partial<NoteFrontmatter>, content: string } {
  if (!raw.startsWith('---\n')) {
    return { data: {}, content: raw }
  }

  const endMarker = '\n---\n'
  const endIdx = raw.indexOf(endMarker, 4)
  if (endIdx === -1) {
    return { data: {}, content: raw }
  }

  const frontmatterBlock = raw.slice(4, endIdx) // after first '---\n'
  const body = raw.slice(endIdx + endMarker.length)

  const data: Record<string, string> = {}
  for (const line of frontmatterBlock.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) continue

    const key = trimmed.slice(0, colonIdx).trim()
    let value = trimmed.slice(colonIdx + 1).trim()
    // Strip surrounding single/double quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    data[key] = value
  }

  return { data, content: body }
}

/**
 * Parse frontmatter and content from all markdown files,
 * returning a sorted array of Note objects (newest first).
 */
const parsedNotes = Object.entries(noteFiles).map(([_path, rawContent]) => {
  const { data, content } = parseFrontmatter(rawContent)
  const frontmatter = data as NoteFrontmatter

  const dateIso = frontmatter.date
  const sortDate = dateIso ? new Date(dateIso).getTime() : 0

  const note: Note = {
    slug: frontmatter.slug,
    title: frontmatter.title,
    date: dateIso ? formatDate(dateIso) : '',
    preview: frontmatter.preview,
    content: content.trim(),
  }

  return { note, sortDate }
})

export const notes: Note[] = parsedNotes
  .sort((a, b) => b.sortDate - a.sortDate)
  .map(({ note }) => note)

/**
 * Find a note by its slug.
 */
export function getNoteBySlug(slug: string): Note | undefined {
  return notes.find((note) => note.slug === slug)
}
