import { useCallback, useState } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
}

let sparkleId = 0;

export function useSparkles(count = 6, duration = 700) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const spawn = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const batch: Sparkle[] = Array.from({ length: count }, () => ({
        id: sparkleId++,
        x: x + (Math.random() - 0.5) * rect.width * 0.8,
        y: y + (Math.random() - 0.5) * rect.height * 1.5,
      }));
      setSparkles((prev) => [...prev, ...batch]);
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => !batch.includes(s)));
      }, duration);
    },
    [count, duration],
  );

  const elements = sparkles.map((s) => (
    <span
      key={s.id}
      className="contact-sparkle"
      style={{ left: `${s.x}px`, top: `${s.y}px` }}
    />
  ));

  return { spawn, elements };
}
