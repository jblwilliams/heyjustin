import './AboutApp.css'
import profilePhoto from '../assets/images/profile.jpg'

function AboutApp(): React.JSX.Element {
  return (
    <div className="about-app">
      <header className="about-header">
        <div className="about-header__texture" aria-hidden="true" />
        <div className="about-header__gloss" aria-hidden="true" />
        <h1 className="about-header__title">About</h1>
        <div className="about-header__border" aria-hidden="true" />
        <div className="about-header__torn-edge" aria-hidden="true" />
      </header>

      <div className="about-body">
        <section className="about-card about-card--animate" style={{ '--delay': '0' } as React.CSSProperties}>
          <div className="about-card__photo">
            <img
              src={profilePhoto}
              alt="Justin Williams"
              className="about-card__photo-image"
            />
            <div className="about-card__photo-gloss" aria-hidden="true" />
          </div>

          <h2 className="about-card__name">Justin Williams</h2>
          <p className="about-card__title">Engineering Leader & Builder</p>
        </section>

        <div className="about-section-group about-section-group--animate" style={{ '--delay': '1' } as React.CSSProperties}>
          <h3 className="about-section-label">Bio</h3>
          <section className="about-section">
            <div className="about-section__content">
              <p>
                I'm an engineering leader with 15+ years of experience building software
                at startups and large technology companies. Most recently, I was an
                Engineering Director at Block (Cash App), where I led teams building
                systems serving 47M+ users.
              </p>
              <p>
                Now I'm co-founder of Crown Dev Studios, a Brooklyn-based software
                company where we work hands-on with startups building custom solutions,
                technical strategy, and system integration.
              </p>
              <p>
                I'm passionate about mobile engineering, AI-powered applications, and
                helping engineering teams ship great products. When I'm not coding,
                you'll find me doing photography around NYC or traveling.
              </p>
            </div>
          </section>
        </div>

        <div className="about-section-group about-section-group--animate" style={{ '--delay': '2' } as React.CSSProperties}>
          <h3 className="about-section-label">Experience</h3>
          <section className="about-section">
            <div className="about-section__list">
              <div className="about-list-item">
                <div className="about-list-item__icon about-list-item__icon--crown">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z"/>
                  </svg>
                </div>
                <div className="about-list-item__content">
                  <div className="about-list-item__label">Crown Dev Studios</div>
                  <div className="about-list-item__value">Co-Founder & Engineering Lead</div>
                </div>
              </div>
              <div className="about-list-item">
                <div className="about-list-item__icon about-list-item__icon--block">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v10H7V7z"/>
                  </svg>
                </div>
                <div className="about-list-item__content">
                  <div className="about-list-item__label">Block (Cash App)</div>
                  <div className="about-list-item__value">Engineering Director</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="about-section-group about-section-group--animate" style={{ '--delay': '3' } as React.CSSProperties}>
          <h3 className="about-section-label">Expertise</h3>
          <section className="about-section">
            <div className="about-section__tags">
              <span className="about-tag about-tag--mobile">Mobile Development</span>
              <span className="about-tag about-tag--mobile">iOS / Swift</span>
              <span className="about-tag about-tag--mobile">Android / Kotlin</span>
              <span className="about-tag about-tag--leadership">Engineering Leadership</span>
              <span className="about-tag about-tag--architecture">System Design</span>
              <span className="about-tag about-tag--ai">AI / ML</span>
              <span className="about-tag about-tag--web">React</span>
              <span className="about-tag about-tag--web">TypeScript</span>
            </div>
          </section>
        </div>

        <div className="about-section-group about-section-group--animate" style={{ '--delay': '4' } as React.CSSProperties}>
          <h3 className="about-section-label">Links</h3>
          <section className="about-section">
            <div className="about-section__list">
              <a
                href="https://crown.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="about-list-item about-list-item--link"
              >
                <div className="about-list-item__icon about-list-item__icon--web">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <div className="about-list-item__content">
                  <div className="about-list-item__value">crown.dev</div>
                </div>
                <div className="about-list-item__arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </div>
              </a>
              <a
                href="https://www.linkedin.com/in/justin-williams-73534a18/"
                target="_blank"
                rel="noopener noreferrer"
                className="about-list-item about-list-item--link"
              >
                <div className="about-list-item__icon about-list-item__icon--linkedin">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </div>
                <div className="about-list-item__content">
                  <div className="about-list-item__value">LinkedIn</div>
                </div>
                <div className="about-list-item__arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </div>
              </a>
              <a
                href="https://github.com/jblwilliams"
                target="_blank"
                rel="noopener noreferrer"
                className="about-list-item about-list-item--link"
              >
                <div className="about-list-item__icon about-list-item__icon--github">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
                  </svg>
                </div>
                <div className="about-list-item__content">
                  <div className="about-list-item__value">GitHub</div>
                </div>
                <div className="about-list-item__arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </div>
              </a>
            </div>
          </section>
        </div>

        <div className="about-section-group about-section-group--animate" style={{ '--delay': '5' } as React.CSSProperties}>
          <a
            href="mailto:justin@crown.dev"
            className="about-cta"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="about-cta__icon" aria-hidden="true">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>Get in Touch</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default AboutApp
