import { useParticles } from '@/hooks/useParticles';
import type { SectionId } from '@/types';

interface NavItemProps {
  id: SectionId;
  index: number;
  symbol: string;
  label: string;
  active: boolean;
  tabIndex: number;
  onClick: () => void;
}

export function NavItem({
  id,
  index,
  symbol,
  label,
  active,
  tabIndex,
  onClick,
}: NavItemProps) {
  const { spawn, elements } = useParticles({
    count: 4,
    minDist: 6,
    maxDist: 14,
    duration: 600,
    className: 'link-particle link-particle--subtle',
  });

  return (
    <button
      key={id}
      className={`nav-overlay-item${active ? ' active' : ''}`}
      onClick={onClick}
      onMouseEnter={spawn}
      style={{ '--item-index': index } as React.CSSProperties}
      tabIndex={tabIndex}
    >
      <span className="nav-overlay-symbol">{symbol}</span>
      <span className="nav-overlay-label">{label}</span>
      {elements}
    </button>
  );
}
