import type { MouseEvent } from 'react'
import AppIcon from '../components/AppIcon'
import './HomeScreen.css'

interface AppConfig {
  id: string
  name: string
  path: string
  icon: string
}

interface HomeScreenProps {
  /**
   * Whether the home screen is currently the active view
   * Used to control visibility/interactions when apps are open
   */
  isHome: boolean

  /**
   * Handler to open an app with animation from the tapped icon
   * @param appName - Display name of the app
   * @param path - Route path to navigate to
   * @param event - Mouse event for calculating animation origin
   */
  onOpenApp: (appName: string, path: string, event: MouseEvent<HTMLElement>) => void
}

const apps: AppConfig[] = [
  {
    id: 'notes',
    name: 'Notes',
    path: '/notes',
    icon: 'notes',
  },
  {
    id: 'about',
    name: 'About',
    path: '/about',
    icon: 'about',
  },
  {
    id: 'photos',
    name: 'Photos',
    path: '/photos',
    icon: 'photos',
  },
]

function HomeScreen({ isHome, onOpenApp }: HomeScreenProps): React.JSX.Element {
  return (
    <div className={`home-screen ${!isHome ? 'home-screen--inactive' : ''}`}>
      <div className="home-screen__grid">
        {apps.map((app, index) => (
          <AppIcon
            key={app.id}
            name={app.name}
            icon={app.icon}
            onClick={(event) => onOpenApp(app.name, app.path, event)}
            animationDelay={index * 50}
          />
        ))}
      </div>
      <div className="dock" aria-label="Dock" />
    </div>
  )
}

export default HomeScreen
