import { getEmbedMetadata, type TweetMetadata } from '@/data/embedMetadata'
import './embeds.css'

interface TweetEmbedProps {
  url: string
  linkText: string
}

// Twitter (bird) icon. We use this instead of the X mark to match the content styling.
const TWITTER_BIRD_PATH =
  'M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.905-2.06-1.47-3.4-1.47-2.572 0-4.66 2.087-4.66 4.66 0 .364.04.718.12 1.06-3.873-.195-7.304-2.05-9.6-4.87-.4.69-.63 1.49-.63 2.34 0 1.61.82 3.03 2.07 3.86-.76-.02-1.48-.23-2.11-.58v.06c0 2.25 1.6 4.12 3.72 4.55-.39.11-.8.16-1.22.16-.3 0-.59-.03-.87-.08.59 1.83 2.3 3.17 4.33 3.21-1.58 1.24-3.58 1.98-5.75 1.98-.37 0-.74-.02-1.1-.06 2.05 1.31 4.5 2.08 7.13 2.08 8.56 0 13.24-7.09 13.24-13.24 0-.2 0-.41-.02-.61.91-.66 1.7-1.48 2.32-2.42z'

function extractUsername(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status/)
  return match ? match[1] : null
}

export function TweetEmbed({ url, linkText }: TweetEmbedProps): React.JSX.Element {
  const metadata = getEmbedMetadata(url) as TweetMetadata | null
  const username = metadata?.authorHandle || extractUsername(url)

  if (metadata?.type === 'tweet') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="embed-card embed-card--tweet"
      >
        <div className="embed-card__header">
          <img
            src={metadata.authorAvatar}
            alt={metadata.authorName}
            className="embed-card__avatar"
          />
          <div className="embed-card__author-info">
            <span className="embed-card__author-name">{metadata.authorName}</span>
            <span className="embed-card__author-handle">@{metadata.authorHandle}</span>
          </div>
          <svg
            className="embed-card__platform-icon"
            viewBox="0 0 24 24"
            aria-label="Twitter"
          >
            <path d={TWITTER_BIRD_PATH} />
          </svg>
        </div>
        <div className="embed-card__body">
          <p className="embed-card__content">{metadata.text}</p>
        </div>
        <div className="embed-card__meta embed-card__meta--tweet">
          <span className="embed-card__meta-item">{metadata.date}</span>
        </div>
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="embed-card embed-card--tweet"
    >
      <div className="embed-card__header">
        <svg
          className="embed-card__icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d={TWITTER_BIRD_PATH} />
        </svg>
        {username && (
          <span className="embed-card__author">@{username}</span>
        )}
      </div>
      <div className="embed-card__body">
        <p className="embed-card__content">{linkText}</p>
      </div>
    </a>
  )
}
