import { useState } from 'react'
import './PhotosApp.css'

interface Photo {
  id: number
  src: string
  alt: string
  placeholder: string
}

interface Album {
  id: string
  title: string
  coverPhotos: string[]
  count: number
  photos: Photo[]
}

const allPhotos: Photo[] = [
  {
    id: 1,
    src: '/images/photo-1.jpg',
    alt: 'Travel photo 1',
    placeholder: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 2,
    src: '/images/photo-2.jpg',
    alt: 'Travel photo 2',
    placeholder: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 3,
    src: '/images/photo-3.jpg',
    alt: 'Travel photo 3',
    placeholder: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    id: 4,
    src: '/images/photo-4.jpg',
    alt: 'Travel photo 4',
    placeholder: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    id: 5,
    src: '/images/photo-5.jpg',
    alt: 'Travel photo 5',
    placeholder: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
]

const albums: Album[] = [
  {
    id: 'camera-roll',
    title: 'Camera Roll',
    coverPhotos: [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    ],
    count: allPhotos.length,
    photos: allPhotos,
  },
  {
    id: 'favorites',
    title: 'Favorites',
    coverPhotos: [
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    ],
    count: 2,
    photos: [allPhotos[0], allPhotos[4]],
  },
  {
    id: 'instagram',
    title: 'Instagram',
    coverPhotos: [
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    ],
    count: 12,
    photos: allPhotos,
  },
]

function PhotosApp(): React.JSX.Element {
  const [currentView, setCurrentView] = useState<'albums' | 'grid'>('albums')
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

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
                  <div className="album-stack__photo" style={{ background: album.coverPhotos[0] }} />
                  <div className="album-stack__photo" style={{ background: album.coverPhotos[1] }} />
                  <div className="album-stack__photo" style={{ background: album.coverPhotos[2] }} />
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
            <div className="photos-grid">
              {selectedAlbum.photos.map((photo, index) => (
                <button
                  key={photo.id}
                  className="photos-grid__item"
                  onClick={() => openPhoto(photo)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="photos-grid__placeholder" style={{ background: photo.placeholder }} />
                </button>
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
            <div
              className="photos-viewer__placeholder"
              style={{ background: selectedPhoto.placeholder, width: '100%', height: '100%' }}
            />
          </div>
          <div className="photos-viewer__bottom-bar" onClick={e => e.stopPropagation()}>
            <button className="photos-viewer__action">Share</button>
            <button className="photos-viewer__action">Play</button>
            <button className="photos-viewer__action">Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotosApp
