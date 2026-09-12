import { useLanguage } from '@/hooks/useLanguage';
import type { SectionId } from '@/types';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Group } from 'three';
import {
  CARD_CONFIGS,
  CardDef,
  LANDSCAPE_SLOTS,
  PORTRAIT_SLOTS,
} from './card-configs';
import { TarotCard } from './TarotCard';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface TarotCardsProps {
  activeSection: SectionId | null;
  onCardSelect: (id: SectionId | null) => void;
}

export function TarotCards({ activeSection, onCardSelect }: TarotCardsProps) {
  const { t } = useLanguage();
  const { size } = useThree();
  const sceneGroupRef = useRef<Group>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const prevPortrait = useRef(false);

  const slotOrder = useMemo(() => shuffle([0, 1, 2, 3, 4]), []);

  const dynamicSlots = isPortrait ? PORTRAIT_SLOTS : LANDSCAPE_SLOTS;

  const labelMap = useMemo<Record<string, string>>(
    () => ({
      about: t.about.title,
      formations: t.formations.title,
      experiences: t.experiences.title,
      contact: t.contact.title,
      projects: t.projects.title,
    }),
    [t],
  );

  const cards: CardDef[] = useMemo(
    () =>
      CARD_CONFIGS.map((cfg, i) => ({
        ...cfg,
        label: labelMap[cfg.id],
        position: dynamicSlots[slotOrder[i]].position,
      })),
    [labelMap, slotOrder, dynamicSlots],
  );

  const handleSelect = useCallback(
    (id: SectionId) => {
      onCardSelect(activeSection === id ? null : id);
    },
    [activeSection, onCardSelect],
  );

  useFrame(() => {
    if (!sceneGroupRef.current) return;

    const portrait = size.height > size.width * 0.85;
    if (portrait !== prevPortrait.current) {
      prevPortrait.current = portrait;
      setIsPortrait(portrait);
    }

    const s = portrait
      ? size.width < 400
        ? 0.78
        : size.width < 480
          ? 0.82
          : size.width < 768
            ? 0.82
            : 0.8
      : size.width < 380
        ? 0.45
        : size.width < 480
          ? 0.55
          : size.width < 680
            ? 0.72
            : size.width < 900
              ? 0.86
              : 0.95;
    sceneGroupRef.current.scale.setScalar(s);
    sceneGroupRef.current.position.y = portrait ? 0.15 : 0;
  });

  return (
    <group ref={sceneGroupRef}>
      {cards.map((card, i) => (
        <TarotCard
          key={card.id}
          def={card}
          isActive={activeSection === card.id}
          isAnyActive={activeSection !== null}
          onSelect={handleSelect}
          dealDelay={i * 0.18}
        />
      ))}
    </group>
  );
}
