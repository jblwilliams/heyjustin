import { useState, type MouseEvent } from 'react'
import './AppIcon.css'

interface AppIconProps {
  /**
   * Display name shown below the icon
   */
  name: string

  /**
   * Icon style variant (notes, about, photos, etc.)
   */
  icon: string

  /**
   * Click handler when icon is tapped
   * Receives the MouseEvent so parent can compute animation origin
   */
  onClick: (event: MouseEvent<HTMLButtonElement>) => void

  /**
   * Optional animation delay for staggered entrance
   */
  animationDelay?: number
}

/**
 * AppIcon Component
 *
 * Renders an iOS 6-style app icon with glossy overlay,
 * rounded corners, drop shadows, and press animations.
 */
function AppIcon({
  name,
  icon,
  onClick,
  animationDelay = 0
}: AppIconProps): React.JSX.Element {
  const [isPressed, setIsPressed] = useState<boolean>(false)

  const handlePressStart = (): void => setIsPressed(true)
  const handlePressEnd = (event: MouseEvent<HTMLButtonElement>): void => {
    setIsPressed(false)
    onClick(event)
  }
  const handlePressCancel = (): void => setIsPressed(false)

  return (
    <button
      className={`app-icon ${isPressed ? 'app-icon--pressed' : ''}`}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressCancel}
      onTouchStart={handlePressStart}
      onTouchEnd={(event) => {
        setIsPressed(false)
        onClick(event as unknown as MouseEvent<HTMLButtonElement>)
      }}
      onTouchCancel={handlePressCancel}
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-label={`Open ${name}`}
    >
      <div className={`app-icon__image app-icon__image--${icon}`}>
        <div className="app-icon__gloss" aria-hidden="true" />
        <div className="app-icon__highlight" aria-hidden="true" />
      </div>
      <span className="app-icon__label">{name}</span>
    </button>
  )
}

export default AppIcon
