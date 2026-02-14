import { useMemo } from 'react';
import type { Visuals } from '@/data/reactions';

interface VisualOutcomeProps {
  visuals: Visuals | null;
  vizScale: number;
  running: boolean;
}

export function VisualOutcome({ visuals, vizScale, running }: VisualOutcomeProps) {
  const bubbles = useMemo(() => {
    if (!running || !visuals || visuals.kind !== 'gas') return [];
    const count = Math.round(10 + 24 * vizScale);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 95}%`,
      delay: `${Math.random() * 1.2}s`,
      duration: `${1.8 + Math.random() * 1.8}s`,
      opacity: 0.35 + Math.random() * 0.35,
      scale: 0.8 + Math.random() * 0.6,
    }));
  }, [running, visuals, vizScale]);

  const precipHeight = running && visuals?.kind === 'precip' ? 10 + 70 * vizScale : 0;
  const precipBg = visuals?.precipColor === 'blue' ? 'rgba(120,165,255,0.88)' : 'rgba(245,245,250,0.9)';

  let heatBg = 'radial-gradient(240px 160px at 50% 60%, rgba(255,170,75,0), rgba(255,170,75,0))';
  if (running && visuals?.kind === 'heat') {
    heatBg = `radial-gradient(240px 160px at 50% 60%, rgba(255,170,75,${0.15 + 0.35 * vizScale}), rgba(255,170,75,0))`;
  }
  if (running && visuals?.kind === 'color' && visuals.colorShift === 'blueToGreen') {
    heatBg = `radial-gradient(260px 180px at 55% 55%, rgba(120,165,255,${0.20 * (1 - vizScale)}), rgba(122,240,166,${0.18 * vizScale}))`;
  }

  return (
    <div className="h-28 rounded-xl border border-border relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, rgba(20,36,71,0.7), rgba(16,26,47,0.45))' }}
    >
      <span className="absolute left-2.5 top-2.5 text-xs text-foreground/85">Visual outcome</span>
      <div className="absolute inset-0 transition-all duration-600" style={{ background: heatBg }} />
      <div
        className="absolute bottom-0 left-0 right-0 transition-all duration-600"
        style={{ height: `${precipHeight}px`, background: precipBg }}
      />
      {bubbles.map(b => (
        <div
          key={b.id}
          className="absolute bottom-[-20px] w-2.5 h-2.5 rounded-full bg-white/75 animate-bubble"
          style={{
            left: b.left,
            animationDelay: b.delay,
            animationDuration: b.duration,
            opacity: b.opacity,
            transform: `scale(${b.scale})`,
          }}
        />
      ))}
    </div>
  );
}
