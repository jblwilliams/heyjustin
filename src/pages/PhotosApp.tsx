import { useEffect, useMemo, useRef, useState } from 'react'
import { albums, type Album, type Photo } from '@/data/albums'
import './PhotosApp.css'

type GridSizeKey = 'thumb' | 'medium'

interface LayoutItem {
  photo: Photo
  width: number
  height: number
}

interface LayoutRow {
  height: number
  items: LayoutItem[]
}

const buildFixedRows = (
  photos: Photo[],
  sizeKey: GridSizeKey,
  containerWidth: number,
  columns: number,
  gap: number
): LayoutRow[] => {
  if (containerWidth <= 0) return []

  const columnWidth = (containerWidth - gap * (columns - 1)) / columns

  const rows: LayoutRow[] = []
  let rowItems: LayoutItem[] = []

  for (const photo of photos) {
    const size = photo.dimensions[sizeKey]
    const aspect = size.width / size.height || 1
    const itemWidth = columnWidth
    const itemHeight = itemWidth / aspect
    rowItems.push({ photo, width: itemWidth, height: itemHeight })

    if (rowItems.length === columns) {
      const rowHeight = rowItems.reduce((max, item) => Math.max(max, item.height), 0)
      rows.push({ height: rowHeight, items: rowItems })
      rowItems = []
    }
  }

  if (rowItems.length) {
    const rowHeight = rowItems.reduce((max, item) => Math.max(max, item.height), 0)
    rows.push({ height: rowHeight, items: rowItems })
  }

  return rows
}

function PhotosApp(): React.JSX.Element {
  const [currentView, setCurrentView] = useState<'albums' | 'grid'>('albums')
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [gridWidth, setGridWidth] = useState(0)
  const [gridDpr, setGridDpr] = useState(1)

  const openAlbum = (album: Album) => {
    setSelectedAlbum(album)
    setCurrentView('grid')
  }

  const closeAlbum = () => {
    setCurrentView('albums')
    setTimeout(() => setSelectedAlbum(null), 400)
  }

  const openPhoto = (photo: Photo) => setSelectedPhoto(photo)
  const closePhoto = () => setSelectedPhoto(null)

  useEffect(() => {
    if (!gridRef.current) return

    const update = () => {
      if (!gridRef.current) return
      const styles = window.getComputedStyle(gridRef.current)
      const paddingLeft = Number.parseFloat(styles.paddingLeft || '0')
      const paddingRight = Number.parseFloat(styles.paddingRight || '0')
      const innerWidth = gridRef.current.clientWidth - paddingLeft - paddingRight
      setGridWidth(Math.max(0, innerWidth))
      setGridDpr(window.devicePixelRatio || 1)
    }

    update()

    const observer = new ResizeObserver(update)
    observer.observe(gridRef.current)
    return () => observer.disconnect()
  }, [selectedAlbum])

  const rowGap = 24
  const gridSizeKey: GridSizeKey = gridDpr > 1.4 ? 'medium' : 'thumb'
  const gridColumns = gridWidth <= 640 ? 2 : gridWidth <= 1024 ? 3 : 4
  const rows = useMemo(() => {
    if (!selectedAlbum) return []
    return buildFixedRows(selectedAlbum.photos, gridSizeKey, gridWidth, gridColumns, rowGap)
  }, [gridColumns, gridSizeKey, gridWidth, rowGap, selectedAlbum])

  return (
    <div className="photos-app">
      <header className="photos-header">
        <div className="photos-header__texture" aria-hidden="true" />
        <div className="photos-header__gloss" aria-hidden="true" />
        <div className="photos-header__left">
          {currentView === 'grid' && (
            <button className="photos-header__back" onClick={closeAlbum}>Albums</button>
          )}
        </div>
        <h1 className="photos-header__title">
          {currentView === 'albums' ? 'Albums' : selectedAlbum?.title}
        </h1>
        <div className="photos-header__right" />
        <div className="photos-header__border" aria-hidden="true" />
      </header>

      <div className="photos-body">
        <div className={`photos-view ${currentView === 'albums' ? 'photos-view--active' : 'photos-view--background'}`}>
          <div className="albums-list">
            {albums.map(album => (
              <button key={album.id} className="album-item" onClick={() => openAlbum(album)}>
                <div className="album-stack">
                  <div
                    className="album-stack__photo"
                    style={{ backgroundImage: album.coverPhotos[0] }}
                  />
                  <div
                    className="album-stack__photo"
                    style={{ backgroundImage: album.coverPhotos[1] }}
                  />
                  <div
                    className="album-stack__photo"
                    style={{ backgroundImage: album.coverPhotos[2] }}
                  />
                </div>
                <div className="album-info">
                  <div className="album-title">{album.title}</div>
                  <div className="album-count">({album.count})</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`photos-view ${currentView === 'grid' ? 'photos-view--active' : 'photos-view--hidden'}`}>
          {selectedAlbum && (
            <div
              className="photos-justified"
              ref={gridRef}
              style={{ '--photos-gap': `${rowGap}px` } as React.CSSProperties}
            >
              {rows.map((row, rowIndex) => (
                <div
                  key={`${selectedAlbum.id}-row-${rowIndex}`}
                  className="photos-justified__row"
                  style={{ height: row.height }}
                >
                  {row.items.map((item, itemIndex) => (
                    <button
                      key={item.photo.id}
                      className="photos-justified__item"
                      onClick={() => openPhoto(item.photo)}
                      style={{
                        width: item.width,
                        height: item.height,
                        animationDelay: `${itemIndex * 40}ms`,
                      }}
                    >
                      <img
                        className="photos-justified__image"
                        src={item.photo.sources[gridSizeKey]}
                        alt={item.photo.alt}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPhoto && selectedAlbum && (
        <div className="photos-viewer" onClick={closePhoto}>
          <div className="photos-viewer__top-bar" onClick={e => e.stopPropagation()}>
            <button className="photos-viewer__back" onClick={closePhoto}>Done</button>
            <span className="photos-viewer__title">
              {selectedAlbum.photos.indexOf(selectedPhoto) + 1} of {selectedAlbum.photos.length}
            </span>
          </div>
          <div className="photos-viewer__content">
            <img
              className="photos-viewer__image"
              src={selectedPhoto.sources.large}
              srcSet={`${selectedPhoto.sources.medium} 1600w, ${selectedPhoto.sources.large} 2600w`}
              sizes="100vw"
              alt={selectedPhoto.alt}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotosApp
