import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { PairAnalysis } from '@/utils/interactionPredictor';
import type { Group } from 'three';
import * as THREE from 'three';

interface Props { analysis: PairAnalysis }

export function getBondCaption(a: PairAnalysis): string {
  if (a.bondConfidence === 'uncertain') {
    return `⚠ Caution: The interaction between ${a.a.sym} and ${a.b.sym} is uncertain (${a.enDeltaLabel}). Multiple outcomes are possible depending on conditions. ${a.uncertaintyFlags.join(' ')}`;
  }
  return `Bond formation between ${a.a.sym} and ${a.b.sym}: ${a.bondType} (${a.enDeltaLabel}). ${a.interactionType}.`;
}

export function BondFormationScene({ analysis }: Props) {
  const groupRef = useRef<Group>(null);
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    progressRef.current = Math.min(progressRef.current + delta * 0.4, 1);
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;
  });

  const isUncertain = analysis.bondConfidence === 'uncertain';
  const bt = analysis.bondType;

  // Determine which atom has lower EN (electron donor for ionic)
  const aEN = analysis.a.en ?? 0;
  const bEN = analysis.b.en ?? 0;
  const donorLeft = aEN <= bEN;

  const colorA = '#3b82f6';
  const colorB = '#ef4444';

  if (isUncertain) {
    return (
      <group ref={groupRef}>
        {/* Show both possibilities faded */}
        <group position={[-1.2, 0, 0]}>
          <mesh><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color={colorA} transparent opacity={0.35} /></mesh>
        </group>
        <group position={[1.2, 0, 0]}>
          <mesh><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color={colorB} transparent opacity={0.35} /></mesh>
        </group>
        <Html center>
          <span style={{ color: '#fbbf24', fontSize: 28, fontWeight: 900, pointerEvents: 'none' }}>?</span>
        </Html>
      </group>
    );
  }

  if (bt === 'Ionic') {
    return <IonicScene groupRef={groupRef} progressRef={progressRef} colorA={colorA} colorB={colorB} donorLeft={donorLeft} analysis={analysis} />;
  }

  if (bt.includes('covalent') || bt.includes('Covalent') || bt.includes('polar')) {
    return <CovalentScene groupRef={groupRef} progressRef={progressRef} colorA={colorA} colorB={colorB} />;
  }

  if (bt.includes('Metallic') || bt.includes('alloy')) {
    return <MetallicScene groupRef={groupRef} colorA={colorA} colorB={colorB} />;
  }

  // No typical bond
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

function IonicScene({ groupRef, progressRef, colorA, colorB, donorLeft, analysis }: any) {
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
      {/* Transferring electron */}
      <mesh ref={electronRef} position={[donorLeft ? -1.2 : 1.2, 0, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
      </mesh>
      <Html center position={[-1.2, -0.8, 0]}>
        <span style={{ color: '#e2e8f0', fontSize: 10, pointerEvents: 'none' }}>{analysis.a.sym}</span>
      </Html>
      <Html center position={[1.2, -0.8, 0]}>
        <span style={{ color: '#e2e8f0', fontSize: 10, pointerEvents: 'none' }}>{analysis.b.sym}</span>
      </Html>
    </group>
  );
}

function CovalentScene({ groupRef, progressRef, colorA, colorB }: any) {
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
      {/* Shared electron cloud */}
      <mesh ref={cloudRef} scale={0}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#10b981" transparent opacity={0} />
      </mesh>
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
      {/* Electron sea */}
      <mesh>
        <sphereGeometry args={[1.4, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}
