import { ReactNode, useCallback, useRef, useState } from 'react';

interface ContactLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  external?: boolean;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
}

let sparkleId = 0;

export function ContactLink({ href, icon, label, external }: ContactLinkProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const ref = useRef<HTMLAnchorElement>(null);

  const spawnSparkles = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const batch: Sparkle[] = Array.from({ length: 6 }, () => ({
      id: sparkleId++,
      x: x + (Math.random() - 0.5) * rect.width * 0.8,
      y: y + (Math.random() - 0.5) * rect.height * 1.5,
    }));
    setSparkles((prev) => [...prev, ...batch]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => !batch.includes(s)));
    }, 700);
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      className="contact-link"
      onMouseEnter={spawnSparkles}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="contact-link-icon">{icon}</span>
      {label}
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="contact-sparkle"
          style={{ left: `${s.x}px`, top: `${s.y}px` }}
        />
      ))}
    </a>
  );
}
