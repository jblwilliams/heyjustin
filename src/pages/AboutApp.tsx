import './AboutApp.css'
import profilePhoto from '../assets/images/profile.jpg'
import crownDevStudiosLogo from '../assets/images/experience/crown-dev-studios.png'
import blockLogo from '../assets/images/experience/block.jpg'
import staatLogo from '../assets/images/experience/staat.jpg'
import cashAppLogo from '../assets/images/experience/cash-app.jpg'
import handyLogo from '../assets/images/experience/handy-hq.jpg'
import goldmanSachsLogo from '../assets/images/experience/goldman-sachs.jpg'
import nasaLogo from '../assets/images/experience/nasa-logo.svg'

type CapabilityIconName = 'mobile' | 'web' | 'api' | 'cloud' | 'security' | 'experiments' | 'data' | 'automation'

function CapabilityIcon({ name }: { name: CapabilityIconName }): React.JSX.Element {
  switch (name) {
    case 'mobile':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z" />
        </svg>
      )
    case 'web':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H4zm0 2h16v2H4V7zm0 4h16v6H4v-6z" />
        </svg>
      )
    case 'api':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8.59 16.59 4 12l4.59-4.59L10 8.82 6.83 12 10 15.18l-1.41 1.41zM15.41 16.59 14 15.18 17.17 12 14 8.82l1.41-1.41L20 12l-4.59 4.59z" />
        </svg>
      )
    case 'cloud':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-2.89 0-5.4 1.64-6.65 4.04C2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
        </svg>
      )
    case 'security':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.88-7 9-3.72-1.12-6.47-4.88-7-9h7V6.3l7 3.11v2.58h-7V6.3l-7 3.11v2.58h7V6.3z" />
        </svg>
      )
    case 'experiments':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M6 22a5 5 0 0 1-1.1-9.88L9 5.5V4H8a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2h-1v1.5l4.1 6.62A5 5 0 0 1 18 22H6zm2.35-9h7.3L13 9.2V4h-2v5.2L8.35 13z" />
        </svg>
      )
    case 'data':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C7.58 2 4 3.79 4 6v12c0 2.21 3.58 4 8 4s8-1.79 8-4V6c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 .93 6 2s-2.13 2-6 2-6-.93-6-2 2.13-2 6-2zm0 16c-3.87 0-6-.93-6-2v-2.1c1.5 1.05 4.03 1.6 6 1.6s4.5-.55 6-1.6V18c0 1.07-2.13 2-6 2zm0-6c-3.87 0-6-.93-6-2V9.9c1.5 1.05 4.03 1.6 6 1.6s4.5-.55 6-1.6V12c0 1.07-2.13 2-6 2z" />
        </svg>
      )
    case 'automation':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.05 7.05 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 7.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.5a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.68.22l2.39-.96c.5.4 1.05.71 1.63.94l.36 2.54c.04.24.25.42.49.42h3.8c.24 0 .45-.18.49-.42l.36-2.54c.58-.23 1.12-.54 1.63-.94l2.39.96c.25.12.54.02.68-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.56zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z" />
        </svg>
      )
  }
}

function AboutApp(): React.JSX.Element {
  const stats = [
    { value: '50M+', label: 'Users served' },
    { value: '100+', label: 'Countries shipped' },
    { value: '0 → 25', label: 'Team scale' },
    { value: '$1B+', label: 'Assets protected' },
  ] as const

  const capabilities = [
    {
      title: 'Mobile (iOS + Android)',
      description: 'Native apps, shared libraries, performance & reliability.',
      icon: 'mobile',
      iconClassName: 'about-list-item__icon--mobile',
    },
    {
      title: 'Full-stack web',
      description: 'Modern React apps with clean, maintainable TypeScript.',
      icon: 'web',
      iconClassName: 'about-list-item__icon--web',
    },
    {
      title: 'API design + integration',
      description: 'Versioned APIs, auth, migrations, and partner integrations.',
      icon: 'api',
      iconClassName: 'about-list-item__icon--api',
    },
    {
      title: 'Cloud + DevOps',
      description: 'AWS, CI/CD, and observability that scales with the team.',
      icon: 'cloud',
      iconClassName: 'about-list-item__icon--cloud',
    },
    {
      title: 'Data architecture',
      description: 'Schemas, metrics, and instrumentation teams can trust.',
      icon: 'data',
      iconClassName: 'about-list-item__icon--data',
    },
    {
      title: 'Automation + AI helpers',
      description: 'Practical tools that speed up shipping (with guardrails).',
      icon: 'automation',
      iconClassName: 'about-list-item__icon--automation',
    },
  ] as const

  const experiences = [
    {
      company: 'Crown Dev Studios',
      logoSrc: crownDevStudiosLogo,
      roles: [
        { title: 'Co-Founder & Lead Engineer', dates: 'May 2021 – Present' },
      ],
    },
    {
      company: 'Block',
      logoSrc: blockLogo,
      roles: [
        { title: 'Director of Engineering, Emerging Initiatives', dates: 'Dec 2021 – May 2025' },
      ],
    },
    {
      company: 'Staat',
      logoSrc: staatLogo,
      roles: [
        { title: 'Advisory Board Member', dates: 'Nov 2020 – May 2022' },
      ],
    },
    {
      company: 'Cash App',
      logoSrc: cashAppLogo,
      roles: [
        { title: 'Senior Engineering Manager', dates: 'Jan 2020 – Dec 2021' },
      ],
    },
    {
      company: 'Handy HQ',
      logoSrc: handyLogo,
      roles: [
        { title: 'Director Of Mobile Engineering', dates: 'Jul 2019 – Jan 2020' },
        { title: 'Engineering Manager - Mobile', dates: 'Apr 2018 – Jul 2019' },
        { title: 'Engineering Manager - iOS', dates: 'Apr 2017 – Apr 2018' },
        { title: 'Senior Mobile Engineer', dates: 'Feb 2015 – Apr 2017' },
      ],
    },
    {
      company: 'Goldman Sachs',
      logoSrc: goldmanSachsLogo,
      roles: [
        { title: 'Software Engineer', dates: 'Jul 2011 – Feb 2015' },
      ],
    },
    {
      company: 'Goldman Sachs',
      logoSrc: goldmanSachsLogo,
      roles: [
        { title: 'Summer Analyst', dates: 'Jun 2010 – Aug 2010' },
      ],
    },
    {
      company: 'NASA Goddard Space Flight Center',
      logoSrc: nasaLogo,
      roles: [
        { title: 'Software Engineer', dates: 'Jun 2009 – Aug 2009' },
      ],
    },
  ] as const

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
          <p className="about-card__title">Engineering Leader • Hands-on Builder</p>
        </section>

        <div className="about-section-group about-section-group--animate" style={{ '--delay': '1' } as React.CSSProperties}>
          <h3 className="about-section-label">Bio</h3>
          <section className="about-section">
            <div className="about-section__content">
              <p>
                I build products where reliability, security, and good UX all matter.
                I’ve spent 15+ years shipping mobile apps, backend systems, and
                developer platforms at startups and large companies.
              </p>
              <p>
                Most recently at Block (Cash App), I led teams working across Bitcoin
                products, growth, and trust — from secure systems that protect
                customer funds to experimentation and fraud prevention.
              </p>
              <p>
                Now I’m co-founder of Crown Dev Studios, partnering with founders
                and teams on architecture, integrations, and building end-to-end
                products. I’m especially interested in practical automation and
                AI tooling that fits into real workflows (without the hype).
              </p>
            </div>
          </section>
        </div>

        <div className="about-section-group about-section-group--animate" style={{ '--delay': '2' } as React.CSSProperties}>
          <h3 className="about-section-label">At a glance</h3>
          <section className="about-section">
            <div className="about-section__stats">
              {stats.map((stat) => (
                <div key={stat.label} className="about-stat">
                  <div className="about-stat__value">{stat.value}</div>
                  <div className="about-stat__label">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="about-section-group about-section-group--animate" style={{ '--delay': '3' } as React.CSSProperties}>
          <h3 className="about-section-label">What I build</h3>
          <section className="about-section">
            <div className="about-section__list">
              {capabilities.map((capability) => (
                <div key={capability.title} className="about-list-item">
                  <div className={`about-list-item__icon ${capability.iconClassName}`}>
                    <CapabilityIcon name={capability.icon} />
                  </div>
                  <div className="about-list-item__content">
                    <div className="about-list-item__label">{capability.title}</div>
                    <div className="about-list-item__value">{capability.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="about-section-group about-section-group--animate" style={{ '--delay': '4' } as React.CSSProperties}>
          <h3 className="about-section-label">Stack snapshot</h3>
          <section className="about-section">
            <div className="about-section__content">
              <p>
                Tools change. Fundamentals don’t. I'm a generalist that loves working across the stack:
              </p>
            </div>
            <div className="about-section__tags">
              <span className="about-tag about-tag--mobile">iOS (Swift)</span>
              <span className="about-tag about-tag--mobile">Android (Kotlin)</span>
              <span className="about-tag about-tag--mobile">Kotlin Multiplatform</span>
              <span className="about-tag about-tag--mobile">React Native</span>
              <span className="about-tag about-tag--web">React + TypeScript + Vite</span>
              <span className="about-tag about-tag--architecture">APIs (REST / gRPC / protobufs)</span>
              <span className="about-tag about-tag--architecture">Server: Kotlin + Go + Python + Node/Bun</span>
              <span className="about-tag about-tag--data">Postgres + MySQL + DynamoDB</span>
              <span className="about-tag about-tag--infra">AWS</span>
            </div>
          </section>
        </div>

        <div className="about-section-group about-section-group--animate" style={{ '--delay': '5' } as React.CSSProperties}>
          <h3 className="about-section-label">Experience</h3>
          <section className="about-section">
            <div className="about-section__list">
              {experiences.map((experience) => (
                <div
                  key={`${experience.company}-${experience.roles[0]?.title}-${experience.roles[0]?.dates}`}
                  className="about-list-item"
                >
                  <div className="about-list-item__icon about-list-item__icon--logo">
                    <img
                      src={experience.logoSrc}
                      alt={`${experience.company} logo`}
                      loading="lazy"
                    />
                  </div>
                  <div className="about-list-item__content">
                    <div className="about-list-item__label">{experience.company}</div>
                    <div className="about-experience-roles">
                      {experience.roles.map((role) => (
                        <div
                          key={`${role.title}-${role.dates}`}
                          className="about-experience-role"
                        >
                          <div className="about-list-item__value">{role.title}</div>
                          <div className="about-list-item__meta">{role.dates}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="about-section-group about-section-group--animate" style={{ '--delay': '6' } as React.CSSProperties}>
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

        <div className="about-section-group about-section-group--animate" style={{ '--delay': '7' } as React.CSSProperties}>
          <a
            href="mailto:hello@crown.dev"
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
