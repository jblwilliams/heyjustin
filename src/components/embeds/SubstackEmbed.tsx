import { getEmbedMetadata, type SubstackMetadata } from '@/data/embedMetadata'
import './embeds.css'

interface SubstackEmbedProps {
  url: string
  linkText: string
}

function extractPublication(url: string): string | null {
  const match = url.match(/https?:\/\/([^.]+)\.substack\.com/)
  return match ? match[1] : null
}

export function SubstackEmbed({ url, linkText }: SubstackEmbedProps): React.JSX.Element {
  const metadata = getEmbedMetadata(url) as SubstackMetadata | null
  const publication = metadata?.publicationName || extractPublication(url)

  if (metadata?.type === 'substack') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="embed-card embed-card--substack embed-card--rich"
      >
        <div className="embed-card__header">
          <img
            src={metadata.publicationLogo}
            alt={metadata.publicationName}
            className="embed-card__publication-logo"
          />
          <span className="embed-card__publication-name">{metadata.publicationName}</span>
        </div>
        <div className="embed-card__body">
          <h3 className="embed-card__title">{metadata.title}</h3>
          <p className="embed-card__description">{metadata.description}</p>

          <div className="embed-card__actions">
            <span className="embed-card__cta-button">Read more</span>
            <span className="embed-card__byline">By {metadata.authorName}</span>
          </div>
        </div>
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="embed-card embed-card--substack"
    >
      <div className="embed-card__header">
        <svg
          className="embed-card__icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24l9.56-5.635L20.58 24V10.812H1.46zm21.079-10.812H1.46v2.836h21.08V0z" />
        </svg>
        {publication && (
          <span className="embed-card__author">{publication}.substack.com</span>
        )}
      </div>
      <div className="embed-card__body">
        <p className="embed-card__content embed-card__content--title">{linkText}</p>
        <div className="embed-card__actions">
          <span className="embed-card__cta">Read on Substack</span>
        </div>
      </div>
    </a>
  )
}
