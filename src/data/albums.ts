export interface Photo {
  id: number
  src: string
  alt: string
  placeholder: string
}

export interface Album {
  id: string
  title: string
  coverPhotos: string[]
  count: number
  photos: Photo[]
}

interface PhotoSeed {
  file: string
  alt?: string
  placeholder?: string
}

interface AlbumSeed {
  id: string
  title: string
  coverPhotos: string[]
  directory: string
  sort?: 'filename' | 'manual'
  photos: PhotoSeed[]
}

const placeholderPalette = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
]

const filenameSort = (a: PhotoSeed, b: PhotoSeed) =>
  a.file.localeCompare(b.file, undefined, { numeric: true, sensitivity: 'base' })

const buildAlbum = (seed: AlbumSeed): Album => {
  const orderedPhotos =
    seed.sort === 'manual' ? seed.photos : [...seed.photos].sort(filenameSort)

  const photos = orderedPhotos.map((photo, index) => ({
    id: index + 1,
    src: `${seed.directory}/${photo.file}`,
    alt: photo.alt ?? `${seed.title} photo ${index + 1}`,
    placeholder: photo.placeholder ?? placeholderPalette[index % placeholderPalette.length],
  }))

  return {
    id: seed.id,
    title: seed.title,
    coverPhotos: seed.coverPhotos,
    count: photos.length,
    photos,
  }
}

const albumSeeds: AlbumSeed[] = [
  {
    id: 'camera-roll',
    title: 'Camera Roll',
    directory: '/images/albums/camera-roll',
    coverPhotos: [
      'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    ],
    sort: 'filename',
    photos: [
      { file: '001-snow-day.jpg' },
      { file: '002-city-night.jpg' },
      { file: '003-surf-at-dusk.jpg' },
    ],
  },
  {
    id: 'travel',
    title: 'Travel',
    directory: '/images/albums/travel',
    coverPhotos: [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    ],
    sort: 'filename',
    photos: [
      { file: '001-travel.jpg' },
      { file: '002-travel.jpg' },
      { file: '003-travel.jpg' },
      { file: '004-travel.jpg' },
      { file: '005-travel.jpg' },
    ],
  },
  {
    id: 'nature',
    title: 'Nature',
    directory: '/images/albums/nature',
    coverPhotos: [
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    ],
    sort: 'filename',
    photos: [
      { file: '001-nature.jpg' },
      { file: '002-nature.jpg' },
    ],
  },
  {
    id: 'portraits',
    title: 'Portraits',
    directory: '/images/albums/portraits',
    coverPhotos: [
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    ],
    sort: 'filename',
    photos: [
      { file: '001-portraits.jpg' },
      { file: '002-portraits.jpg' },
      { file: '003-portraits.jpg' },
      { file: '004-portraits.jpg' },
      { file: '005-portraits.jpg' },
      { file: '006-portraits.jpg' },
      { file: '007-portraits.jpg' },
      { file: '008-portraits.jpg' },
      { file: '009-portraits.jpg' },
      { file: '010-portraits.jpg' },
      { file: '011-portraits.jpg' },
      { file: '012-portraits.jpg' },
    ],
  },
]

export const albums = albumSeeds.map(buildAlbum)
