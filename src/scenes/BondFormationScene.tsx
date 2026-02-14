import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { PairAnalysis } from '@/utils/interactionPredictor';
import type { SceneControls } from '@/types/learningLayers';
import type { Group } from 'three';
import * as THREE from 'three';

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
    if (!controls.paused) {
      progressRef.current = Math.min(progressRef.current + delta * 0.4 * controls.speed, 1);
    }
    if (groupRef.current) groupRef.current.rotation.y += (controls.paused ? 0 : delta * 0.15 * controls.speed);
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
      <group ref={groupRef}>
        <group position={[-1.2, 0, 0]}>
          <mesh><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color={colorA} transparent opacity={0.35} /></mesh>
        </group>
        <group position={[1.2, 0, 0]}>
          <mesh><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color={colorB} transparent opacity={0.35} /></mesh>
        </group>
        <Html center>
          <span style={{ color: '#fbbf24', fontSize: 28, fontWeight: 900, pointerEvents: 'none' }}>?</span>
        </Html>
        <Html center position={[-1.2, -0.8, 0]}>
          <span style={{ color: '#e2e8f0', fontSize: 10, pointerEvents: 'none' }}>{analysis.a.sym}</span>
        </Html>
        <Html center position={[1.2, -0.8, 0]}>
          <span style={{ color: '#e2e8f0', fontSize: 10, pointerEvents: 'none' }}>{analysis.b.sym}</span>
        </Html>
      </group>
    );
  }

  if (bt === 'Ionic') {
    return <IonicScene groupRef={groupRef} progressRef={progressRef} colorA={colorA} colorB={colorB} donorLeft={donorLeft} analysis={analysis} showCharges={showCharges} level={level} />;
  }

  if (bt.includes('covalent') || bt.includes('Covalent') || bt.includes('polar')) {
    return <CovalentScene groupRef={groupRef} progressRef={progressRef} colorA={colorA} colorB={colorB} showDipole={showDipole} analysis={analysis} level={level} />;
  }

  if (bt.includes('Metallic') || bt.includes('alloy')) {
    return <MetallicScene groupRef={groupRef} colorA={colorA} colorB={colorB} />;
  }

  return (
    <group ref={groupRef}>
      <mesh position={[-1, 0, 0]}><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color={colorA} /></mesh>
      <mesh position={[1, 0, 0]}><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color={colorB} /></mesh>
      <Html center position={[0, 1, 0]}>
        <span style={{ color: '#94a3b8', fontSize: 11, pointerEvents: 'none' }}>No typical bond</span>
      </Html>
    </group>
  );
}

function IonicScene({ groupRef, progressRef, colorA, colorB, donorLeft, analysis, showCharges, level }: any) {
  const electronRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const t = progressRef.current;
    if (electronRef.current) {
      const startX = donorLeft ? -1.2 : 1.2;
      const endX = donorLeft ? 1.2 : -1.2;
      electronRef.current.position.x = THREE.MathUtils.lerp(startX, endX, t);
      electronRef.current.position.y = Math.sin(t * Math.PI) * 0.6;
    }
  });

  const t = progressRef.current;
  const donorSym = donorLeft ? analysis.a.sym : analysis.b.sym;
  const acceptorSym = donorLeft ? analysis.b.sym : analysis.a.sym;
  const donorIon = donorLeft ? analysis.ionA : analysis.ionB;
  const acceptorIon = donorLeft ? analysis.ionB : analysis.ionA;

  return (
    <group ref={groupRef}>
      <mesh position={[-1.2, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={colorA} />
      </mesh>
      <mesh position={[1.2, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={colorB} />
      </mesh>
      <mesh ref={electronRef} position={[donorLeft ? -1.2 : 1.2, 0, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
      </mesh>
      {/* Labels */}
      <Html center position={[-1.2, -0.8, 0]}>
        <span style={{ color: '#e2e8f0', fontSize: 10, pointerEvents: 'none' }}>{analysis.a.sym}</span>
      </Html>
      <Html center position={[1.2, -0.8, 0]}>
        <span style={{ color: '#e2e8f0', fontSize: 10, pointerEvents: 'none' }}>{analysis.b.sym}</span>
      </Html>
      {/* Charge labels after transfer */}
      {showCharges && t > 0.9 && (
        <>
          <Html center position={[-1.2, 0.8, 0]}>
            <span style={{ color: '#60a5fa', fontSize: 12, fontWeight: 700, pointerEvents: 'none' }}>
              {donorLeft ? (donorIon.typicalCharge ?? '+') : (acceptorIon.typicalCharge ?? '−')}
            </span>
          </Html>
          <Html center position={[1.2, 0.8, 0]}>
            <span style={{ color: '#f87171', fontSize: 12, fontWeight: 700, pointerEvents: 'none' }}>
              {donorLeft ? (acceptorIon.typicalCharge ?? '−') : (donorIon.typicalCharge ?? '+')}
            </span>
          </Html>
        </>
      )}
    </group>
  );
}

function CovalentScene({ groupRef, progressRef, colorA, colorB, showDipole, analysis, level }: any) {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const t = progressRef.current;
    const dist = THREE.MathUtils.lerp(1.8, 0.9, t);
    if (leftRef.current) leftRef.current.position.x = -dist / 2;
    if (rightRef.current) rightRef.current.position.x = dist / 2;
    if (cloudRef.current) {
      cloudRef.current.scale.setScalar(THREE.MathUtils.lerp(0, 1, t));
      (cloudRef.current.material as THREE.MeshStandardMaterial).opacity = t * 0.3;
    }
  });

  const higherEN = (analysis.b.en ?? 0) >= (analysis.a.en ?? 0);

  return (
    <group ref={groupRef}>
      <mesh ref={leftRef} position={[-0.9, 0, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color={colorA} />
      </mesh>
      <mesh ref={rightRef} position={[0.9, 0, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color={colorB} />
      </mesh>
      <mesh ref={cloudRef} scale={0}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#10b981" transparent opacity={0} />
      </mesh>
      {/* Dipole arrow */}
      {showDipole && (
        <>
          <Html center position={[higherEN ? 0.5 : -0.5, 0.9, 0]}>
            <span style={{ color: '#fbbf24', fontSize: 16, pointerEvents: 'none' }}>→</span>
          </Html>
          {level !== 'beginner' && (
            <>
              <Html center position={[-0.45, -0.8, 0]}>
                <span style={{ color: '#93c5fd', fontSize: 9, pointerEvents: 'none' }}>{higherEN ? 'δ+' : 'δ−'}</span>
              </Html>
              <Html center position={[0.45, -0.8, 0]}>
                <span style={{ color: '#fca5a5', fontSize: 9, pointerEvents: 'none' }}>{higherEN ? 'δ−' : 'δ+'}</span>
              </Html>
            </>
          )}
        </>
      )}
    </group>
  );
}

function MetallicScene({ groupRef, colorA, colorB }: any) {
  return (
    <group ref={groupRef}>
      <mesh position={[-0.7, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={colorA} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.7, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={colorB} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.4, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.12} />
      </mesh>
    </group>
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
