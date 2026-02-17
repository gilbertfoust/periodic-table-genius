import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import type { PairAnalysis } from '@/utils/interactionPredictor';
import type { SceneControls } from '@/types/learningLayers';
import type { Group } from 'three';
import * as THREE from 'three';
import { getShellElectrons } from './AtomStructureScene';

interface Props {
  analysis: PairAnalysis;
  controls: SceneControls;
}

export function getBondCaption(a: PairAnalysis): string {
  if (a.bondConfidence === 'uncertain') {
    return `⚠ Caution: The interaction between ${a.a.sym} and ${a.b.sym} is uncertain (${a.enDeltaLabel}). Multiple outcomes are possible depending on conditions. ${a.uncertaintyFlags.join(' ')}`;
  }
  return `Bond formation between ${a.a.sym} and ${a.b.sym}: ${a.bondType} (${a.enDeltaLabel}). ${a.interactionType}.`;
}

// ─── LOOP CONSTANTS ───────────────────────────────────────────────────────────
// 0.0 → 1.0: animation plays
// 1.0 → 1.8: bonded state holds (learner can study it)
// > 1.8: reset to 0
const LOOP_HOLD = 1.8;
const LOOP_RESET = 0;

export function BondFormationScene({ analysis, controls }: Props) {
  const groupRef = useRef<Group>(null);
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    if (controls.scrubPhase !== null) {
      progressRef.current = controls.scrubPhase;
    } else if (!controls.paused) {
      progressRef.current += delta * 0.32 * controls.speed;
      if (progressRef.current > LOOP_HOLD) {
        progressRef.current = LOOP_RESET;
      }
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += (controls.paused && controls.scrubPhase === null ? 0 : delta * 0.1 * controls.speed);
    }
  });

  const isUncertain = analysis.bondConfidence === 'uncertain';
  const bt = analysis.bondType;
  const showDipole = controls.overlays['dipole'] && bt.toLowerCase().includes('polar') && !bt.includes('Ionic');
  const showCharges = controls.overlays['charges'] !== false;
  const level = controls.level;

  const aEN = analysis.a.en ?? 0;
  const bEN = analysis.b.en ?? 0;
  const donorLeft = aEN <= bEN;

  const colorA = '#60a5fa';
  const colorB = '#f87171';

  if (isUncertain) {
    return (
      <>
        <OrbitControls enableDamping dampingFactor={0.1} enableZoom enablePan={false} />
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 3, 3]} intensity={1.5} color="#fff" />
        <group ref={groupRef}>
          <group position={[-1.4, 0, 0]}>
            <mesh><sphereGeometry args={[0.5, 20, 20]} /><meshStandardMaterial color={colorA} transparent opacity={0.35} roughness={0.3} metalness={0.1} /></mesh>
          </group>
          <group position={[1.4, 0, 0]}>
            <mesh><sphereGeometry args={[0.5, 20, 20]} /><meshStandardMaterial color={colorB} transparent opacity={0.35} roughness={0.3} metalness={0.1} /></mesh>
          </group>
          <Html center>
            <span style={{ color: '#fbbf24', fontSize: 28, fontWeight: 900, pointerEvents: 'none' }}>?</span>
          </Html>
          <Html center position={[-1.4, -0.85, 0]}>
            <span style={{ color: '#e2e8f0', fontSize: 11, pointerEvents: 'none', fontWeight: 700 }}>{analysis.a.sym}</span>
          </Html>
          <Html center position={[1.4, -0.85, 0]}>
            <span style={{ color: '#e2e8f0', fontSize: 11, pointerEvents: 'none', fontWeight: 700 }}>{analysis.b.sym}</span>
          </Html>
        </group>
      </>
    );
  }

  if (bt === 'Ionic') {
    return (
      <>
        <OrbitControls enableDamping dampingFactor={0.1} enableZoom enablePan={false} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 3, 3]} intensity={2} color="#e0f2fe" />
        <pointLight position={[-3, -1, 2]} intensity={1} color={colorA} />
        <pointLight position={[3, -1, 2]} intensity={1} color={colorB} />
        <IonicScene
          groupRef={groupRef}
          progressRef={progressRef}
          colorA={colorA}
          colorB={colorB}
          donorLeft={donorLeft}
          analysis={analysis}
          showCharges={showCharges}
          level={level}
        />
      </>
    );
  }

  if (bt.includes('covalent') || bt.includes('Covalent') || bt.includes('polar')) {
    return (
      <>
        <OrbitControls enableDamping dampingFactor={0.1} enableZoom enablePan={false} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 3, 3]} intensity={2} color="#f0fdf4" />
        <pointLight position={[-3, -1, 2]} intensity={1} color={colorA} />
        <pointLight position={[3, -1, 2]} intensity={1} color={colorB} />
        <CovalentScene
          groupRef={groupRef}
          progressRef={progressRef}
          colorA={colorA}
          colorB={colorB}
          showDipole={showDipole}
          analysis={analysis}
          level={level}
        />
      </>
    );
  }

  if (bt.includes('Metallic') || bt.includes('alloy')) {
    return (
      <>
        <OrbitControls enableDamping dampingFactor={0.1} enableZoom enablePan={false} />
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 2, 3]} intensity={2} color="#fef9c3" />
        <pointLight position={[-2, -1, 2]} intensity={0.8} color={colorA} />
        <pointLight position={[2, -1, 2]} intensity={0.8} color={colorB} />
        <MetallicScene groupRef={groupRef} colorA={colorA} colorB={colorB} analysis={analysis} />
      </>
    );
  }

  return (
    <>
      <OrbitControls enableDamping dampingFactor={0.1} enableZoom enablePan={false} />
      <ambientLight intensity={0.6} />
      <group ref={groupRef}>
        <mesh position={[-1, 0, 0]}><sphereGeometry args={[0.5, 20, 20]} /><meshStandardMaterial color={colorA} /></mesh>
        <mesh position={[1, 0, 0]}><sphereGeometry args={[0.5, 20, 20]} /><meshStandardMaterial color={colorB} /></mesh>
        <Html center position={[0, 1, 0]}>
          <span style={{ color: '#94a3b8', fontSize: 11, pointerEvents: 'none' }}>No typical bond</span>
        </Html>
      </group>
    </>
  );
}

// ─── Glow sphere (additive blending halo) ────────────────────────────────────
function GlowSphere({ radius, color, opacity = 0.18 }: { radius: number; color: string; opacity?: number }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

// ─── Orbiting electron ring helper ───────────────────────────────────────────
function ElectronRing({
  count,
  radius,
  color,
  speed,
  phase = 0,
  tilt = 0,
  scale = 1,
  opacity = 1,
  electronSize = 0.07,
}: {
  count: number;
  radius: number;
  color: string;
  speed: number;
  phase?: number;
  tilt?: number;
  scale?: number;
  opacity?: number;
  electronSize?: number;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta * speed;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const angle = t.current + phase + (i / count) * Math.PI * 2;
      m.position.x = Math.cos(angle) * radius * scale;
      m.position.y = Math.sin(angle * 0.4 + tilt) * 0.18 * scale;
      m.position.z = Math.sin(angle) * radius * scale;
      (m.material as THREE.MeshStandardMaterial).opacity = opacity;
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          position={[Math.cos((i / count) * Math.PI * 2) * radius, 0, Math.sin((i / count) * Math.PI * 2) * radius]}
        >
          <sphereGeometry args={[electronSize, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── Shell orbit ring (visual ring torus) ─────────────────────────────────────
function OrbitRing({ radius, color = '#475569', opacity = 0.2 }: { radius: number; color?: string; opacity?: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.012, 8, 64]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

// ─── EN force arrow (electronegativity pull) ──────────────────────────────────
function ENForceArrow({ progressRef, fromX, toX, color }: {
  progressRef: React.MutableRefObject<number>;
  fromX: number; toX: number; color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!meshRef.current) return;
    const p = Math.min(progressRef.current, 1);
    const opacity = Math.min(p * 3, 1) * 0.9;
    (meshRef.current.material as THREE.MeshStandardMaterial).opacity = opacity;
    meshRef.current.visible = p > 0.05;
  });
  const midX = (fromX + toX) / 2;
  const dir = toX > fromX ? 1 : -1;
  return (
    <mesh ref={meshRef} position={[midX + dir * 0.15, 0.6, 0]} rotation={[0, 0, dir > 0 ? 0.4 : -0.4]} visible={false}>
      <coneGeometry args={[0.07, 0.28, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0} />
    </mesh>
  );
}

// ─── IONIC SCENE ─────────────────────────────────────────────────────────────
function IonicScene({ groupRef, progressRef, colorA, colorB, donorLeft, analysis, showCharges, level }: any) {
  const [inspected, setInspected] = useState<'a' | 'b' | null>(null);
  const leftNucRef = useRef<THREE.Mesh>(null);
  const rightNucRef = useRef<THREE.Mesh>(null);
  const bondArcRef = useRef<THREE.Mesh>(null);

  const shellsA = useMemo(() => getShellElectrons(analysis.a.Z), [analysis.a.Z]);
  const shellsB = useMemo(() => getShellElectrons(analysis.b.Z), [analysis.b.Z]);
  const valenceCountA = shellsA[shellsA.length - 1] ?? 1;
  const valenceCountB = shellsB[shellsB.length - 1] ?? 1;
  const transferCount = Math.min(donorLeft ? valenceCountA : valenceCountB, 3);

  const enA = analysis.a.en ?? 0;
  const enB = analysis.b.en ?? 0;
  const enDiff = Math.abs(enA - enB);

  // Nucleus glow refs
  const leftGlowRef = useRef<THREE.Mesh>(null);
  const rightGlowRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const t = Math.min(progressRef.current, 1);
    const donorScale = THREE.MathUtils.lerp(1, 0.78, Math.min(t * 2, 1));
    const acceptorScale = THREE.MathUtils.lerp(1, 1.18, Math.min(t * 2, 1));

    if (leftNucRef.current) {
      leftNucRef.current.scale.setScalar(donorLeft ? donorScale : acceptorScale);
    }
    if (rightNucRef.current) {
      rightNucRef.current.scale.setScalar(donorLeft ? acceptorScale : donorScale);
    }

    // Glow pulses brighter as ions form
    const glowIntensity = THREE.MathUtils.lerp(0.3, 1.4, Math.min(t * 1.5, 1));
    if (leftGlowRef.current) {
      (leftGlowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glowIntensity;
      (leftGlowRef.current.material as THREE.MeshStandardMaterial).opacity = THREE.MathUtils.lerp(0.08, 0.22, Math.min(t * 1.5, 1));
    }
    if (rightGlowRef.current) {
      (rightGlowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glowIntensity;
      (rightGlowRef.current.material as THREE.MeshStandardMaterial).opacity = THREE.MathUtils.lerp(0.08, 0.22, Math.min(t * 1.5, 1));
    }

    // Ionic bond attraction arc grows after transfer
    if (bondArcRef.current) {
      const arcOpacity = Math.min(Math.max((t - 0.75) / 0.2, 0), 1) * 0.45;
      (bondArcRef.current.material as THREE.MeshStandardMaterial).opacity = arcOpacity;
      bondArcRef.current.visible = arcOpacity > 0.01;
    }
  });

  const donorIon = donorLeft ? analysis.ionA : analysis.ionB;
  const acceptorIon = donorLeft ? analysis.ionB : analysis.ionA;
  const t = Math.min(progressRef.current, 1);

  const valenceRadiusA = 0.6 + (shellsA.length - 1) * 0.24;
  const valenceRadiusB = 0.6 + (shellsB.length - 1) * 0.24;

  // Phase label
  const phaseLabel = t < 0.12
    ? `Atoms approaching (ΔEN = ${enDiff.toFixed(1)})`
    : t < 0.55
    ? `e⁻ transferring: ${analysis.a.sym} → ${analysis.b.sym}…`
    : t < 0.85
    ? 'Transfer complete — ions forming…'
    : `${analysis.a.sym}${donorLeft ? '⁺' : '⁻'} · ${analysis.b.sym}${donorLeft ? '⁻' : '⁺'} ionic bond ✓`;

  return (
    <group ref={groupRef}>
      {/* ── Atom A (left) ── */}
      <group position={[-1.65, 0, 0]}>
        {/* Orbit rings */}
        {shellsA.map((_, si) => (
          <OrbitRing key={si} radius={0.6 + si * 0.24} color={colorA} opacity={0.18} />
        ))}

        <mesh
          ref={leftNucRef}
          onClick={(e) => { e.stopPropagation(); setInspected(inspected === 'a' ? null : 'a'); }}
          castShadow
        >
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshStandardMaterial color={colorA} roughness={0.25} metalness={0.15} emissive={colorA} emissiveIntensity={0.35} />
        </mesh>

        {/* Glow halo */}
        <mesh ref={leftGlowRef}>
          <sphereGeometry args={[0.68, 16, 16]} />
          <meshStandardMaterial color={colorA} emissive={colorA} emissiveIntensity={0.3} transparent opacity={0.08} depthWrite={false} />
        </mesh>

        <Html center distanceFactor={6}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', gap: 1 }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>{analysis.a.sym}</span>
            {level !== 'beginner' && <span style={{ color: '#93c5fd', fontSize: 8 }}>EN {analysis.a.en?.toFixed(1) ?? '?'}</span>}
          </div>
        </Html>

        {/* Inner shells */}
        {shellsA.slice(0, -1).map((cnt, si) => (
          <ElectronRing key={si} count={Math.min(cnt, 4)} radius={0.6 + si * 0.24} color={colorA} speed={1.4 - si * 0.15} phase={si * 1.1} tilt={si * 0.25} opacity={0.5} electronSize={0.065} />
        ))}

        {/* Valence shell — fades when electron leaves */}
        <ValenceRingWithFade count={valenceCountA} radius={valenceRadiusA} color="#34d399" speed={2.0} progress={progressRef} fade={donorLeft} />
      </group>

      {/* ── Atom B (right) ── */}
      <group position={[1.65, 0, 0]}>
        {shellsB.map((_, si) => (
          <OrbitRing key={si} radius={0.6 + si * 0.24} color={colorB} opacity={0.18} />
        ))}

        <mesh
          ref={rightNucRef}
          onClick={(e) => { e.stopPropagation(); setInspected(inspected === 'b' ? null : 'b'); }}
          castShadow
        >
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshStandardMaterial color={colorB} roughness={0.25} metalness={0.15} emissive={colorB} emissiveIntensity={0.35} />
        </mesh>

        <mesh ref={rightGlowRef}>
          <sphereGeometry args={[0.68, 16, 16]} />
          <meshStandardMaterial color={colorB} emissive={colorB} emissiveIntensity={0.3} transparent opacity={0.08} depthWrite={false} />
        </mesh>

        <Html center distanceFactor={6}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', gap: 1 }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>{analysis.b.sym}</span>
            {level !== 'beginner' && <span style={{ color: '#fca5a5', fontSize: 8 }}>EN {analysis.b.en?.toFixed(1) ?? '?'}</span>}
          </div>
        </Html>

        {shellsB.slice(0, -1).map((cnt, si) => (
          <ElectronRing key={si} count={Math.min(cnt, 4)} radius={0.6 + si * 0.24} color={colorB} speed={1.4 - si * 0.15} phase={si * 1.4} tilt={-si * 0.25} opacity={0.5} electronSize={0.065} />
        ))}

        <ValenceRingWithFade count={valenceCountB} radius={valenceRadiusB} color="#34d399" speed={2.0} progress={progressRef} fade={!donorLeft} />

        {/* Acceptor gain ring — new shell after transfer */}
        <AcceptorGainRing count={transferCount} radius={valenceRadiusB + 0.28} color="#34d399" progress={progressRef} show={donorLeft} />
      </group>

      {/* Acceptor gain ring on left if B is donor */}
      {!donorLeft && (
        <group position={[-1.65, 0, 0]}>
          <AcceptorGainRing count={transferCount} radius={valenceRadiusA + 0.28} color="#34d399" progress={progressRef} show={true} />
        </group>
      )}

      {/* Flying transfer electrons with glowing trails */}
      {Array.from({ length: transferCount }).map((_, i) => (
        <TransferElectronOffset
          key={i}
          progressRef={progressRef}
          fromX={donorLeft ? -1.65 : 1.65}
          toX={donorLeft ? 1.65 : -1.65}
          offsetPhase={i * 0.16}
        />
      ))}

      {/* EN pull force arrow */}
      <ENForceArrow
        progressRef={progressRef}
        fromX={donorLeft ? -1.65 : 1.65}
        toX={donorLeft ? 1.65 : -1.65}
        color="#fbbf24"
      />

      {/* Ionic bond arc (connecting line when bonded) */}
      <mesh ref={bondArcRef} visible={false} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 3.3, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.5} transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Tooltips */}
      {inspected && (
        <Html center position={[inspected === 'a' ? -1.65 : 1.65, 1.55, 0]}>
          <div style={{ background: 'rgba(0,0,0,0.92)', color: '#e2e8f0', padding: '5px 10px', borderRadius: 7, fontSize: 9, whiteSpace: 'nowrap', pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.12)' }}>
            {inspected === 'a' ? analysis.a.name : analysis.b.name} · EN {inspected === 'a' ? analysis.a.en?.toFixed(1) : analysis.b.en?.toFixed(1)} ·{' '}
            {donorLeft ? (inspected === 'a' ? 'Electron donor → cation' : 'Electron acceptor → anion') : (inspected === 'a' ? 'Electron acceptor → anion' : 'Electron donor → cation')}
          </div>
        </Html>
      )}

      {/* Charge labels */}
      {showCharges && t > 0.82 && (
        <>
          <Html center position={[-1.65, 1.1, 0]}>
            <span style={{ color: donorLeft ? '#60a5fa' : '#f87171', fontSize: 15, fontWeight: 900, pointerEvents: 'none', textShadow: '0 0 8px currentColor' }}>
              {donorLeft ? (donorIon.typicalCharge ?? '+') : (acceptorIon.typicalCharge ?? '−')}
            </span>
          </Html>
          <Html center position={[1.65, 1.1, 0]}>
            <span style={{ color: donorLeft ? '#f87171' : '#60a5fa', fontSize: 15, fontWeight: 900, pointerEvents: 'none', textShadow: '0 0 8px currentColor' }}>
              {donorLeft ? (acceptorIon.typicalCharge ?? '−') : (donorIon.typicalCharge ?? '+')}
            </span>
          </Html>
        </>
      )}

      {/* Phase label */}
      <Html center position={[0, -2.1, 0]}>
        <div style={{
          color: t > 0.85 ? '#34d399' : '#94a3b8',
          fontSize: 10,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          fontWeight: t > 0.85 ? 700 : 400,
          textShadow: t > 0.85 ? '0 0 6px #34d399' : 'none',
          transition: 'color 0.3s',
        }}>
          {phaseLabel}
        </div>
      </Html>
    </group>
  );
}

// ─── Valence ring that fades out when donor ────────────────────────────────────
function ValenceRingWithFade({ count, radius, color, speed, progress, fade }: {
  count: number; radius: number; color: string; speed: number;
  progress: React.MutableRefObject<number>; fade: boolean;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta * speed;
    const p = Math.min(progress.current, 1);
    const opacity = fade ? Math.max(0, 1 - p * 2.8) : 1;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const angle = t.current + (i / count) * Math.PI * 2;
      m.position.x = Math.cos(angle) * radius;
      m.position.y = Math.sin(angle * 0.5) * 0.14;
      m.position.z = Math.sin(angle) * radius;
      (m.material as THREE.MeshStandardMaterial).opacity = opacity;
      m.visible = opacity > 0.02;
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.085, 10, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} transparent opacity={1} />
        </mesh>
      ))}
    </>
  );
}

// ─── Acceptor gain ring (new shell appearing) ─────────────────────────────────
function AcceptorGainRing({ count, radius, color, progress, show }: {
  count: number; radius: number; color: string;
  progress: React.MutableRefObject<number>; show: boolean;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(0);

  useFrame((_, delta) => {
    if (!show) return;
    t.current += delta * 1.6;
    const p = Math.min(progress.current, 1);
    const opacity = Math.min(Math.max(p * 2.8 - 1.3, 0), 1);
    refs.current.forEach((m, i) => {
      if (!m) return;
      const angle = t.current + (i / count) * Math.PI * 2;
      m.position.x = Math.cos(angle) * radius;
      m.position.y = Math.sin(angle * 0.5) * 0.12;
      m.position.z = Math.sin(angle) * radius;
      (m.material as THREE.MeshStandardMaterial).opacity = opacity;
      m.visible = opacity > 0.01;
    });
  });

  if (!show) return null;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.085, 10, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} transparent opacity={0} />
        </mesh>
      ))}
    </>
  );
}

// ─── Transfer electron with arc trail ─────────────────────────────────────────
function TransferElectronOffset({ progressRef, fromX, toX, offsetPhase }: {
  progressRef: React.MutableRefObject<number>;
  fromX: number; toX: number; offsetPhase: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const trailRefs = useRef<(THREE.Mesh | null)[]>([]);
  const TRAIL = 4;

  useFrame(() => {
    if (!ref.current) return;
    const looped = progressRef.current % LOOP_HOLD;
    const raw = Math.max(looped - offsetPhase, 0);
    const t = Math.min(raw * 1.6, 1);
    const x = THREE.MathUtils.lerp(fromX, toX, t);
    const y = Math.sin(t * Math.PI) * (0.8 + offsetPhase * 1.8);
    ref.current.position.x = x;
    ref.current.position.y = y;
    ref.current.visible = t > 0.02 && t < 0.97;

    // Trail: smaller spheres lagging behind
    trailRefs.current.forEach((tr, i) => {
      if (!tr) return;
      const lag = (i + 1) * 0.05;
      const rawL = Math.max(looped - offsetPhase - lag, 0);
      const tL = Math.min(rawL * 1.6, 1);
      tr.position.x = THREE.MathUtils.lerp(fromX, toX, tL);
      tr.position.y = Math.sin(tL * Math.PI) * (0.8 + offsetPhase * 1.8);
      const trailOpacity = (1 - (i + 1) / (TRAIL + 1)) * 0.5;
      tr.visible = tL > 0.02 && tL < 0.97;
      (tr.material as THREE.MeshStandardMaterial).opacity = trailOpacity;
    });
  });

  return (
    <>
      <mesh ref={ref} position={[fromX, 0, 0]} visible={false}>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={2.0} />
      </mesh>
      {Array.from({ length: TRAIL }).map((_, i) => (
        <mesh key={i} ref={(el) => { trailRefs.current[i] = el; }} visible={false}>
          <sphereGeometry args={[0.07 - i * 0.01, 6, 6]} />
          <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={1.5} transparent opacity={0} />
        </mesh>
      ))}
    </>
  );
}

// ─── COVALENT SCENE ───────────────────────────────────────────────────────────
function CovalentScene({ groupRef, progressRef, colorA, colorB, showDipole, analysis, level }: any) {
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const cloudGlowRef = useRef<THREE.Mesh>(null);
  const [inspected, setInspected] = useState<'a' | 'b' | null>(null);

  const shellsA = useMemo(() => getShellElectrons(analysis.a.Z), [analysis.a.Z]);
  const shellsB = useMemo(() => getShellElectrons(analysis.b.Z), [analysis.b.Z]);
  const valenceA = shellsA[shellsA.length - 1] ?? 1;
  const valenceB = shellsB[shellsB.length - 1] ?? 1;
  const sharedCount = Math.min(valenceA, valenceB, 4);

  const enA = analysis.a.en ?? 0;
  const enB = analysis.b.en ?? 0;
  const enDiff = Math.abs(enA - enB);

  useFrame(() => {
    const t = Math.min(progressRef.current, 1);
    // Atoms approach each other
    const dist = THREE.MathUtils.lerp(2.2, 1.12, t);
    if (leftRef.current) leftRef.current.position.x = -dist / 2;
    if (rightRef.current) rightRef.current.position.x = dist / 2;

    // Shared cloud grows and glows
    if (cloudRef.current) {
      const s = THREE.MathUtils.lerp(0, 1, Math.max(t * 2 - 0.55, 0));
      cloudRef.current.scale.setScalar(s);
      (cloudRef.current.material as THREE.MeshStandardMaterial).opacity = s * 0.22;
    }
    if (cloudGlowRef.current) {
      const s = THREE.MathUtils.lerp(0, 1.4, Math.max(t * 2 - 0.55, 0));
      cloudGlowRef.current.scale.setScalar(s);
      (cloudGlowRef.current.material as THREE.MeshStandardMaterial).opacity = THREE.MathUtils.lerp(0, 0.14, Math.max(t * 2 - 0.55, 0));
    }
  });

  const higherEN = enB >= enA;

  const t = Math.min(progressRef.current, 1);
  const phaseLabel = t < 0.18
    ? `Atoms approaching (ΔEN = ${enDiff.toFixed(1)})`
    : t < 0.55
    ? 'Valence electrons overlapping…'
    : t < 0.75
    ? 'Electron cloud forming…'
    : `Shared ${sharedCount > 1 ? sharedCount + '-electron' : 'electron'} bond ✓`;

  return (
    <group ref={groupRef}>
      {/* ── Atom A (left, starts at -1.1) ── */}
      <group ref={leftRef} position={[-1.1, 0, 0]}>
        {shellsA.map((_, si) => (
          <OrbitRing key={si} radius={0.55 + si * 0.22} color={colorA} opacity={0.16} />
        ))}
        <mesh onClick={(e) => { e.stopPropagation(); setInspected(inspected === 'a' ? null : 'a'); }}>
          <sphereGeometry args={[0.4, 24, 24]} />
          <meshStandardMaterial color={colorA} roughness={0.25} metalness={0.1} emissive={colorA} emissiveIntensity={0.3} />
        </mesh>
        <GlowSphere radius={0.65} color={colorA} opacity={0.1} />
        <Html center distanceFactor={6}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', gap: 1 }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>{analysis.a.sym}</span>
            {level !== 'beginner' && <span style={{ color: '#93c5fd', fontSize: 8 }}>EN {analysis.a.en?.toFixed(1) ?? '?'}</span>}
          </div>
        </Html>
        {shellsA.slice(0, -1).map((cnt, si) => (
          <ElectronRing key={si} count={Math.min(cnt, 4)} radius={0.55 + si * 0.22} color={colorA} speed={1.3 - si * 0.1} phase={si * 1.2} opacity={0.45} electronSize={0.065} />
        ))}
        <CovalentValenceRing count={valenceA} radius={0.55 + (shellsA.length - 1) * 0.22} color="#34d399" speed={1.8} progressRef={progressRef} side="left" sharedCount={sharedCount} />
      </group>

      {/* ── Atom B (right, starts at +1.1) ── */}
      <group ref={rightRef} position={[1.1, 0, 0]}>
        {shellsB.map((_, si) => (
          <OrbitRing key={si} radius={0.55 + si * 0.22} color={colorB} opacity={0.16} />
        ))}
        <mesh onClick={(e) => { e.stopPropagation(); setInspected(inspected === 'b' ? null : 'b'); }}>
          <sphereGeometry args={[0.4, 24, 24]} />
          <meshStandardMaterial color={colorB} roughness={0.25} metalness={0.1} emissive={colorB} emissiveIntensity={0.3} />
        </mesh>
        <GlowSphere radius={0.65} color={colorB} opacity={0.1} />
        <Html center distanceFactor={6}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', gap: 1 }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>{analysis.b.sym}</span>
            {level !== 'beginner' && <span style={{ color: '#fca5a5', fontSize: 8 }}>EN {analysis.b.en?.toFixed(1) ?? '?'}</span>}
          </div>
        </Html>
        {shellsB.slice(0, -1).map((cnt, si) => (
          <ElectronRing key={si} count={Math.min(cnt, 4)} radius={0.55 + si * 0.22} color={colorB} speed={1.3 - si * 0.1} phase={si * 1.5} opacity={0.45} electronSize={0.065} />
        ))}
        <CovalentValenceRing count={valenceB} radius={0.55 + (shellsB.length - 1) * 0.22} color="#fb923c" speed={1.8} progressRef={progressRef} side="right" sharedCount={sharedCount} />
      </group>

      {/* Shared electron cloud at midpoint */}
      <mesh ref={cloudRef} scale={0}>
        <sphereGeometry args={[0.55, 18, 18]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.8} transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Glow halo around shared cloud */}
      <mesh ref={cloudGlowRef} scale={0}>
        <sphereGeometry args={[0.75, 16, 16]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.5} transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Shared electrons orbiting bond midpoint */}
      <SharedBondElectrons progressRef={progressRef} sharedCount={sharedCount} />

      {/* Tooltips */}
      {inspected && (
        <Html center position={[inspected === 'a' ? -0.56 : 0.56, 1.3, 0]}>
          <div style={{ background: 'rgba(0,0,0,0.92)', color: '#e2e8f0', padding: '5px 10px', borderRadius: 7, fontSize: 9, whiteSpace: 'nowrap', pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.12)' }}>
            {inspected === 'a' ? analysis.a.name : analysis.b.name} · EN {inspected === 'a' ? analysis.a.en?.toFixed(1) : analysis.b.en?.toFixed(1)} · shares {inspected === 'a' ? valenceA : valenceB} valence e⁻
          </div>
        </Html>
      )}

      {/* Dipole arrow */}
      {showDipole && (
        <>
          <Html center position={[higherEN ? 0.35 : -0.35, 1.05, 0]}>
            <span style={{ color: '#fbbf24', fontSize: 18, pointerEvents: 'none', filter: 'drop-shadow(0 0 4px #fbbf24)' }}>→</span>
          </Html>
          {level !== 'beginner' && (
            <>
              <Html center position={[-0.4, -1.0, 0]}>
                <span style={{ color: '#93c5fd', fontSize: 10, fontWeight: 700, pointerEvents: 'none' }}>{higherEN ? 'δ+' : 'δ−'}</span>
              </Html>
              <Html center position={[0.4, -1.0, 0]}>
                <span style={{ color: '#fca5a5', fontSize: 10, fontWeight: 700, pointerEvents: 'none' }}>{higherEN ? 'δ−' : 'δ+'}</span>
              </Html>
            </>
          )}
        </>
      )}

      {/* Phase label */}
      <Html center position={[0, -2.0, 0]}>
        <div style={{
          color: t > 0.75 ? '#34d399' : '#94a3b8',
          fontSize: 10,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          fontWeight: t > 0.75 ? 700 : 400,
          textShadow: t > 0.75 ? '0 0 6px #34d399' : 'none',
        }}>
          {phaseLabel}
        </div>
      </Html>
    </group>
  );
}

// ─── Covalent valence ring: shared electrons drift inward ─────────────────────
function CovalentValenceRing({ count, radius, color, speed, progressRef, side, sharedCount }: {
  count: number; radius: number; color: string; speed: number;
  progressRef: React.MutableRefObject<number>;
  side: 'left' | 'right';
  sharedCount: number;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta * speed;
    const progress = Math.min(progressRef.current, 1);
    const threshold = 0.42;

    refs.current.forEach((m, i) => {
      if (!m) return;
      const isShared = i < sharedCount;
      const angle = t.current + (i / count) * Math.PI * 2;

      if (isShared && progress > threshold) {
        const pull = Math.min((progress - threshold) / 0.38, 1);
        const targetX = side === 'left' ? radius * 0.25 : -radius * 0.25;
        m.position.x = THREE.MathUtils.lerp(Math.cos(angle) * radius, targetX, pull);
        m.position.y = Math.sin(angle * 0.4) * 0.12;
        m.position.z = Math.sin(angle) * radius * (1 - pull * 0.6);
        (m.material as THREE.MeshStandardMaterial).opacity = THREE.MathUtils.lerp(1, 0.08, pull);
      } else {
        m.position.x = Math.cos(angle) * radius;
        m.position.y = Math.sin(angle * 0.4) * 0.14;
        m.position.z = Math.sin(angle) * radius;
        (m.material as THREE.MeshStandardMaterial).opacity = 1;
      }
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.3} transparent opacity={1} />
        </mesh>
      ))}
    </>
  );
}

// ─── Shared electrons at bond midpoint ────────────────────────────────────────
function SharedBondElectrons({ progressRef, sharedCount }: {
  progressRef: React.MutableRefObject<number>;
  sharedCount: number;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(0);
  const count = Math.max(sharedCount, 2);

  useFrame((_, delta) => {
    t.current += delta * 2.5;
    const progress = Math.min(progressRef.current, 1);
    const opacity = Math.min(Math.max((progress - 0.58) / 0.22, 0), 1);

    refs.current.forEach((m, i) => {
      if (!m) return;
      const angle = t.current + (i / count) * Math.PI;
      // Figure-eight-like orbit around bond axis
      m.position.x = Math.cos(angle) * 0.24;
      m.position.y = Math.sin(angle) * 0.38;
      m.position.z = Math.sin(angle * 1.5) * 0.18;
      m.visible = opacity > 0.01;
      (m.material as THREE.MeshStandardMaterial).opacity = opacity;
      (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.2 + Math.sin(t.current * 2 + i) * 0.5;
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} visible={false}>
          <sphereGeometry args={[0.095, 10, 10]} />
          <meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={1.2} transparent opacity={0} />
        </mesh>
      ))}
    </>
  );
}

// ─── METALLIC SCENE ───────────────────────────────────────────────────────────
function MetallicScene({ groupRef, colorA, colorB, analysis }: any) {
  const shellsA = useMemo(() => getShellElectrons(analysis.a.Z), [analysis.a.Z]);
  const shellsB = useMemo(() => getShellElectrons(analysis.b.Z), [analysis.b.Z]);

  return (
    <group ref={groupRef}>
      {/* Core lattice atoms with metallic sheen */}
      {[-0.85, 0.85].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.46, 24, 24]} />
            <meshStandardMaterial color={i === 0 ? colorA : colorB} metalness={0.92} roughness={0.08} emissive={i === 0 ? colorA : colorB} emissiveIntensity={0.25} />
          </mesh>
          {/* Metallic glow */}
          <mesh>
            <sphereGeometry args={[0.72, 16, 16]} />
            <meshStandardMaterial color={i === 0 ? colorA : colorB} emissive={i === 0 ? colorA : colorB} emissiveIntensity={0.4} transparent opacity={0.1} depthWrite={false} />
          </mesh>
          <Html center distanceFactor={6}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', gap: 1 }}>
              <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>{i === 0 ? analysis.a.sym : analysis.b.sym}</span>
            </div>
          </Html>
          {/* Core electron shells */}
          {(i === 0 ? shellsA : shellsB).slice(0, -1).map((cnt, si) => (
            <ElectronRing key={si} count={Math.min(cnt, 3)} radius={0.58 + si * 0.2} color={i === 0 ? colorA : colorB} speed={1.2 - si * 0.1} phase={si * 1.3 + i * 2} opacity={0.4} electronSize={0.06} />
          ))}
        </group>
      ))}

      {/* Delocalized electron sea */}
      <DelocalizedElectrons count={18} colorA={colorA} colorB={colorB} />

      {/* Sea glow — large, diffuse halo */}
      <mesh>
        <sphereGeometry args={[1.8, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} transparent opacity={0.05} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.2, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.02} depthWrite={false} />
      </mesh>

      <Html center position={[0, -2.1, 0]}>
        <div style={{ color: '#fbbf24', fontSize: 10, pointerEvents: 'none', whiteSpace: 'nowrap', fontWeight: 700, textShadow: '0 0 6px #fbbf24' }}>
          Delocalized electron sea — metallic bonding ✓
        </div>
      </Html>
    </group>
  );
}

// ─── Delocalized electrons (metallic sea) ─────────────────────────────────────
function DelocalizedElectrons({ count, colorA, colorB }: { count: number; colorA: string; colorB: string }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const seeds = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      ax: (Math.random() - 0.5) * 2.8,
      ay: (Math.random() - 0.5) * 1.6,
      az: (Math.random() - 0.5) * 2.8,
      bx: (Math.random() - 0.5) * 2.8,
      by: (Math.random() - 0.5) * 1.6,
      bz: (Math.random() - 0.5) * 2.8,
      speed: 0.4 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
    })), [count]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const s = seeds[i];
      const f = (Math.sin(t * s.speed + s.phase) + 1) / 2;
      m.position.x = THREE.MathUtils.lerp(s.ax, s.bx, f);
      m.position.y = THREE.MathUtils.lerp(s.ay, s.by, f);
      m.position.z = THREE.MathUtils.lerp(s.az, s.bz, f);
      // Pulse emissive
      (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8 + Math.sin(t * s.speed * 2 + s.phase) * 0.4;
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.075, 7, 7]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? colorA : colorB}
            emissive={i % 2 === 0 ? colorA : colorB}
            emissiveIntensity={0.9}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </>
  );
}

/* ── Electron accounting data for HTML panel ─── */
export function getBondAccountingData(analysis: PairAnalysis) {
  const isUncertain = analysis.bondConfidence === 'uncertain';
  const isTransitionOrSpecial = ['transition metal', 'metalloid', 'actinide'].includes(analysis.a.category) ||
    ['transition metal', 'metalloid', 'actinide'].includes(analysis.b.category);

  if (isUncertain || isTransitionOrSpecial) {
    return {
      showCounts: false,
      description: 'Electron accounting: variable (depends on conditions)',
      ionA: analysis.ionA,
      ionB: analysis.ionB,
    };
  }

  const bt = analysis.bondType;
  const isIonic = bt === 'Ionic';
  return {
    showCounts: true,
    description: isIonic ? 'Electron transfer' : 'Electron sharing',
    ionA: analysis.ionA,
    ionB: analysis.ionB,
  };
}
