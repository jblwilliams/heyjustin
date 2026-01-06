import { useEffect, useState } from 'react'
import type { Photo } from '@/data/albums'
import './UnfurlAnimation.css'

interface LayoutItem {
  photo: Photo
  width: number
  height: number
  x: number
  y: number
}

interface UnfurlAnimationProps {
  origin: { x: number; y: number; width: number; height: number }
  gridLayout: LayoutItem[]
  sizeKey: 'thumb' | 'medium'
  direction?: 'open' | 'close'
  onComplete: () => void
}

export function UnfurlAnimation({
  origin,
  gridLayout,
  sizeKey,
  direction = 'open',
  onComplete,
}: UnfurlAnimationProps) {
  const [phase, setPhase] = useState<'start' | 'fly' | 'complete'>('start')

  useEffect(() => {
    const flyDuration = 580
    const fadeDuration = 160
    const stagger = 24
    const maxStagger = 220
    const maxDelay = Math.min(Math.max(gridLayout.length - 1, 0) * stagger, maxStagger)
    const totalFly = flyDuration + maxDelay

    // Start animation immediately.
    const startTimer = requestAnimationFrame(() => {
      setPhase('fly')
    })

    // Complete animation and fade out overlay.
    const completeTimer = window.setTimeout(() => {
      setPhase('complete')
    }, totalFly)

    const cleanupTimer = window.setTimeout(() => {
      onComplete()
    }, totalFly + fadeDuration)

    return () => {
      cancelAnimationFrame(startTimer)
      clearTimeout(completeTimer)
      clearTimeout(cleanupTimer)
    }
  }, [gridLayout.length, onComplete])

  const flyDuration = 580
  const fadeDuration = 160
  const opacityDuration = 420
  const stagger = 24
  const maxStagger = 220
  const maxDelay = Math.min(Math.max(gridLayout.length - 1, 0) * stagger, maxStagger)

  return (
    <div
      className={`unfurl-animation unfurl-animation--${phase}`}
      style={
        {
          '--fly-duration': `${flyDuration}ms`,
          '--fade-duration': `${fadeDuration}ms`,
          '--opacity-duration': `${opacityDuration}ms`,
        } as React.CSSProperties
      }
    >
      {gridLayout.map((item, index) => {
        // Calculate stagger delay - iOS-style wave effect.
        const delay = Math.min(
          direction === 'close' ? (gridLayout.length - 1 - index) * stagger : index * stagger,
          maxDelay
        )

        // Calculate rotation for initial stack effect.
        const stackRotation = index % 3 === 0 ? -4 : index % 3 === 1 ? 3 : 0

        // Calculate initial scale based on stack depth.
        const stackScale = index < 3 ? 0.25 + index * 0.05 : 0.2
        const stackX = origin.x - item.width / 2
        const stackY = origin.y - item.height / 2
        const startX = direction === 'close' ? item.x : stackX
        const startY = direction === 'close' ? item.y : stackY
        const endX = direction === 'close' ? stackX : item.x
        const endY = direction === 'close' ? stackY : item.y
        const startScale = direction === 'close' ? 1 : stackScale
        const endScale = direction === 'close' ? stackScale : 1
        const startRotation = direction === 'close' ? 0 : stackRotation
        const endRotation = direction === 'close' ? stackRotation : 0

        return (
          <div
            key={item.photo.id}
            className="unfurl-animation__photo"
            style={
              {
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
              } as React.CSSProperties
            }
          >
            <img
              src={item.photo.sources[sizeKey]}
              alt={item.photo.alt}
              className="unfurl-animation__image"
            />
          </div>
        )
      })}
    </div>
  )
}
