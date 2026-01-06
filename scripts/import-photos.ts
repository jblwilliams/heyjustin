import { exiftool } from 'exiftool-vendored'
import sharp from 'sharp'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

interface AlbumConfig {
  id: string
  title: string
  directory: string
  coverPhotos: string[]
}

interface AlbumsConfigFile {
  albums: AlbumConfig[]
}

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png'])
const SIZE_TARGETS = {
  thumb: 600,
  medium: 1600,
  large: 2600,
} as const

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicRoot = path.join(projectRoot, 'public')

const normalizeTitle = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')

const slugify = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'photo'
}

const splitKeywords = (value: string) =>
  value
    .split(/[;,]/g)
    .map(part => part.trim())
    .filter(Boolean)

const flattenKeywords = (value: unknown): string[] => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.flatMap(item => flattenKeywords(item))
  }
  if (typeof value === 'string') {
    return splitKeywords(value)
  }
  return [String(value)]
}

const extractKeywords = async (filePath: string) => {
  const tags = await exiftool.read(filePath)
  const keywords: string[] = []

  keywords.push(...flattenKeywords(tags.Keywords))
  keywords.push(...flattenKeywords(tags.Subject))
  keywords.push(...flattenKeywords(tags.XPKeywords))

  const hierarchical = flattenKeywords(tags.HierarchicalSubject)
  for (const entry of hierarchical) {
    for (const part of entry.split('|')) {
      const trimmed = part.trim()
      if (trimmed) keywords.push(trimmed)
    }
  }

  return keywords.map(keyword => normalizeTitle(keyword))
}

const readAlbumsConfig = async (): Promise<AlbumConfig[]> => {
  const configPath = path.join(projectRoot, 'src', 'data', 'albums.config.json')
  const raw = await fs.readFile(configPath, 'utf-8')
  const parsed = JSON.parse(raw) as AlbumsConfigFile
  return parsed.albums ?? []
}

const albumDirectory = (directory: string) =>
  path.join(publicRoot, directory.replace(/^\//, ''))

const readImageFiles = async (dirPath: string) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  return entries
    .filter(entry => entry.isFile())
    .map(entry => entry.name)
    .filter(name => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
}

const nextIndexForAlbum = (files: string[]) => {
  let maxIndex = 0
  for (const fileName of files) {
    const match = fileName.match(/^(\d+)-/)
    if (match) {
      maxIndex = Math.max(maxIndex, Number(match[1]))
    }
  }
  return maxIndex + 1
}

const filenameSort = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })

interface GeneratedPhotoEntry {
  base: string
  sizes: {
    thumb: { file: string; width: number; height: number }
    medium: { file: string; width: number; height: number }
    large: { file: string; width: number; height: number }
  }
}

const buildGeneratedManifest = async (albums: AlbumConfig[]) => {
  const output: Record<string, GeneratedPhotoEntry[]> = {}

  for (const album of albums) {
    const destDir = albumDirectory(album.directory)
    try {
      const files = await readImageFiles(destDir)
      const entries: GeneratedPhotoEntry[] = []

      for (const fileName of files) {
        const match = fileName.match(/^(\d+-.+)@(\d+)(\.[a-z0-9]+)$/i)
        if (!match) continue
        if (Number(match[2]) !== SIZE_TARGETS.large) continue

        const base = match[1]
        const ext = match[3]

        const readSize = async (size: number) => {
          const file = `${base}@${size}${ext}`
          const filePath = path.join(destDir, file)
          try {
            const meta = await sharp(filePath).metadata()
            if (!meta.width || !meta.height) return null
            return { file, width: meta.width, height: meta.height }
          } catch {
            return null
          }
        }

        const thumb = await readSize(SIZE_TARGETS.thumb)
        const medium = await readSize(SIZE_TARGETS.medium)
        const large = await readSize(SIZE_TARGETS.large)
        if (!thumb || !medium || !large) continue

        entries.push({
          base,
          sizes: { thumb, medium, large },
        })
      }

      output[album.id] = entries.sort((a, b) => filenameSort(a.base, b.base))
    } catch {
      output[album.id] = []
    }
  }

  const outputPath = path.join(projectRoot, 'src', 'data', 'albums.generated.json')
  await fs.writeFile(
    outputPath,
    `${JSON.stringify({ albums: output }, null, 2)}\n`,
    'utf-8'
  )
}

const printUsage = () => {
  console.log('Usage: npm run import-photos -- /path/to/source')
}

const main = async () => {
  const sourceArg = process.argv[2]
  if (!sourceArg) {
    printUsage()
    return
  }

  const sourceDir = path.resolve(sourceArg)
  let sourceStats
  try {
    sourceStats = await fs.stat(sourceDir)
  } catch {
    console.error(`Source directory not found: ${sourceDir}`)
    return
  }

  if (!sourceStats.isDirectory()) {
    console.error(`Source path is not a directory: ${sourceDir}`)
    return
  }

  const albums = await readAlbumsConfig()
  if (!albums.length) {
    console.error('No albums found in src/data/albums.config.json')
    return
  }

  const titleMap = new Map<string, AlbumConfig>()
  for (const album of albums) {
    titleMap.set(normalizeTitle(album.title), album)
  }

  const sourceFiles = await readImageFiles(sourceDir)
  const candidates = sourceFiles.sort(filenameSort)

  const counters = new Map<string, number>()
  const imported: Record<string, string[]> = Object.fromEntries(
    albums.map(album => [album.id, []])
  )
  const unmatched: { file: string; keywords: string[] }[] = []

  try {
    for (const fileName of candidates) {
      const filePath = path.join(sourceDir, fileName)
      const keywords = await extractKeywords(filePath)
      const match = keywords
        .map(keyword => titleMap.get(keyword))
        .find(Boolean)

      if (!match) {
        unmatched.push({ file: fileName, keywords })
        continue
      }

      const albumId = match.id
      const destDir = albumDirectory(match.directory)
      await fs.mkdir(destDir, { recursive: true })

      if (!counters.has(albumId)) {
        const existing = await readImageFiles(destDir)
        counters.set(albumId, nextIndexForAlbum(existing))
      }

      let index = counters.get(albumId) ?? 1
      const ext = path.extname(fileName).toLowerCase()
      const baseSlug = slugify(match.id)
      let baseName = `${String(index).padStart(3, '0')}-${baseSlug}`
      let destPath = path.join(destDir, `${baseName}@${SIZE_TARGETS.large}${ext}`)

      while (true) {
        try {
          await fs.stat(destPath)
          index += 1
          baseName = `${String(index).padStart(3, '0')}-${baseSlug}`
          destPath = path.join(destDir, `${baseName}@${SIZE_TARGETS.large}${ext}`)
        } catch {
          break
        }
      }

      const image = sharp(filePath)
      const resizeOptions = (size: number) => ({
        width: size,
        height: size,
        fit: 'inside' as const,
        withoutEnlargement: true,
      })

      const writeImage = async (size: number) => {
        const outputName = `${baseName}@${size}${ext}`
        const outputPath = path.join(destDir, outputName)
        const pipeline = image.clone().resize(resizeOptions(size))

        if (ext === '.png') {
          await pipeline.png({ compressionLevel: 9 }).toFile(outputPath)
        } else {
          await pipeline.jpeg({ quality: 80, mozjpeg: true }).toFile(outputPath)
        }
      }

      await writeImage(SIZE_TARGETS.thumb)
      await writeImage(SIZE_TARGETS.medium)
      await writeImage(SIZE_TARGETS.large)

      imported[albumId].push(baseName)
      counters.set(albumId, index + 1)
    }
  } finally {
    await exiftool.end()
  }

  await buildGeneratedManifest(albums)

  const totalImported = Object.values(imported).reduce(
    (total, list) => total + list.length,
    0
  )
  console.log(`Imported ${totalImported} file(s).`)
  for (const album of albums) {
    const count = imported[album.id]?.length ?? 0
    if (count) {
      console.log(`- ${album.title}: ${count} file(s)`)
    }
  }

  if (unmatched.length) {
    console.log('\nUnmatched files:')
    for (const entry of unmatched) {
      const keywords = entry.keywords.length ? entry.keywords.join(', ') : 'no keywords'
      console.log(`- ${entry.file} (${keywords})`)
    }
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
