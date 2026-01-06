import { useEffect, useRef, useState } from 'react'
import type { Photo } from '@/data/albums'
import './FanOutTransition.css'

const flyDuration = 580
const stagger = 24
const maxStagger = 220

interface LayoutItem {
  photo: Photo
  width: number
  height: number
  x: number
  y: number
}

interface FanOutTransitionProps {
  origin: { x: number; y: number; width: number; height: number }
  gridLayout: LayoutItem[]
  sizeKey: 'thumb' | 'medium'
  direction?: 'open' | 'close'
  targetAlbumId?: string
  onComplete: () => void
}

export function FanOutTransition({
  origin,
  gridLayout,
  sizeKey,
  direction = 'open',
  targetAlbumId,
  onComplete,
}: FanOutTransitionProps) {
  const [phase, setPhase] = useState<'start' | 'fly'>('start')
  const completionRef = useRef<HTMLDivElement | null>(null)
  const didCompleteRef = useRef(false)

  const maxDelay = Math.min((gridLayout.length - 1) * stagger, maxStagger)
  const completionIndex = direction === 'close' ? 0 : gridLayout.length - 1

  useEffect(() => {
    if (direction === 'close' && targetAlbumId) {
      const albumButton = document.querySelector(`[data-album-id="${targetAlbumId}"]`)
      albumButton?.classList.add('album-item--animating')

      return () => {
        albumButton?.classList.remove('album-item--animating')
      }
    }
  }, [direction, targetAlbumId])

  useEffect(() => {
    didCompleteRef.current = false
    setPhase('start')
    const startTimer = requestAnimationFrame(() => {
      setPhase('fly')
    })

    return () => {
      cancelAnimationFrame(startTimer)
    }
  }, [direction, gridLayout.length])

  useEffect(() => {
    if (phase !== 'fly') return

    const node = completionRef.current
    if (!node) return

    const finish = () => {
      if (didCompleteRef.current) return
      didCompleteRef.current = true
      onComplete()
    }

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== node) return
      if (event.propertyName !== 'transform') return
      finish()
    }

    const handleTransitionCancel = (event: TransitionEvent) => {
      if (event.target !== node) return
      if (event.propertyName !== 'transform') return
      finish()
    }

    node.addEventListener('transitionend', handleTransitionEnd)
    node.addEventListener('transitioncancel', handleTransitionCancel)

    const computed = window.getComputedStyle(node)
    const duration = parseFloat(computed.transitionDuration)
    const delay = parseFloat(computed.transitionDelay)
    const needsImmediateFinish = (Number.isNaN(duration) || duration === 0) && (Number.isNaN(delay) || delay === 0)

    if (needsImmediateFinish) {
      const immediate = requestAnimationFrame(() => finish())
      return () => {
        cancelAnimationFrame(immediate)
        node.removeEventListener('transitionend', handleTransitionEnd)
        node.removeEventListener('transitioncancel', handleTransitionCancel)
      }
    }

    return () => {
      node.removeEventListener('transitionend', handleTransitionEnd)
      node.removeEventListener('transitioncancel', handleTransitionCancel)
    }
  }, [onComplete, phase])

  return (
    <div
      className={`fan-out-transition fan-out-transition--${phase}`}
      style={{
        '--fly-duration': `${flyDuration}ms`,
      } as React.CSSProperties}
    >
      {gridLayout.map((item, index) => {
        const delay = Math.min(
          direction === 'close' ? (gridLayout.length - 1 - index) * stagger : index * stagger,
          maxDelay
        )

        const stackRotation = index % 3 === 0 ? -4 : index % 3 === 1 ? 3 : 0

        const scaleX = origin.width / item.width
        const scaleY = origin.height / item.height
        const uniformScale = Math.min(scaleX, scaleY) * 0.85

        const stackX = origin.x - item.width / 2
        const stackY = origin.y - item.height / 2
        const startX = direction === 'close' ? item.x : stackX
        const startY = direction === 'close' ? item.y : stackY
        const endX = direction === 'close' ? stackX : item.x
        const endY = direction === 'close' ? stackY : item.y
        const startScale = direction === 'close' ? 1 : uniformScale
        const endScale = direction === 'close' ? uniformScale : 1
        const startRotation = direction === 'close' ? 0 : stackRotation
        const endRotation = direction === 'close' ? stackRotation : 0

        return (
          <div
            key={item.photo.id}
            className="fan-out-transition__photo"
            ref={index === completionIndex ? completionRef : undefined}
            style={{
              '--start-x': `${startX}px`,
              '--start-y': `${startY}px`,
              '--end-x': `${endX}px`,
              '--end-y': `${endY}px`,
              '--start-rotation': `${startRotation}deg`,
              '--end-rotation': `${endRotation}deg`,
              '--start-scale': startScale,
              '--end-scale': endScale,
              '--delay': `${delay}ms`,
              width: item.width,
              height: item.height,
            } as React.CSSProperties}
          >
            <img
              src={item.photo.sources[sizeKey]}
              alt={item.photo.alt}
              className="fan-out-transition__image"
            />
          </div>
        )
      })}
    </div>
  )
}

