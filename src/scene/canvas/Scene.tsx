import { useLanguage } from '@/hooks/useLanguage';
import { TarotCards } from '@/scene/cards/TarotCards';
import { StarField } from '@/scene/effects/StarField';
import { catppuccin, sceneColors } from '@/tokens/theme';
import type { SectionId } from '@/types';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';

function ResponsiveCamera() {
  const { camera, size } = useThree();
  const lastSize = useRef({ w: -1, h: -1 });

  useFrame(() => {
    if (size.width === lastSize.current.w && size.height === lastSize.current.h)
      return;
    lastSize.current = { w: size.width, h: size.height };
    const isPortrait = size.height > size.width;
    const z = isPortrait
      ? size.width < 480
        ? 8
        : 8.5
      : size.width < 480
        ? 8
        : size.width < 1400
          ? 7
          : 5;
    camera.position.z = z;
  });

  return null;
}

export interface SceneProps {
  activeSection: SectionId | null;
  onCardSelect: (id: SectionId | null) => void;
}

export function Scene({ activeSection, onCardSelect }: SceneProps) {
  const { t } = useLanguage();

  const sections = [
    { id: 'projects' as const, label: t.projects.title },
    { id: 'about' as const, label: t.about.title },
    { id: 'formations' as const, label: t.formations.title },
    { id: 'experiences' as const, label: t.experiences.title },
    { id: 'contact' as const, label: t.contact.title },
  ];

  const [bgFrom, bgMid, bgTo] = sceneColors.backgroundGradient;

  return (
    <main
      aria-label="Portfolio"
      style={{
        width: '100%',
        height: '100dvh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
        background: `linear-gradient(180deg, ${bgFrom} 0%, ${bgMid} 50%, ${bgTo} 100%)`,
      }}
    >
      <nav aria-label="Portfolio navigation" className="card-keyboard-nav">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onCardSelect(activeSection === id ? null : id)}
            aria-pressed={activeSection === id}
          >
            {label}
          </button>
        ))}
      </nav>

      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 72 }}
        aria-hidden="true"
        role="presentation"
      >
        <ResponsiveCamera />

        <ambientLight intensity={2.2} color={sceneColors.ambientLight} />

        <pointLight
          position={[0, 0, 7]}
          intensity={3}
          color={catppuccin.rosewater}
          distance={14}
          decay={2}
        />

        <pointLight
          position={[-3, 1, 3]}
          intensity={3}
          color={sceneColors.warmLightA}
          distance={8}
          decay={2}
        />

        <pointLight
          position={[3, 1, 3]}
          intensity={3}
          color={sceneColors.warmLightB}
          distance={8}
          decay={2}
        />

        <pointLight
          position={[0, 3, -1]}
          intensity={0.6}
          color={sceneColors.accentLight}
          distance={10}
          decay={2}
        />

        <TarotCards activeSection={activeSection} onCardSelect={onCardSelect} />

        <fog attach="fog" args={[sceneColors.fog, 10, 22]} />

        <StarField />
      </Canvas>
    </main>
  );
}
