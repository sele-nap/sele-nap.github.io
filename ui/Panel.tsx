import { useLanguage } from '../app/LanguageContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import './Panel.css'

interface PanelProps {
  activeSection: string | null
  onClose: () => void
}

export function Panel({ activeSection, onClose }: PanelProps) {
  const { t } = useLanguage()
  const isOpen = activeSection !== null

  return (
    <>
      <div className="ui-header">
        <div className="site-identity">
          <span className="site-name">{t.hero.name}</span>
          <span className="site-role">{t.hero.title}</span>
        </div>
        <LanguageSwitcher />
      </div>

      <footer className="ui-footer">
        <span>{t.footer.made}</span>
        <span className="footer-sep">·</span>
        <span className="footer-tech">{t.footer.tech}</span>
      </footer>

      <div
        className={`modal-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      >
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

          {activeSection === 'about' && (
            <div className="modal-content">
              <h2 className="modal-title">{t.about.title}</h2>
              <div className="modal-accent-line" />
              <p className="modal-text">{t.about.intro}</p>
              <div className="skills-grid">
                {Object.values(t.about.skills).map((group) => (
                  <div key={group.title} className="skill-card">
                    <h3>{group.title}</h3>
                    <ul className="skill-list">
                      {group.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'formations' && (
            <div className="modal-content">
              <h2 className="modal-title">{t.formations.title}</h2>
              <div className="modal-accent-line" />
              <p className="modal-text">{t.formations.description}</p>
              <div className="degrees-list">
                {t.formations.degrees.map((degree, i) => (
                  <div key={i} className="degree-item">
                    <div className="degree-header">
                      <span className="degree-period">{degree.period}</span>
                      <span className="degree-school">{degree.school} · <span className="degree-location">{degree.location}</span></span>
                    </div>
                    <p className="degree-title">{degree.title}</p>
                    <ul className="degree-highlights">
                      {degree.highlights.map((h, j) => (
                        <li key={j}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <a href={t.formations.cv.fileName} download className="cv-download-btn">
                <span className="cv-icon">↓</span>
                {t.formations.cv.label}
              </a>
            </div>
          )}

          {activeSection === 'experiences' && (
            <div className="modal-content">
              <h2 className="modal-title">{t.experiences.title}</h2>
              <div className="modal-accent-line" />
              <p className="modal-text">{t.experiences.description}</p>
              <div className="degrees-list">
                {t.experiences.jobs.map((job, i) => (
                  <div key={i} className="degree-item">
                    <div className="degree-header">
                      <span className="degree-period">{job.period}</span>
                      <span className="degree-school">{job.company} · <span className="degree-location">{job.location}</span></span>
                    </div>
                    <p className="degree-title">{job.title}</p>
                    <ul className="degree-highlights">
                      {job.highlights.map((h, j) => (
                        <li key={j}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'projects' && (
            <div className="modal-content">
              <h2 className="modal-title">{t.projects.title}</h2>
              <div className="modal-accent-line" />
              <p className="modal-text">{t.projects.description}</p>
              <div className="projects-list">
                {t.projects.items.map((project, i) => (
                  <div key={i} className="project-item">
                    <div className="project-header">
                      <h3 className="project-title">{project.title}</h3>
                      <span className="project-meta">{project.period} · {project.company}</span>
                    </div>
                    <p className="project-description">{project.description}</p>
                    <div className="project-tech">
                      {project.tech.map((tag, j) => (
                        <span key={j} className="project-tech-tag">{tag}</span>
                      ))}
                    </div>
                    {project.video && (
                      <video
                        className="project-video"
                        src={project.video}
                        controls
                        muted
                        loop
                        playsInline
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="modal-content">
              <h2 className="modal-title">{t.contact.title}</h2>
              <div className="modal-accent-line" />
              <p className="modal-text">{t.contact.description}</p>
              <div className="contact-links">
                <a href={`mailto:${t.contact.email}`} className="contact-link">
                  <span className="contact-link-icon">
                    <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true">
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                    </svg>
                  </span>
                  {t.contact.email}
                </a>
                <a href={t.contact.githubUrl} className="contact-link" target="_blank" rel="noopener noreferrer">
                  <span className="contact-link-icon">
                    <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                  </span>
                  {t.contact.github}
                </a>
                <a href={t.contact.linkedinUrl} className="contact-link" target="_blank" rel="noopener noreferrer">
                  <span className="contact-link-icon">
                    <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true">
                      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                    </svg>
                  </span>
                  {t.contact.linkedin}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
