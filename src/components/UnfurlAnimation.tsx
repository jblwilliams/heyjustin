import { useEffect, useState } from 'react'
import type { Photo } from '@/data/albums'
import './UnfurlAnimation.css'

const flyDuration = 580
const fadeDuration = 160
const opacityDuration = 420
const stagger = 24
const maxStagger = 220

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
  targetAlbumId?: string
  onComplete: () => void
}

export function UnfurlAnimation({
  origin,
  gridLayout,
  sizeKey,
  direction = 'open',
  targetAlbumId,
  onComplete,
}: UnfurlAnimationProps) {
  const [phase, setPhase] = useState<'start' | 'fly' | 'complete'>('start')

  const maxDelay = Math.min(Math.max(gridLayout.length - 1, 0) * stagger, maxStagger)

  useEffect(() => {
    if (direction === 'close' && targetAlbumId) {
      const albumButton = document.querySelector(`[data-album-id="${targetAlbumId}"]`)
      if (albumButton) {
        albumButton.classList.add('album-item--animating')
      }

      return () => {
        if (albumButton) {
          albumButton.classList.remove('album-item--animating')
        }
      }
    }
  }, [direction, targetAlbumId])

  useEffect(() => {
    const totalFly = flyDuration + maxDelay

    const startTimer = requestAnimationFrame(() => {
      setPhase('fly')
    })

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
  }, [gridLayout.length, onComplete, maxDelay])

  return (
    <div
      className={`unfurl-animation unfurl-animation--${phase}`}
      style={{
        '--fly-duration': `${flyDuration}ms`,
        '--fade-duration': `${fadeDuration}ms`,
        '--opacity-duration': `${opacityDuration}ms`,
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
            className="unfurl-animation__photo"
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
              className="unfurl-animation__image"
            />
          </div>
        )
      })}
    </div>
  )
}
