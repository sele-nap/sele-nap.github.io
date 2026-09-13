import { useParticles } from '@/hooks/useParticles';
import { ReactNode } from 'react';

interface ContactLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  external?: boolean;
}

export function ContactLink({ href, icon, label, external }: ContactLinkProps) {
  const { ref, spawn, elements } = useParticles();

  return (
    <a
      ref={ref as React.RefObject<HTMLAnchorElement>}
      href={href}
      className="contact-link"
      onMouseEnter={() => spawn()}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="contact-link-icon">{icon}</span>
      {label}
      {elements}
    </a>
  );
}
