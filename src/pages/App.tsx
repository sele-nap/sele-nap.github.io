import { ErrorBoundary } from '@/base/ErrorBoundary';
import { MagicCursor } from '@/base/MagicCursor';
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage';
import { MainLayout } from '@/layout/MainLayout';
import type { SectionId } from '@/types';
import { lazy, Suspense, useState } from 'react';

const Scene = lazy(() =>
  import('@/scene/canvas/Scene').then((m) => ({ default: m.Scene })),
);

function SceneFallback() {
  const { t } = useLanguage();
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#11111b',
        color: '#a6adc8',
        fontFamily: "'Fira Code', monospace",
        fontSize: '0.8rem',
      }}
    >
      {t.hero.hint}
    </div>
  );
}

function AppContent() {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  return (
    <>
      <MagicCursor hidden={activeSection !== null} />
      <ErrorBoundary fallback={<SceneFallback />}>
        <Suspense fallback={<SceneFallback />}>
          <Scene
            activeSection={activeSection}
            onCardSelect={setActiveSection}
          />
        </Suspense>
      </ErrorBoundary>
      <MainLayout
        activeSection={activeSection}
        onSectionSelect={setActiveSection}
      />
    </>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
