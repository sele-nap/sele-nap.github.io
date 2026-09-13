import { useCallback, useRef, useState } from 'react';

interface Particle {
  id: number;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
}

interface UseParticlesOptions {
  count?: number;
  minDist?: number;
  maxDist?: number;
  duration?: number;
  className?: string;
}

let globalId = 0;

export function useParticles({
  count = 8,
  minDist = 12,
  maxDist = 26,
  duration = 800,
  className = 'link-particle',
}: UseParticlesOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  const spawn = useCallback(
    (e?: React.MouseEvent) => {
      const el = e ? (e.currentTarget as HTMLElement) : ref.current;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      const cx = width / 2;
      const cy = height / 2;
      const pts: Particle[] = Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const sx = cx + (cx - 1) * Math.cos(angle);
        const sy = cy + (cy - 1) * Math.sin(angle);
        const dist = minDist + Math.random() * (maxDist - minDist);
        return {
          id: globalId++,
          sx,
          sy,
          ex: sx + Math.cos(angle) * dist,
          ey: sy + Math.sin(angle) * dist,
        };
      });
      setParticles(pts);
      setTimeout(() => setParticles([]), duration);
    },
    [count, minDist, maxDist, duration],
  );

  const elements = particles.map((p) => (
    <span
      key={p.id}
      className={className}
      style={
        {
          '--sx': `${p.sx}px`,
          '--sy': `${p.sy}px`,
          '--ex': `${p.ex}px`,
          '--ey': `${p.ey}px`,
        } as React.CSSProperties
      }
    />
  ));

  return { ref, spawn, elements };
}
