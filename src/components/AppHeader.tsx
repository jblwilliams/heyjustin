import type { ReactNode } from 'react'
import './AppHeader.css'

/**
 * Available header style variants matching iOS 6 app styles
 */
type HeaderVariant = 'blue' | 'dark' | 'leather' | 'silver'

interface AppHeaderProps {
  /**
   * The title displayed in the center of the header
   */
  title: string

  /**
   * Visual style variant of the header
   * - blue: Classic iOS 6 blue glass (default)
   * - dark: Dark metal for Photos, etc.
   * - leather: Brown leather for Notes
   * - silver: Brushed silver for Settings/Contacts
   */
  variant?: HeaderVariant

  /**
   * Optional back button configuration
   * When provided, shows a back button on the left
   */
  onBack?: () => void

  /**
   * Label for the back button (defaults to "Back")
   */
  backLabel?: string

  /**
   * Optional right-side action button
   */
  rightAction?: {
    label: string
    onClick: () => void
  }

  /**
   * Optional subtitle shown below the title
   */
  subtitle?: string

  /**
   * Optional custom content to render in the header
   */
  children?: ReactNode
}

/**
 * AppHeader Component
 *
 * A reusable iOS 6-style navigation bar with glossy gradients,
 * back button support, and multiple visual variants.
 */
function AppHeader({
  title,
  variant = 'blue',
  onBack,
  backLabel = 'Back',
  rightAction,
  subtitle,
  children
}: AppHeaderProps): React.JSX.Element {
  const hasBackButton = Boolean(onBack)
  const hasRightAction = Boolean(rightAction)

  return (
    <header className={`app-header app-header--${variant}`}>
      {/* Brushed metal / leather texture overlay */}
      <div className="app-header__texture" aria-hidden="true" />

      {/* Top shine/gloss highlight */}
      <div className="app-header__gloss" aria-hidden="true" />

      {/* Left section - Back button */}
      <div className="app-header__left">
        {hasBackButton && (
          <button
            className="app-header__back-button"
            onClick={onBack}
            aria-label={`Go back to ${backLabel}`}
          >
            <span className="app-header__back-arrow" aria-hidden="true">
              ‹
            </span>
            <span className="app-header__back-label">{backLabel}</span>
          </button>
        )}
      </div>

      {/* Center section - Title */}
      <div className="app-header__center">
        <h1 className="app-header__title">{title}</h1>
        {subtitle && (
          <p className="app-header__subtitle">{subtitle}</p>
        )}
      </div>

      {/* Right section - Action button */}
      <div className="app-header__right">
        {hasRightAction && rightAction && (
          <button
            className="app-header__action-button"
            onClick={rightAction.onClick}
          >
            {rightAction.label}
          </button>
        )}
      </div>

      {/* Custom children content */}
      {children}

      {/* Bottom border/shadow line */}
      <div className="app-header__border" aria-hidden="true" />
    </header>
  )
}

export default AppHeader
