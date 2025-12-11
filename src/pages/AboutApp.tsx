import './AboutApp.css'

function AboutApp(): React.JSX.Element {
  return (
    <div className="about-app">
      <header className="about-header">
        <div className="about-header__texture" aria-hidden="true" />
        <div className="about-header__gloss" aria-hidden="true" />
        <h1 className="about-header__title">About</h1>
        <div className="about-header__border" aria-hidden="true" />
      </header>

      <div className="about-body">
        <section className="about-card">
          <div className="about-card__photo">
            <div className="about-card__photo-placeholder">
              <span>JW</span>
            </div>
          </div>

          <h2 className="about-card__name">Justin Williams</h2>
          <p className="about-card__title">Engineering Leader & Builder</p>
        </section>

        <section className="about-section">
          <h3 className="about-section__header">Bio</h3>
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

        <section className="about-section">
          <h3 className="about-section__header">Experience</h3>
          <div className="about-section__list">
            <div className="about-list-item">
              <div className="about-list-item__icon about-list-item__icon--work">
                <span aria-hidden="true">💼</span>
              </div>
              <div className="about-list-item__content">
                <div className="about-list-item__label">Crown Dev Studios</div>
                <div className="about-list-item__value">Co-Founder & Engineering Lead</div>
              </div>
            </div>
            <div className="about-list-item">
              <div className="about-list-item__icon about-list-item__icon--work">
                <span aria-hidden="true">💼</span>
              </div>
              <div className="about-list-item__content">
                <div className="about-list-item__label">Block (Cash App)</div>
                <div className="about-list-item__value">Engineering Director</div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h3 className="about-section__header">Expertise</h3>
          <div className="about-section__tags">
            <span className="about-tag">Mobile Development</span>
            <span className="about-tag">iOS / Swift</span>
            <span className="about-tag">Android / Kotlin</span>
            <span className="about-tag">Engineering Leadership</span>
            <span className="about-tag">System Design</span>
            <span className="about-tag">AI / ML</span>
            <span className="about-tag">React</span>
            <span className="about-tag">TypeScript</span>
          </div>
        </section>

        <section className="about-section">
          <h3 className="about-section__header">Links</h3>
          <div className="about-section__list">
            <a
              href="https://crown.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="about-list-item about-list-item--link"
            >
              <div className="about-list-item__icon about-list-item__icon--web">
                <span aria-hidden="true">🌐</span>
              </div>
              <div className="about-list-item__content">
                <div className="about-list-item__value">crown.dev</div>
              </div>
              <div className="about-list-item__arrow" aria-hidden="true">›</div>
            </a>
            <a
              href="https://www.linkedin.com/in/justin-williams-73534a18/"
              target="_blank"
              rel="noopener noreferrer"
              className="about-list-item about-list-item--link"
            >
              <div className="about-list-item__icon about-list-item__icon--linkedin">
                <span aria-hidden="true">in</span>
              </div>
              <div className="about-list-item__content">
                <div className="about-list-item__value">LinkedIn</div>
              </div>
              <div className="about-list-item__arrow" aria-hidden="true">›</div>
            </a>
            <a
              href="https://github.com/jblwilliams"
              target="_blank"
              rel="noopener noreferrer"
              className="about-list-item about-list-item--link"
            >
              <div className="about-list-item__icon about-list-item__icon--github">
                <span aria-hidden="true">⌘</span>
              </div>
              <div className="about-list-item__content">
                <div className="about-list-item__value">GitHub</div>
              </div>
              <div className="about-list-item__arrow" aria-hidden="true">›</div>
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutApp
