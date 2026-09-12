import { ReactNode, useCallback, useRef, useState } from 'react';

interface ContactLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  external?: boolean;
}

interface Particle {
  id: number;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
}

let particleId = 0;

export function ContactLink({ href, icon, label, external }: ContactLinkProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const ref = useRef<HTMLAnchorElement>(null);

  const spawnParticles = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
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
    <a
      ref={ref}
      href={href}
      className="contact-link"
      onMouseEnter={spawnParticles}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="contact-link-icon">{icon}</span>
      {label}
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
    </a>
  );
}
