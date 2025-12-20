import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { notes, type Note } from '@/data/notes'
import './NotesApp.css'

function NotesApp(): React.JSX.Element {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)
  const [transitionDirection, setTransitionDirection] = useState<'push' | 'pop'>('push')
  const isPushTransition = isTransitioning && transitionDirection === 'push'
  const isPopTransition = isTransitioning && transitionDirection === 'pop'

  useEffect(() => {
    if (slug) {
      const note = notes.find(n => n.slug === slug)
      if (note) setSelectedNote(note)
    } else {
      setSelectedNote(null)
    }
  }, [slug])

  const handleSelectNote = (note: Note): void => {
    setTransitionDirection('push')
    setIsTransitioning(true)
    navigate(`/notes/${note.slug}`)
    setTimeout(() => setIsTransitioning(false), 400)
  }

  const handleBack = (): void => {
    setTransitionDirection('pop')
    setIsTransitioning(true)
    navigate('/notes')
    setTimeout(() => setIsTransitioning(false), 400)
  }

  return (
    <div className="notes-app">
      <header className="notes-header">
        <div className="notes-header__leather" aria-hidden="true" />
        <div className="notes-header__stitching" aria-hidden="true" />
        <div className={`notes-header__left ${selectedNote ? 'visible' : ''}`}>
          <button
            className="notes-header__back"
            onClick={handleBack}
            aria-label="Go back to notes list"
            tabIndex={selectedNote ? 0 : -1}
          >
            <div className="notes-header__back-shape">
              <span className="notes-header__back-arrow" aria-hidden="true">‹</span>
              <span className="notes-header__back-text">Notes</span>
            </div>
          </button>
        </div>
        <h1 className="notes-header__title">
          {selectedNote ? selectedNote.title : 'Notes'}
        </h1>
        <div className="notes-header__right">
          {!selectedNote && (
            <button className="notes-header__btn-icon" aria-label="New Note">
              <span style={{ fontSize: '24px', lineHeight: 1 }}>+</span>
            </button>
          )}
        </div>
      </header>

      <div className="notes-tear" aria-hidden="true" />

      <div className="notes-body">
        <div
          className={`notes-view notes-list-view
            ${!isTransitioning && selectedNote ? 'notes-view--hidden-left' : ''}
            ${!isTransitioning && !selectedNote ? 'notes-view--active' : ''}
            ${isPopTransition ? 'notes-view--slide-in-left' : ''}
            ${isPushTransition ? 'notes-view--slide-out-left' : ''}`}
          aria-hidden={!!selectedNote}
        >
          <div className="notes-list">
            {notes.map((note) => (
              <button
                key={note.slug}
                className="notes-list__item"
                onClick={() => handleSelectNote(note)}
                aria-label={`Read note: ${note.title}`}
                tabIndex={selectedNote ? -1 : 0}
              >
                <div className="notes-list__item-title">{note.title}</div>
                <div className="notes-list__item-meta">
                  <span className="notes-list__item-date">{note.date}</span>
                  <span className="notes-list__item-preview">{note.preview}</span>
                </div>
                <div className="notes-list__item-arrow" aria-hidden="true">›</div>
              </button>
            ))}
          </div>
        </div>

        {selectedNote && (
          <article
            className={`notes-view notes-detail-view ${isTransitioning ? (transitionDirection === 'push' ? 'notes-view--slide-in-right' : 'notes-view--slide-out-right') : 'notes-view--active'}`}
          >
            <div className="notes-content">
              <time className="notes-content__date">{selectedNote.date}</time>
              <div className="notes-content__text">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedNote.content}
                </ReactMarkdown>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}

export default NotesApp
