import { useMemo } from 'react';
import type { CompoundVisual } from '@/data/knownCompounds';
import type { SynthesisClassification } from '@/utils/synthesisEngine';

interface SynthesisVisualOutcomeProps {
  visual?: CompoundVisual | null;
  classification?: SynthesisClassification;
  mini?: boolean;
}

/** Infer a default visual from classification when no known compound visual exists */
function inferVisual(classification: SynthesisClassification): CompoundVisual {
  switch (classification) {
    case 'ionic':
      return { state: 'solid', color: 'rgba(220,220,230,0.85)', opacity: 0.85, texture: 'crystalline', effects: ['settling'], label: 'Crystalline solid' };
    case 'covalent':
      return { state: 'liquid', color: 'rgba(180,210,240,0.12)', opacity: 0.12, texture: 'liquid', effects: ['shimmer'], label: 'Molecular compound' };
    case 'metallic':
      return { state: 'solid', color: 'rgba(190,195,210,0.9)', opacity: 0.9, texture: 'metallic', effects: ['shimmer'], label: 'Metallic solid' };
    default:
      return { state: 'liquid', color: 'rgba(150,150,170,0.08)', opacity: 0.08, texture: 'liquid', label: 'Unknown substance' };
  }
}

/** SVG pattern for crystalline texture */
function CrystallinePattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="crystalline" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M6 0L12 6L6 12L0 6Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#crystalline)" />
    </svg>
  );
}

/** SVG pattern for powder texture */
function PowderPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="powder" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.8" fill="rgba(255,255,255,0.4)" />
          <circle cx="6" cy="5" r="0.6" fill="rgba(255,255,255,0.3)" />
          <circle cx="4" cy="7" r="0.5" fill="rgba(255,255,255,0.35)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#powder)" />
    </svg>
  );
}

/** SVG pattern for metallic sheen */
function MetallicPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-40"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0) 100%)',
      }}
    />
  );
}

export function SynthesisVisualOutcome({ visual, classification, mini }: SynthesisVisualOutcomeProps) {
  const v = visual ?? inferVisual(classification ?? 'uncertain');
  const effects = v.effects ?? [];
  const height = mini ? 'h-20' : 'h-32';

  // Generate bubbles
  const bubbles = useMemo(() => {
    if (!effects.includes('bubbles')) return [];
    const count = mini ? 6 : 12;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${8 + Math.random() * 84}%`,
      delay: `${Math.random() * 2.5}s`,
      duration: `${2 + Math.random() * 2}s`,
      size: 2 + Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.4,
    }));
  }, [effects, mini]);

  // Generate sparkles
  const sparkles = useMemo(() => {
    if (!effects.includes('sparkle')) return [];
    const count = mini ? 5 : 10;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      top: `${30 + Math.random() * 60}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${1.5 + Math.random() * 2}s`,
    }));
  }, [effects, mini]);

  // Generate vapor wisps
  const vapors = useMemo(() => {
    if (!effects.includes('vapor')) return [];
    const count = mini ? 3 : 6;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${15 + Math.random() * 70}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${2.5 + Math.random() * 2}s`,
      width: 8 + Math.random() * 16,
    }));
  }, [effects, mini]);

  // Generate settling particles
  const settlingParticles = useMemo(() => {
    if (!effects.includes('settling')) return [];
    const count = mini ? 4 : 8;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      delay: `${Math.random() * 2.5}s`,
      duration: `${1.5 + Math.random() * 2}s`,
      size: 2 + Math.random() * 3,
    }));
  }, [effects, mini]);

  // Substance region styles based on state
  const substanceStyle = useMemo(() => {
    switch (v.state) {
      case 'solid':
        return { bottom: 0, left: 0, right: 0, height: mini ? '45%' : '40%', background: v.color, opacity: v.opacity };
      case 'liquid':
        return { bottom: 0, left: 0, right: 0, height: mini ? '70%' : '75%', background: v.color, opacity: v.opacity };
      case 'aqueous':
        return { bottom: 0, left: 0, right: 0, height: mini ? '75%' : '80%', background: v.color, opacity: v.opacity };
      case 'gas':
        return { top: 0, left: 0, right: 0, height: '100%', background: v.color, opacity: v.opacity * 0.5 };
      default:
        return {};
    }
  }, [v, mini]);

  return (
    <div className="space-y-1">
      <div
        className={`${height} rounded-xl border border-border/40 relative overflow-hidden`}
        style={{ background: 'linear-gradient(180deg, rgba(14,22,42,0.85), rgba(10,16,32,0.95))' }}
      >
        {/* Substance layer */}
        <div className="absolute transition-all duration-700 ease-out" style={substanceStyle as React.CSSProperties}>
          {/* Texture overlay */}
          {v.texture === 'crystalline' && <CrystallinePattern />}
          {v.texture === 'powder' && <PowderPattern />}
          {v.texture === 'metallic' && <MetallicPattern />}
        </div>

        {/* Shimmer effect */}
        {effects.includes('shimmer') && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-0 h-full w-1/3"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                animation: 'shimmer 4s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {/* Glow effect */}
        {effects.includes('glow') && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 60%, rgba(255,180,80,0.2), transparent 70%)',
              animation: 'glow-pulse 2.5s ease-in-out infinite',
            }}
          />
        )}

        {/* Bubbles */}
        {bubbles.map(b => (
          <div
            key={b.id}
            className="absolute bottom-0 rounded-full bg-white/60 animate-bubble"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animationDelay: b.delay,
              animationDuration: b.duration,
              opacity: b.opacity,
            }}
          />
        ))}

        {/* Sparkles */}
        {sparkles.map(s => (
          <div
            key={s.id}
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{
              left: s.left,
              top: s.top,
              animation: `sparkle ${s.duration} ease-in-out ${s.delay} infinite`,
            }}
          />
        ))}

        {/* Vapor wisps */}
        {vapors.map(vp => (
          <div
            key={vp.id}
            className="absolute bottom-[30%] rounded-full"
            style={{
              left: vp.left,
              width: vp.width,
              height: vp.width * 0.6,
              background: `radial-gradient(ellipse, rgba(200,210,230,0.25), transparent)`,
              animation: `vapor-rise ${vp.duration} ease-out ${vp.delay} infinite`,
            }}
          />
        ))}

        {/* Settling particles */}
        {settlingParticles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.left,
              bottom: `${20 + Math.random() * 30}%`,
              width: p.size,
              height: p.size,
              background: v.color,
              opacity: v.opacity * 0.7,
              animation: `settle-down ${p.duration} ease-in ${p.delay} infinite`,
            }}
          />
        ))}

        {/* Label */}
        {!mini && (
          <span className="absolute bottom-2 left-3 text-[10px] text-foreground/60 font-medium">
            {v.label}
          </span>
        )}
      </div>
      {mini && (
        <span className="text-[9px] text-muted-foreground block text-center">{v.label}</span>
      )}
    </div>
  );
}
