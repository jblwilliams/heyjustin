import { useEffect, useMemo, useRef, useState } from 'react'
import { albums, type Album, type Photo } from '@/data/albums'
import { UnfurlAnimation } from '@/components/UnfurlAnimation'
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

interface LayoutItemWithPosition {
  photo: Photo
  width: number
  height: number
  x: number
  y: number
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
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [currentView, setCurrentView] = useState<'albums' | 'grid'>('albums')
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const gridViewRef = useRef<HTMLDivElement | null>(null)
  const [gridWidth, setGridWidth] = useState(0)
  const [gridDpr, setGridDpr] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationDirection, setAnimationDirection] = useState<'open' | 'close'>('open')
  const [animationOrigin, setAnimationOrigin] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const [animationLayout, setAnimationLayout] = useState<LayoutItemWithPosition[]>([])
  const lastStackOriginRef = useRef<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const toBodySpace = (rect: DOMRect) => {
    const bodyRect = bodyRef.current?.getBoundingClientRect()
    if (!bodyRect) return null
    return {
      x: rect.left + rect.width / 2 - bodyRect.left,
      y: rect.top + rect.height / 2 - bodyRect.top,
      width: rect.width,
      height: rect.height,
    }
  }

  const findAlbumOrigin = (albumId: string) => {
    const stack = document.querySelector(
      `[data-album-id="${albumId}"] .album-stack`
    ) as HTMLElement | null
    const rect = stack?.getBoundingClientRect()

    if (!rect) return null
    return toBodySpace(rect)
  }

  const calculateLayoutPositions = (): LayoutItemWithPosition[] => {
    if (!gridRef.current || !bodyRef.current || !selectedAlbum) return []

    const items: LayoutItemWithPosition[] = []
    const bodyRect = bodyRef.current.getBoundingClientRect()
    const styles = window.getComputedStyle(gridRef.current)
    const paddingLeft = Number.parseFloat(styles.paddingLeft || '0')
    const paddingTop = Number.parseFloat(styles.paddingTop || '0')
    const containerRect = gridRef.current.getBoundingClientRect()
    let currentY = containerRect.top - bodyRect.top + paddingTop

    rows.forEach(row => {
      let currentX = containerRect.left - bodyRect.left + paddingLeft

      row.items.forEach(item => {
        items.push({
          photo: item.photo,
          width: item.width,
          height: item.height,
          x: currentX,
          y: currentY,
        })
        currentX += item.width + rowGap
      })

      currentY += row.height + rowGap
    })

    return items
  }

  const openAlbum = (album: Album, event: React.MouseEvent<HTMLButtonElement>) => {
    if (isAnimating) return

    gridViewRef.current?.scrollTo({ top: 0 })
    const button = event.currentTarget
    const stackElement = button.querySelector('.album-stack') as HTMLElement | null
    const rect = stackElement?.getBoundingClientRect()

    if (!rect) {
      setSelectedAlbum(album)
      setCurrentView('grid')
      return
    }

    const origin = toBodySpace(rect)
    if (!origin) {
      setSelectedAlbum(album)
      setCurrentView('grid')
      return
    }

    lastStackOriginRef.current = origin

    setSelectedAlbum(album)
    setCurrentView('grid')

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const positions = calculateLayoutPositions()
        if (positions.length === 0) {
          return
        }

        setAnimationLayout(positions)
        setAnimationOrigin(origin)
        setAnimationDirection('open')
        setIsAnimating(true)
      })
    })
  }

  const closeAlbum = () => {
    if (!selectedAlbum || isAnimating) return

    const positions = calculateLayoutPositions()
    if (positions.length === 0) {
      setCurrentView('albums')
      setSelectedAlbum(null)
      return
    }

    const origin = findAlbumOrigin(selectedAlbum.id) ?? lastStackOriginRef.current
    if (!origin) {
      setCurrentView('albums')
      setSelectedAlbum(null)
      return
    }

    setAnimationLayout(positions)
    setAnimationOrigin(origin)
    setAnimationDirection('close')

    setCurrentView('albums')

    requestAnimationFrame(() => {
      setIsAnimating(true)
    })
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

  const albumsViewVisible = currentView === 'albums'
  const gridViewVisible = currentView === 'grid' && !isAnimating

  return (
    <div className="photos-app">
      <header className="photos-header">
        <div className="photos-header__texture" aria-hidden="true" />
        <div className="photos-header__gloss" aria-hidden="true" />
        <div className="photos-header__left">
          {currentView === 'grid' && (
            <button className="photos-header__back" onClick={closeAlbum} disabled={isAnimating}>
              Albums
            </button>
          )}
        </div>
        <h1 className="photos-header__title">
          {currentView === 'albums' ? 'Albums' : selectedAlbum?.title}
        </h1>
        <div className="photos-header__right" />
        <div className="photos-header__border" aria-hidden="true" />
      </header>

      <div className="photos-body" ref={bodyRef}>
        <div
          className={`photos-view ${albumsViewVisible ? 'photos-view--active' : 'photos-view--hidden'}`}
          style={{ transition: isAnimating ? 'none' : undefined }}
        >
          <div className="albums-list">
            {albums.map(album => (
              <button
                key={album.id}
                className="album-item"
                data-album-id={album.id}
                onClick={event => openAlbum(album, event)}
                disabled={isAnimating}
              >
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

        <div
          ref={gridViewRef}
          className={`photos-view ${gridViewVisible ? 'photos-view--active' : 'photos-view--hidden'}`}
          style={{
            transition: isAnimating ? 'none' : undefined,
            visibility: selectedAlbum ? 'visible' : 'hidden'
          }}
        >
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
                  {row.items.map((item) => (
                    <button
                      key={item.photo.id}
                      className="photos-justified__item"
                      onClick={() => openPhoto(item.photo)}
                      style={{
                        width: item.width,
                        height: item.height,
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

        {isAnimating && animationOrigin && animationLayout.length > 0 && (
          <UnfurlAnimation
            origin={animationOrigin}
            gridLayout={animationLayout}
            sizeKey={gridSizeKey}
            direction={animationDirection}
            onComplete={() => {
              setIsAnimating(false)
              setAnimationOrigin(null)
              setAnimationLayout([])

              if (animationDirection === 'close') {
                setSelectedAlbum(null)
              }
            }}
          />
        )}
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