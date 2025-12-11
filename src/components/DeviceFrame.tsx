import { useState, type ReactNode } from 'react'
import './DeviceFrame.css'

interface DeviceFrameProps {
  /**
   * The content to render inside the device screen
   */
  children: ReactNode

  /**
   * Current time to display in the status bar
   */
  time: Date

  /**
   * Whether we're currently on the home screen
   * When true, the home button is hidden
   */
  isHome: boolean

  /**
   * Callback fired when the physical home button is pressed
   */
  onHomePress: () => void
}

/**
 * DeviceFrame Component
 *
 * Renders a skeuomorphic device frame that mimics the original
 * iPhone/iPad hardware. On larger screens, it displays as a
 * floating iPad-style device with bezels. On mobile, it expands
 * to fill the viewport like an iPhone.
 */
function DeviceFrame({
  children,
  time,
  isHome,
  onHomePress
}: DeviceFrameProps): React.JSX.Element {
  const [homeButtonPressed, setHomeButtonPressed] = useState<boolean>(false)

  const handleHomeButtonPress = (): void => {
    setHomeButtonPressed(true)
    if (!isHome) onHomePress()
    setTimeout(() => setHomeButtonPressed(false), 200)
  }

  const handleHomeButtonKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleHomeButtonPress()
    }
  }

  return (
    <div className="device-frame">
      <div className="device-bezel">
        <div className="device-bezel__speaker" aria-hidden="true" />
        <div className="device-bezel__camera" aria-hidden="true" />
        <div className="device-screen">
          <StatusBar time={time} />
          <div className="device-screen__content">
            {children}
          </div>
        </div>
        <button
          className={`device-home-button ${homeButtonPressed ? 'device-home-button--pressed' : ''}`}
          onClick={handleHomeButtonPress}
          onKeyDown={handleHomeButtonKeyDown}
          aria-label="Return to home screen"
          tabIndex={isHome ? -1 : 0}
        >
          <div className="device-home-button__ring" aria-hidden="true">
            <div className="device-home-button__square" aria-hidden="true" />
          </div>
        </button>
      </div>
    </div>
  )
}

interface StatusBarProps {
  time: Date
}

function StatusBar({ time }: StatusBarProps): React.JSX.Element {
  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <div className="status-bar">
      <div className="status-bar__left">
        <span className="status-bar__carrier">heyjustin.dev</span>
      </div>
      <div className="status-bar__center">
        <span className="status-bar__time">{formattedTime}</span>
      </div>
      <div className="status-bar__right">
        <BatteryIcon />
      </div>
    </div>
  )
}

function BatteryIcon(): React.JSX.Element {
  return (
    <span className="status-bar__battery" aria-label="Battery full">
      <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor" aria-hidden="true">
        <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor" fill="none" strokeWidth="1" />
        <rect x="2" y="2" width="18" height="8" rx="1" fill="currentColor" />
        <rect x="22" y="3.5" width="2" height="5" rx="0.5" fill="currentColor" />
      </svg>
    </span>
  )
}

export default DeviceFrame
