import { useCallback, useRef, useState } from 'react';

interface Particle {
  id: number;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
}

let particleId = 0;

interface ProjectItemData {
  title: string;
  period: string;
  company: string;
  description: string;
  tech: readonly string[];
  link?: string;
  linkLabel?: string;
  video?: string;
}

interface ProjectItemProps {
  project: ProjectItemData;
  linkLabel: string;
}

export function ProjectItem({ project, linkLabel }: ProjectItemProps) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  const spawnParticles = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const { width, height } = btn.getBoundingClientRect();
    const cx = width / 2;
    const cy = height / 2;
    const pts: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
      const sx = cx + (cx - 1) * Math.cos(angle);
      const sy = cy + (cy - 1) * Math.sin(angle);
      const dist = 12 + Math.random() * 14;
      pts.push({
        id: particleId++,
        sx,
        sy,
        ex: sx + Math.cos(angle) * dist,
        ey: sy + Math.sin(angle) * dist,
      });
    }
    setParticles(pts);
    setTimeout(() => setParticles([]), 800);
  }, []);

  return (
    <div className="project-item">
      <div className="project-header">
        <h3 className="project-title">{project.title}</h3>
        <span className="project-meta">
          {project.period} · {project.company}
        </span>
      </div>
      <p className="project-description">{project.description}</p>
      <div className="project-tech">
        {project.tech.map((tag, i) => (
          <span key={i} className="project-tech-tag">
            {tag}
          </span>
        ))}
      </div>
      {project.link && (
        <a
          ref={btnRef}
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="project-link-btn"
          onMouseEnter={spawnParticles}
        >
          {particles.map((p) => (
            <span
              key={p.id}
              className="link-particle"
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
          <span className="project-link-icon">↗</span>
          {project.linkLabel || linkLabel}
        </a>
      )}
      {project.video && (
        <video
          className="project-video"
          src={project.video}
          controls
          muted
          loop
          playsInline
          preload="none"
        />
      )}
    </div>
  );
}

export type { ProjectItemData };
