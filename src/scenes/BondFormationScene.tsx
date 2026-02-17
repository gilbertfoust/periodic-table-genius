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

export function BondFormationScene({ analysis, controls }: Props) {
  const groupRef = useRef<Group>(null);
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    if (controls.scrubPhase !== null) {
      progressRef.current = controls.scrubPhase;
    } else if (!controls.paused) {
      progressRef.current += delta * 0.35 * controls.speed;
      // Hold briefly at the bonded state (progress 1.0–1.6), then loop
      if (progressRef.current > 1.6) {
        progressRef.current = 0;
      }
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += (controls.paused && controls.scrubPhase === null ? 0 : delta * 0.12 * controls.speed);
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

  const colorA = '#3b82f6';
  const colorB = '#ef4444';

  if (isUncertain) {
    return (
      <>
        <OrbitControls enableDamping dampingFactor={0.1} enableZoom enablePan={false} />
        <group ref={groupRef}>
          <group position={[-1.4, 0, 0]}>
            <mesh><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color={colorA} transparent opacity={0.35} /></mesh>
          </group>
          <group position={[1.4, 0, 0]}>
            <mesh><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color={colorB} transparent opacity={0.35} /></mesh>
          </group>
          <Html center>
            <span style={{ color: '#fbbf24', fontSize: 28, fontWeight: 900, pointerEvents: 'none' }}>?</span>
          </Html>
          <Html center position={[-1.4, -0.85, 0]}>
            <span style={{ color: '#e2e8f0', fontSize: 10, pointerEvents: 'none' }}>{analysis.a.sym}</span>
          </Html>
          <Html center position={[1.4, -0.85, 0]}>
            <span style={{ color: '#e2e8f0', fontSize: 10, pointerEvents: 'none' }}>{analysis.b.sym}</span>
          </Html>
        </group>
      </>
    );
  }

  if (bt === 'Ionic') {
    return (
      <>
        <OrbitControls enableDamping dampingFactor={0.1} enableZoom enablePan={false} />
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
        <MetallicScene groupRef={groupRef} colorA={colorA} colorB={colorB} analysis={analysis} />
      </>
    );
  }

  return (
    <>
      <OrbitControls enableDamping dampingFactor={0.1} enableZoom enablePan={false} />
      <group ref={groupRef}>
        <mesh position={[-1, 0, 0]}><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color={colorA} /></mesh>
        <mesh position={[1, 0, 0]}><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color={colorB} /></mesh>
        <Html center position={[0, 1, 0]}>
          <span style={{ color: '#94a3b8', fontSize: 11, pointerEvents: 'none' }}>No typical bond</span>
        </Html>
      </group>
    </>
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
}: {
  count: number;
  radius: number;
  color: string;
  speed: number;
  phase?: number;
  tilt?: number;
  scale?: number;
  opacity?: number;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta * speed;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const angle = t.current + phase + (i / count) * Math.PI * 2;
      m.position.x = Math.cos(angle) * radius * scale;
      m.position.y = Math.sin(angle * 0.4 + tilt) * 0.15 * scale;
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
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── Transferring electron arc ────────────────────────────────────────────────
function TransferElectron({
  progress,
  fromX,
  toX,
}: {
  progress: React.MutableRefObject<number>;
  fromX: number;
  toX: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    const t = Math.min(progress.current * 1.4, 1); // arrives before phase ends
    const t2 = Math.max(t - 0.05, 0) / 0.95;
    ref.current.position.x = THREE.MathUtils.lerp(fromX, toX, t2);
    ref.current.position.y = Math.sin(t2 * Math.PI) * 0.9;
    ref.current.visible = t2 < 0.98 && t2 > 0.02;
    const scl = 1 - Math.abs(t2 - 0.5) * 0.5;
    ref.current.scale.setScalar(scl);
  });

  return (
    <mesh ref={ref} position={[fromX, 0, 0]}>
      <sphereGeometry args={[0.1, 10, 10]} />
      <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1} />
    </mesh>
  );
}

// ─── IONIC SCENE ─────────────────────────────────────────────────────────────
function IonicScene({ groupRef, progressRef, colorA, colorB, donorLeft, analysis, showCharges, level }: any) {
  const [inspected, setInspected] = useState<'a' | 'b' | null>(null);
  const leftNucRef = useRef<THREE.Mesh>(null);
  const rightNucRef = useRef<THREE.Mesh>(null);

  const shellsA = useMemo(() => getShellElectrons(analysis.a.Z), [analysis.a.Z]);
  const shellsB = useMemo(() => getShellElectrons(analysis.b.Z), [analysis.b.Z]);
  const valenceCountA = shellsA[shellsA.length - 1] ?? 1;
  const valenceCountB = shellsB[shellsB.length - 1] ?? 1;

  // How many electrons transfer — typically the donor's valence count (capped at 3 for visuals)
  const transferCount = Math.min(donorLeft ? valenceCountA : valenceCountB, 3);

  // After transfer: donor loses valence shell, acceptor gains it
  useFrame(() => {
    const t = Math.min(progressRef.current, 1);
    if (leftNucRef.current) {
      const isLeft = donorLeft;
      const scale = isLeft
        ? THREE.MathUtils.lerp(1, 0.82, Math.min(t * 2, 1))
        : THREE.MathUtils.lerp(1, 1.15, Math.min(t * 2, 1));
      leftNucRef.current.scale.setScalar(scale);
    }
    if (rightNucRef.current) {
      const isRight = !donorLeft;
      const scale = isRight
        ? THREE.MathUtils.lerp(1, 0.82, Math.min(t * 2, 1))
        : THREE.MathUtils.lerp(1, 1.15, Math.min(t * 2, 1));
      rightNucRef.current.scale.setScalar(scale);
    }
  });

  const donorIon = donorLeft ? analysis.ionA : analysis.ionB;
  const acceptorIon = donorLeft ? analysis.ionB : analysis.ionA;
  // Clamp to 1 so hold phase (1.0–1.6) still shows completed bond state
  const t = Math.min(progressRef.current, 1);

  const tooltipForAtom = (which: 'a' | 'b') => {
    const el = which === 'a' ? analysis.a : analysis.b;
    const role = donorLeft ? (which === 'a' ? 'Electron donor → becomes cation' : 'Electron acceptor → becomes anion') : (which === 'a' ? 'Electron acceptor → becomes anion' : 'Electron donor → becomes cation');
    return `${el.name}  EN = ${el.en ?? 'N/A'}  ${role}`;
  };

  // Valence ring radii — outer shell of each atom
  const valenceRadiusA = 0.55 + (shellsA.length - 1) * 0.22;
  const valenceRadiusB = 0.55 + (shellsB.length - 1) * 0.22;

  return (
    <group ref={groupRef}>
      {/* ── Atom A (left) ── */}
      <group position={[-1.6, 0, 0]}>
        <mesh
          ref={leftNucRef}
          onClick={(e) => { e.stopPropagation(); setInspected(inspected === 'a' ? null : 'a'); }}
        >
          <sphereGeometry args={[0.38, 16, 16]} />
          <meshStandardMaterial color={colorA} />
        </mesh>
        <Html center distanceFactor={6}>
          <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, pointerEvents: 'none' }}>{analysis.a.sym}</span>
        </Html>

        {/* Inner shells of A (non-valence) */}
        {shellsA.slice(0, -1).map((cnt, si) => (
          <ElectronRing
            key={si}
            count={Math.min(cnt, 4)}
            radius={0.55 + si * 0.22}
            color={colorA}
            speed={1.2 - si * 0.15}
            phase={si * 1.1}
            tilt={si * 0.3}
            opacity={0.45}
          />
        ))}

        {/* Valence shell of A — fades out when electron leaves */}
        <ValenceRingWithFade
          count={valenceCountA}
          radius={valenceRadiusA}
          color="#10b981"
          speed={1.8}
          progress={progressRef}
          fade={donorLeft}
        />
      </group>

      {/* ── Atom B (right) ── */}
      <group position={[1.6, 0, 0]}>
        <mesh
          ref={rightNucRef}
          onClick={(e) => { e.stopPropagation(); setInspected(inspected === 'b' ? null : 'b'); }}
        >
          <sphereGeometry args={[0.38, 16, 16]} />
          <meshStandardMaterial color={colorB} />
        </mesh>
        <Html center distanceFactor={6}>
          <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, pointerEvents: 'none' }}>{analysis.b.sym}</span>
        </Html>

        {/* Inner shells of B */}
        {shellsB.slice(0, -1).map((cnt, si) => (
          <ElectronRing
            key={si}
            count={Math.min(cnt, 4)}
            radius={0.55 + si * 0.22}
            color={colorB}
            speed={1.2 - si * 0.15}
            phase={si * 1.4}
            tilt={-si * 0.3}
            opacity={0.45}
          />
        ))}

        {/* Valence shell of B — fades out when electron leaves */}
        <ValenceRingWithFade
          count={valenceCountB}
          radius={valenceRadiusB}
          color="#10b981"
          speed={1.8}
          progress={progressRef}
          fade={!donorLeft}
        />

        {/* Extra ring appearing on acceptor after transfer */}
        <AcceptorGainRing
          count={transferCount}
          radius={valenceRadiusB + 0.25}
          color="#10b981"
          progress={progressRef}
          show={donorLeft ? true : false}
        />
      </group>

      {/* Acceptor gain ring on left if B is donor */}
      {!donorLeft && (
        <group position={[-1.6, 0, 0]}>
          <AcceptorGainRing
            count={transferCount}
            radius={valenceRadiusA + 0.25}
            color="#10b981"
            progress={progressRef}
            show={true}
          />
        </group>
      )}

      {/* Flying transfer electrons */}
      {Array.from({ length: transferCount }).map((_, i) => (
        <TransferElectronOffset
          key={i}
          progressRef={progressRef}
          fromX={donorLeft ? -1.6 : 1.6}
          toX={donorLeft ? 1.6 : -1.6}
          offsetPhase={i * 0.18}
        />
      ))}

      {/* Tooltips */}
      {inspected && (
        <Html center position={[inspected === 'a' ? -1.6 : 1.6, 1.4, 0]}>
          <div style={{ background: 'rgba(0,0,0,0.9)', color: '#e2e8f0', padding: '4px 10px', borderRadius: 6, fontSize: 9, whiteSpace: 'nowrap', pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
            {tooltipForAtom(inspected)}
          </div>
        </Html>
      )}

      {/* Charge labels */}
      {showCharges && t > 0.85 && (
        <>
          <Html center position={[-1.6, 1.0, 0]}>
            <span style={{ color: '#60a5fa', fontSize: 13, fontWeight: 700, pointerEvents: 'none' }}>
              {donorLeft ? (donorIon.typicalCharge ?? '+') : (acceptorIon.typicalCharge ?? '−')}
            </span>
          </Html>
          <Html center position={[1.6, 1.0, 0]}>
            <span style={{ color: '#f87171', fontSize: 13, fontWeight: 700, pointerEvents: 'none' }}>
              {donorLeft ? (acceptorIon.typicalCharge ?? '−') : (donorIon.typicalCharge ?? '+')}
            </span>
          </Html>
        </>
      )}

      {/* Phase label */}
      <Html center position={[0, -1.9, 0]}>
        <span style={{ color: '#94a3b8', fontSize: 10, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {t < 0.15 ? 'Atoms approaching…' : t < 0.6 ? 'Valence electron transferring…' : t < 0.88 ? 'Transfer complete' : 'Ions formed ✓'}
        </span>
      </Html>
    </group>
  );
}

/** Valence ring that fades out when it's the donor */
function ValenceRingWithFade({ count, radius, color, speed, progress, fade }: {
  count: number; radius: number; color: string; speed: number;
  progress: React.MutableRefObject<number>; fade: boolean;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta * speed;
    const p = Math.min(progress.current, 1);
    const opacity = fade
      ? Math.max(0, 1 - p * 2.5)
      : 1;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const angle = t.current + (i / count) * Math.PI * 2;
      m.position.x = Math.cos(angle) * radius;
      m.position.y = Math.sin(angle * 0.5) * 0.12;
      m.position.z = Math.sin(angle) * radius;
      (m.material as THREE.MeshStandardMaterial).opacity = opacity;
      m.visible = opacity > 0.02;
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={1} />
        </mesh>
      ))}
    </>
  );
}

/** New electron shell appearing on the acceptor after transfer */
function AcceptorGainRing({ count, radius, color, progress, show }: {
  count: number; radius: number; color: string;
  progress: React.MutableRefObject<number>; show: boolean;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(0);

  useFrame((_, delta) => {
    if (!show) return;
    t.current += delta * 1.4;
    const opacity = Math.min(Math.max(Math.min(progress.current, 1) * 2.5 - 1.2, 0), 1);
    refs.current.forEach((m, i) => {
      if (!m) return;
      const angle = t.current + (i / count) * Math.PI * 2;
      m.position.x = Math.cos(angle) * radius;
      m.position.y = Math.sin(angle * 0.5) * 0.1;
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
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0} />
        </mesh>
      ))}
    </>
  );
}

/** Each transfer electron starts at slightly different time */
function TransferElectronOffset({ progressRef, fromX, toX, offsetPhase }: {
  progressRef: React.MutableRefObject<number>;
  fromX: number; toX: number; offsetPhase: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    // Use modulo to loop: raw progress loops 0→1.6, we use only 0→1 portion
    const looped = progressRef.current % 1.6;
    const raw = Math.max(looped - offsetPhase, 0);
    const t = Math.min(raw * 1.6, 1);
    ref.current.position.x = THREE.MathUtils.lerp(fromX, toX, t);
    ref.current.position.y = Math.sin(t * Math.PI) * (0.7 + offsetPhase * 1.5);
    ref.current.visible = t > 0.02 && t < 0.97;
  });

  return (
    <mesh ref={ref} position={[fromX, 0, 0]} visible={false}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.2} />
    </mesh>
  );
}

// ─── COVALENT SCENE ───────────────────────────────────────────────────────────
function CovalentScene({ groupRef, progressRef, colorA, colorB, showDipole, analysis, level }: any) {
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const [inspected, setInspected] = useState<'a' | 'b' | null>(null);

  const shellsA = useMemo(() => getShellElectrons(analysis.a.Z), [analysis.a.Z]);
  const shellsB = useMemo(() => getShellElectrons(analysis.b.Z), [analysis.b.Z]);
  const valenceA = shellsA[shellsA.length - 1] ?? 1;
  const valenceB = shellsB[shellsB.length - 1] ?? 1;
  // Shared electrons = typically the unpaired ones (simplified: min of valence, cap at 4)
  const sharedCount = Math.min(valenceA, valenceB, 4);

  useFrame(() => {
    const t = Math.min(progressRef.current, 1);
    const dist = THREE.MathUtils.lerp(2.0, 1.05, t);
    if (leftRef.current) leftRef.current.position.x = -dist / 2;
    if (rightRef.current) rightRef.current.position.x = dist / 2;
    if (cloudRef.current) {
      const s = THREE.MathUtils.lerp(0, 1, Math.max(t * 2 - 0.6, 0));
      cloudRef.current.scale.setScalar(s);
      (cloudRef.current.material as THREE.MeshStandardMaterial).opacity = s * 0.28;
    }
  });

  const higherEN = (analysis.b.en ?? 0) >= (analysis.a.en ?? 0);

  const tooltipForAtom = (which: 'a' | 'b') => {
    const el = which === 'a' ? analysis.a : analysis.b;
    return `${el.name}  EN = ${el.en ?? 'N/A'}  shares ${which === 'a' ? valenceA : valenceB} valence e⁻`;
  };

  return (
    <group ref={groupRef}>
      {/* ── Atom A (left) ── */}
      <group ref={leftRef} position={[-1.0, 0, 0]}>
        <mesh onClick={(e) => { e.stopPropagation(); setInspected(inspected === 'a' ? null : 'a'); }}>
          <sphereGeometry args={[0.36, 16, 16]} />
          <meshStandardMaterial color={colorA} />
        </mesh>
        <Html center distanceFactor={6}>
          <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, pointerEvents: 'none' }}>{analysis.a.sym}</span>
        </Html>

        {/* Inner shells */}
        {shellsA.slice(0, -1).map((cnt, si) => (
          <ElectronRing
            key={si}
            count={Math.min(cnt, 4)}
            radius={0.5 + si * 0.2}
            color={colorA}
            speed={1.3 - si * 0.1}
            phase={si * 1.2}
            opacity={0.4}
          />
        ))}

        {/* Valence electrons of A */}
        <CovalentValenceRing
          count={valenceA}
          radius={0.5 + (shellsA.length - 1) * 0.2}
          color="#10b981"
          speed={1.7}
          progressRef={progressRef}
          side="left"
          sharedCount={sharedCount}
        />
      </group>

      {/* ── Atom B (right) ── */}
      <group ref={rightRef} position={[1.0, 0, 0]}>
        <mesh onClick={(e) => { e.stopPropagation(); setInspected(inspected === 'b' ? null : 'b'); }}>
          <sphereGeometry args={[0.36, 16, 16]} />
          <meshStandardMaterial color={colorB} />
        </mesh>
        <Html center distanceFactor={6}>
          <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, pointerEvents: 'none' }}>{analysis.b.sym}</span>
        </Html>

        {/* Inner shells */}
        {shellsB.slice(0, -1).map((cnt, si) => (
          <ElectronRing
            key={si}
            count={Math.min(cnt, 4)}
            radius={0.5 + si * 0.2}
            color={colorB}
            speed={1.3 - si * 0.1}
            phase={si * 1.5}
            opacity={0.4}
          />
        ))}

        {/* Valence electrons of B */}
        <CovalentValenceRing
          count={valenceB}
          radius={0.5 + (shellsB.length - 1) * 0.2}
          color="#ef4444"
          speed={1.7}
          progressRef={progressRef}
          side="right"
          sharedCount={sharedCount}
        />
      </group>

      {/* Shared electron cloud between atoms */}
      <mesh ref={cloudRef} scale={0}>
        <sphereGeometry args={[0.52, 16, 16]} />
        <meshStandardMaterial color="#10b981" transparent opacity={0} />
      </mesh>

      {/* Shared electron pair orbiting the bond midpoint */}
      <SharedBondElectrons
        progressRef={progressRef}
        sharedCount={sharedCount}
      />

      {/* Tooltips */}
      {inspected && (
        <Html center position={[inspected === 'a' ? -0.5 : 0.5, 1.2, 0]}>
          <div style={{ background: 'rgba(0,0,0,0.9)', color: '#e2e8f0', padding: '4px 10px', borderRadius: 6, fontSize: 9, whiteSpace: 'nowrap', pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
            {tooltipForAtom(inspected)}
          </div>
        </Html>
      )}

      {/* Dipole */}
      {showDipole && (
        <>
          <Html center position={[higherEN ? 0.4 : -0.4, 1.0, 0]}>
            <span style={{ color: '#fbbf24', fontSize: 16, pointerEvents: 'none' }}>→</span>
          </Html>
          {level !== 'beginner' && (
            <>
              <Html center position={[-0.4, -0.9, 0]}>
                <span style={{ color: '#93c5fd', fontSize: 9, pointerEvents: 'none' }}>{higherEN ? 'δ+' : 'δ−'}</span>
              </Html>
              <Html center position={[0.4, -0.9, 0]}>
                <span style={{ color: '#fca5a5', fontSize: 9, pointerEvents: 'none' }}>{higherEN ? 'δ−' : 'δ+'}</span>
              </Html>
            </>
          )}
        </>
      )}

      {/* Phase label */}
      <Html center position={[0, -1.8, 0]}>
        <span style={{ color: '#94a3b8', fontSize: 10, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {(() => { const p = Math.min(progressRef.current, 1); return p < 0.2 ? 'Atoms approaching…' : p < 0.6 ? 'Valence electrons overlapping…' : 'Shared electron cloud formed ✓'; })()}
        </span>
      </Html>
    </group>
  );
}

/** Valence ring whose shared electrons drift inward toward the bond midpoint */
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
    const bondingThreshold = 0.4;

    refs.current.forEach((m, i) => {
      if (!m) return;
      const isShared = i < sharedCount;
      const angle = t.current + (i / count) * Math.PI * 2;

      if (isShared && progress > bondingThreshold) {
        // Shared electrons drift toward the midpoint (x = 0 in parent space)
        const pull = Math.min((progress - bondingThreshold) / 0.4, 1);
        const targetX = side === 'left' ? radius * 0.3 : -radius * 0.3;
        m.position.x = THREE.MathUtils.lerp(Math.cos(angle) * radius, targetX, pull);
        m.position.y = Math.sin(angle * 0.4) * 0.1;
        m.position.z = Math.sin(angle) * radius * (1 - pull * 0.5);
        const mat = m.material as THREE.MeshStandardMaterial;
        // fade out slightly — shared electrons move to SharedBondElectrons
        mat.opacity = THREE.MathUtils.lerp(1, 0.15, pull);
      } else {
        m.position.x = Math.cos(angle) * radius;
        m.position.y = Math.sin(angle * 0.4) * 0.12;
        m.position.z = Math.sin(angle) * radius;
        (m.material as THREE.MeshStandardMaterial).opacity = 1;
      }
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.075, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </>
  );
}

/** Shared electrons orbiting the bond midpoint, appearing after bonding starts */
function SharedBondElectrons({ progressRef, sharedCount }: {
  progressRef: React.MutableRefObject<number>;
  sharedCount: number;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta * 2.2;
    const progress = Math.min(progressRef.current, 1);
    const opacity = Math.min(Math.max((progress - 0.6) / 0.25, 0), 1);

    refs.current.forEach((m, i) => {
      if (!m) return;
      const angle = t.current + (i / sharedCount) * Math.PI;
      // Orbit in a tight ellipse around the bond axis
      m.position.x = Math.cos(angle) * 0.22;
      m.position.y = Math.sin(angle) * 0.35;
      m.position.z = Math.sin(angle * 1.4) * 0.15;
      m.visible = opacity > 0.01;
      (m.material as THREE.MeshStandardMaterial).opacity = opacity;
    });
  });

  return (
    <>
      {Array.from({ length: Math.max(sharedCount, 2) }).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} visible={false}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={1.0} transparent opacity={0} />
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
      {/* Core lattice atoms */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshStandardMaterial color={i === 0 ? colorA : colorB} metalness={0.85} roughness={0.15} />
        </mesh>
      ))}

      {/* Delocalized electron sea — many electrons drifting freely */}
      <DelocalizedElectrons count={14} colorA={colorA} colorB={colorB} />

      {/* Electron sea glow */}
      <mesh>
        <sphereGeometry args={[1.6, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.06} />
      </mesh>

      <Html center position={[0, -1.8, 0]}>
        <span style={{ color: '#94a3b8', fontSize: 10, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          Delocalized electron sea — metallic bonding
        </span>
      </Html>
    </group>
  );
}

function DelocalizedElectrons({ count, colorA, colorB }: { count: number; colorA: string; colorB: string }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const seeds = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      ax: Math.random() * 2.4 - 1.2,
      ay: Math.random() * 1.4 - 0.7,
      az: Math.random() * 2.4 - 1.2,
      bx: Math.random() * 2.4 - 1.2,
      by: Math.random() * 1.4 - 0.7,
      bz: Math.random() * 2.4 - 1.2,
      speed: 0.5 + Math.random() * 0.8,
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
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? colorA : colorB}
            emissive={i % 2 === 0 ? colorA : colorB}
            emissiveIntensity={0.8}
            transparent
            opacity={0.75}
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
