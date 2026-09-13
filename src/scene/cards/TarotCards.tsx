import { useLanguage } from '@/hooks/useLanguage';
import type { SectionId } from '@/types';
import { useFrame, useThree } from '@react-three/fiber';
import type { MutableRefObject } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import { Group } from 'three';
import {
  CARD_CONFIGS,
  LANDSCAPE_SLOTS,
  PORTRAIT_SLOTS,
  SlotDef,
} from './card-configs';
import { TarotCard } from './TarotCard';

export type TargetPositionsRef = MutableRefObject<[number, number, number][]>;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PORTRAIT_ENTER = 0.85;
const PORTRAIT_LEAVE = 0.75;

export interface TarotCardsProps {
  activeSection: SectionId | null;
  onCardSelect: (id: SectionId | null) => void;
}

export function TarotCards({ activeSection, onCardSelect }: TarotCardsProps) {
  const { t } = useLanguage();
  const { size } = useThree();
  const sceneGroupRef = useRef<Group>(null);
  const isPortraitRef = useRef(false);
  const slotsRef = useRef<SlotDef[]>(LANDSCAPE_SLOTS);

  const slotOrder = useMemo(() => shuffle([0, 1, 2, 3, 4]), []);

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

  const cardDefs = useMemo(
    () =>
      CARD_CONFIGS.map((cfg) => ({
        ...cfg,
        label: labelMap[cfg.id],
      })),
    [labelMap],
  );

  const targetPositions = useRef(
    slotOrder.map(
      (slot) => [...LANDSCAPE_SLOTS[slot].position] as [number, number, number],
    ),
  );

  const handleSelect = useCallback(
    (id: SectionId) => {
      onCardSelect(activeSection === id ? null : id);
    },
    [activeSection, onCardSelect],
  );

  useFrame(() => {
    if (!sceneGroupRef.current) return;

    const ratio = size.height / size.width;
    const wasPortrait = isPortraitRef.current;
    const portrait = wasPortrait
      ? ratio > PORTRAIT_LEAVE
      : ratio > PORTRAIT_ENTER;

    if (portrait !== wasPortrait) {
      isPortraitRef.current = portrait;
      slotsRef.current = portrait ? PORTRAIT_SLOTS : LANDSCAPE_SLOTS;
      for (let i = 0; i < slotOrder.length; i++) {
        const slot = slotsRef.current[slotOrder[i]];
        targetPositions.current[i] = [...slot.position];
      }
    }

    let s: number;
    if (portrait) {
      const ws =
        size.width < 400
          ? 0.78
          : size.width < 480
            ? 0.82
            : size.width < 768
              ? 0.75
              : 0.7;
      const hs = size.height < 650 ? 0.55 : size.height < 800 ? 0.65 : 1;
      s = Math.min(ws, hs);
    } else {
      s =
        size.width < 380
          ? 0.45
          : size.width < 480
            ? 0.55
            : size.width < 680
              ? 0.72
              : size.width < 900
                ? 0.86
                : 0.95;
    }
    sceneGroupRef.current.scale.setScalar(s);
    sceneGroupRef.current.position.y = portrait
      ? size.height < 800
        ? 0.15
        : -0.15
      : 0;
  });

  return (
    <group ref={sceneGroupRef}>
      {cardDefs.map((card, i) => (
        <TarotCard
          key={card.id}
          def={card}
          positionsRef={targetPositions}
          positionIndex={i}
          isActive={activeSection === card.id}
          isAnyActive={activeSection !== null}
          onSelect={handleSelect}
          dealDelay={i * 0.18}
        />
      ))}
    </group>
  );
}
