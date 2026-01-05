import albumsConfig from '@/data/albums.config.json'
import albumsGenerated from '@/data/albums.generated.json'

interface AlbumConfig {
  id: string
  title: string
  coverPhotos: string[]
  directory: string
}

interface GeneratedPhotoEntry {
  base: string
  sizes: {
    thumb: { file: string; width: number; height: number }
    medium: { file: string; width: number; height: number }
    large: { file: string; width: number; height: number }
  }
}

interface AlbumsGenerated {
  albums: Record<string, GeneratedPhotoEntry[]>
}

export interface Photo {
  id: number
  src: string
  alt: string
  width: number
  height: number
  dimensions: {
    thumb: { width: number; height: number }
    medium: { width: number; height: number }
    large: { width: number; height: number }
  }
  sources: {
    thumb: string
    medium: string
    large: string
  }
}

export interface Album {
  id: string
  title: string
  coverPhotos: string[]
  count: number
  photos: Photo[]
}

const placeholderPalette = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
]

const filenameSort = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })

const buildAlbum = (config: AlbumConfig, generated: AlbumsGenerated): Album => {
  const files = generated.albums[config.id] ?? []
  const orderedFiles = [...files].sort((a, b) => filenameSort(a.base, b.base))

  const photos = orderedFiles.map((file, index) => ({
    id: index + 1,
    src: `${config.directory}/${file.sizes.large.file}`,
    alt: '',
    width: file.sizes.thumb.width,
    height: file.sizes.thumb.height,
    dimensions: {
      thumb: {
        width: file.sizes.thumb.width,
        height: file.sizes.thumb.height,
      },
      medium: {
        width: file.sizes.medium.width,
        height: file.sizes.medium.height,
      },
      large: {
        width: file.sizes.large.width,
        height: file.sizes.large.height,
      },
    },
    sources: {
      thumb: `${config.directory}/${file.sizes.thumb.file}`,
      medium: `${config.directory}/${file.sizes.medium.file}`,
      large: `${config.directory}/${file.sizes.large.file}`,
    },
  }))

  const coverFiles = photos.slice(-3)
  const coverPhotos = coverFiles.map(photo => `url("${photo.sources.thumb}")`)
  while (coverPhotos.length < 3) {
    const fallback =
      config.coverPhotos[coverPhotos.length] ??
      placeholderPalette[coverPhotos.length % placeholderPalette.length]
    coverPhotos.push(fallback)
  }

  return {
    id: config.id,
    title: config.title,
    coverPhotos,
    count: photos.length,
    photos,
  }
}

export const albums = albumsConfig.albums.map(config => buildAlbum(config, albumsGenerated))
