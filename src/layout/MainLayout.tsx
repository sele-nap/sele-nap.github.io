import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { AboutSection } from '@/features/AboutSection';
import { ContactSection } from '@/features/ContactSection';
import { ExperiencesSection } from '@/features/ExperiencesSection';
import { FormationsSection } from '@/features/FormationsSection';
import { Modal } from '@/features/Modal';
import { ProjectsSection } from '@/features/ProjectsSection';
import { useLanguage } from '@/hooks/useLanguage';
import { useSparkles } from '@/hooks/useSparkles';
import '@/tokens/panel.css';
import type { SectionId } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

const NAV_SECTIONS: SectionId[] = [
  'about',
  'formations',
  'experiences',
  'projects',
  'contact',
];

const NAV_SYMBOLS: Record<SectionId, string> = {
  about: '⏾',
  formations: '✦',
  experiences: '✷',
  projects: '⬡',
  contact: '✉︎',
};

interface MainLayoutProps {
  activeSection: SectionId | null;
  onSectionSelect: (id: SectionId | null) => void;
}

export function MainLayout({
  activeSection,
  onSectionSelect,
}: MainLayoutProps) {
  const { t } = useLanguage();
  const isOpen = activeSection !== null;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuSparkles = useSparkles(8);
  const cvRef = useRef<HTMLAnchorElement>(null);
  const [cvParticles, setCvParticles] = useState<
    { id: number; sx: number; sy: number; ex: number; ey: number }[]
  >([]);

  const spawnCvParticles = useCallback(() => {
    const el = cvRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const cx = width / 2;
    const cy = height / 2;
    let id = Date.now();
    const pts = Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
      const sx = cx + (cx - 1) * Math.cos(angle);
      const sy = cy + (cy - 1) * Math.sin(angle);
      const dist = 12 + Math.random() * 14;
      return {
        id: id++,
        sx,
        sy,
        ex: sx + Math.cos(angle) * dist,
        ey: sy + Math.sin(angle) * dist,
      };
    });
    setCvParticles(pts);
    setTimeout(() => setCvParticles([]), 800);
  }, []);

  const navLabels: Record<SectionId, string> = {
    projects: t.nav.projects,
    experiences: t.nav.experiences,
    about: t.nav.about,
    formations: t.nav.formations,
    contact: t.nav.contact,
  };

  const handleNavSelect = useCallback(
    (id: SectionId) => {
      onSectionSelect(activeSection === id ? null : id);
      setMenuOpen(false);
    },
    [activeSection, onSectionSelect],
  );

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      <header className="ui-header">
        <div className="site-identity">
          <h1 className="site-name">{t.hero.name}</h1>
          <span className="site-role">{t.hero.title}</span>
          <span className="site-specialty">{t.hero.subtitle}</span>
        </div>
        <div className="header-actions">
          <a
            ref={cvRef}
            href={t.formations.cv.fileName}
            download
            className="header-cv-link"
            aria-label={t.formations.cv.label}
            onMouseEnter={spawnCvParticles}
          >
            {t.hero.cvLabel}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              style={{ marginLeft: '0.3rem', verticalAlign: 'middle' }}
            >
              <path
                d="M3 15C3 17.8284 3 19.2426 3.87868 20.1213C4.75736 21 6.17157 21 9 21H15C17.8284 21 19.2426 21 20.1213 20.1213C21 19.2426 21 17.8284 21 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 3V16M12 16L16 11.625M12 16L8 11.625"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {cvParticles.map((p) => (
              <span
                key={p.id}
                className="link-particle link-particle--yellow"
                style={
                  {
                    '--sx': `${p.sx}px`,
                    '--sy': `${p.sy}px`,
                    '--ex': `${p.ex}px`,
                    '--ey': `${p.ey}px`,
                  } as React.CSSProperties
                }
              />
            ))}
          </a>
          <LanguageSwitcher />
          <button
            className="menu-trigger"
            onClick={(e) => {
              setMenuOpen((p) => !p);
              menuSparkles.spawn(e);
            }}
            aria-label={menuOpen ? t.modal.closeLabel : 'Menu'}
            aria-expanded={menuOpen}
          >
            ꕥ{menuSparkles.elements}
          </button>
        </div>
      </header>

      <div
        className={`nav-overlay${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      >
        <nav
          className="nav-overlay-list"
          aria-label="Navigation"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="nav-overlay-close"
            onClick={() => setMenuOpen(false)}
            aria-label={t.modal.closeLabel}
          >
            ×
          </button>
          {NAV_SECTIONS.map((id, i) => (
            <button
              key={id}
              className={`nav-overlay-item${activeSection === id ? ' active' : ''}`}
              onClick={() => handleNavSelect(id)}
              style={{ '--item-index': i } as React.CSSProperties}
              tabIndex={menuOpen ? 0 : -1}
            >
              <span className="nav-overlay-symbol">{NAV_SYMBOLS[id]}</span>
              <span className="nav-overlay-label">{navLabels[id]}</span>
            </button>
          ))}
        </nav>
      </div>

      {!isOpen && (
        <div className="hero-overlay">
          <p className="hero-hint">{t.hero.hint}</p>
        </div>
      )}

      <footer className="ui-footer">
        <span>{t.footer.made}</span>
        <span className="footer-sep">·</span>
        <span className="footer-tech">{t.footer.tech}</span>
      </footer>

      {isOpen && (
        <Modal
          onClose={() => onSectionSelect(null)}
          closeLabel={t.modal.closeLabel}
        >
          {activeSection === 'about' && <AboutSection />}
          {activeSection === 'formations' && <FormationsSection />}
          {activeSection === 'experiences' && <ExperiencesSection />}
          {activeSection === 'projects' && <ProjectsSection />}
          {activeSection === 'contact' && <ContactSection />}
        </Modal>
      )}
    </>
  );
}
