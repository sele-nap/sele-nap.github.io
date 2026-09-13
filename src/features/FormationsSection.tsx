import { SectionTitle } from '@/base/SectionTitle';
import { DegreeItem } from '@/components/DegreeItem';
import { useLanguage } from '@/hooks/useLanguage';
import { useParticles } from '@/hooks/useParticles';

export function FormationsSection() {
  const { t } = useLanguage();
  const { ref, spawn, elements } = useParticles({ className: 'cv-particle' });

  return (
    <>
      <SectionTitle title={t.formations.title} />
      <p className="modal-text">{t.formations.description}</p>
      <div className="degrees-list">
        {t.formations.degrees.map((degree, i) => (
          <DegreeItem
            key={i}
            period={degree.period}
            institution={degree.school}
            location={degree.location}
            title={degree.title}
            highlights={degree.highlights}
          />
        ))}
      </div>
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={t.formations.cv.fileName}
        download
        className="cv-download-btn"
        onMouseEnter={() => spawn()}
      >
        {elements}
        {t.formations.cv.label}
        <span className="cv-icon">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </span>
      </a>
    </>
  );
}
