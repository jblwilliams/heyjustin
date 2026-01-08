import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type MouseEvent,
  type CSSProperties,
} from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import DeviceFrame from './components/DeviceFrame'
import HomeScreen from './pages/HomeScreen'
import NotesApp from './pages/NotesApp'
import AboutApp from './pages/AboutApp'
import PhotosApp from './pages/PhotosApp'
import { notes } from '@/data/notes'
import { Wallpaper } from './components/Wallpaper'
import './styles/variables.css'
import './App.css'

type AnimationState = 'idle' | 'opening' | 'closing'
type Origin = { x: number; y: number } | null

function AppContent(): React.JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const screenRef = useRef<HTMLDivElement | null>(null)
  const baseTitleRef = useRef<string>(document.title)

  const [time, setTime] = useState<Date>(new Date())
  const [animationState, setAnimationState] = useState<AnimationState>('idle')
  const [activeApp, setActiveApp] = useState<string | null>(null)
  const [origin, setOrigin] = useState<Origin>(null)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const isHome = location.pathname === '/'

  useEffect(() => {
    const baseTitle = baseTitleRef.current || 'Justin Williams'

    const setTitle = (prefix?: string): void => {
      document.title = prefix ? `${prefix} — ${baseTitle}` : baseTitle
    }

    if (location.pathname === '/') return setTitle()
    if (location.pathname === '/about') return setTitle('About')
    if (location.pathname === '/photos') return setTitle('Photos')
    if (location.pathname === '/notes') return setTitle('Notes')

    if (location.pathname.startsWith('/notes/')) {
      const rawSlug = location.pathname.slice('/notes/'.length)
      const slug = (() => {
        try {
          return decodeURIComponent(rawSlug)
        } catch {
          return rawSlug
        }
      })()

      const note = notes.find(n => n.slug === slug)
      return setTitle(note?.title ?? 'Notes')
    }

    return setTitle()
  }, [location.pathname])

  const openApp = useCallback(
    (appName: string, path: string, event: MouseEvent<HTMLElement>): void => {
      const iconRect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const screenRect = screenRef.current?.getBoundingClientRect()

      if (screenRect) {
        const x = iconRect.left - screenRect.left + iconRect.width / 2
        const y = iconRect.top - screenRect.top + iconRect.height / 2
        setOrigin({ x, y })
      } else {
        setOrigin(null)
      }

      setActiveApp(appName.toLowerCase())
      setAnimationState('opening')
      navigate(path)

      window.setTimeout(() => setAnimationState('idle'), 300)
    },
    [navigate],
  )

  // Note: We don't reset animationState after closing - keeping 'closing' preserves
  // the animation end state (via CSS forwards) which prevents a flash.
  const closeApp = useCallback((): void => {
    if (isHome) return
    setAnimationState('closing')
    window.setTimeout(() => navigate('/'), 300)
  }, [navigate, isHome])

  const getAppContainerClasses = (): string => {
    const classes = ['app-container']
    if (animationState === 'opening') classes.push('app-container--opening')
    else if (animationState === 'closing') classes.push('app-container--closing')
    if (activeApp) classes.push(`app-container--${activeApp}`)
    if (isHome && animationState !== 'opening') classes.push('app-container--hidden')
    return classes.join(' ')
  }

  const getAppContainerStyle = (): CSSProperties | undefined => {
    if (!origin) return undefined
    return {
      '--app-origin-x': `${origin.x}px`,
      '--app-origin-y': `${origin.y}px`,
    } as CSSProperties
  }

  return (
    <DeviceFrame time={time} isHome={isHome} onHomePress={closeApp}>
      <div ref={screenRef} className="device-screen">
        <Wallpaper dropCount={200} seed={2007} />
        <HomeScreen isHome={isHome} onOpenApp={openApp} />
        <div className={getAppContainerClasses()} style={getAppContainerStyle()}>
          <Routes>
            <Route path="/notes" element={<NotesApp />} />
            <Route path="/notes/:slug" element={<NotesApp />} />
            <Route path="/about" element={<AboutApp />} />
            <Route path="/photos" element={<PhotosApp />} />
          </Routes>
        </div>
      </div>
    </DeviceFrame>
  )
}

function App(): React.JSX.Element {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
