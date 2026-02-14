import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Element } from '@/data/elements';
import type { Group } from 'three';

interface Props { element: Element }

/** Simplified 2-8-8-18… shell filling */
function getShellElectrons(Z: number): number[] {
  const maxPerShell = [2, 8, 8, 18, 18, 32, 32];
  const shells: number[] = [];
  let remaining = Z;
  for (const max of maxPerShell) {
    if (remaining <= 0) break;
    const n = Math.min(remaining, max);
    shells.push(n);
    remaining -= n;
  }
  return shells;
}

export function getAtomCaption(el: Element): string {
  const shells = getShellElectrons(el.Z);
  const valence = shells[shells.length - 1] ?? 0;
  return `Atom model of ${el.name} (Z=${el.Z}) showing ${shells.length} electron shell${shells.length > 1 ? 's' : ''}. The ${valence} valence electron${valence !== 1 ? 's' : ''} (green) determine bonding behavior.`;
}

export function AtomStructureScene({ element }: Props) {
  const groupRef = useRef<Group>(null);
  const shells = useMemo(() => getShellElectrons(element.Z), [element.Z]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3;
  });

  return (
    <group ref={groupRef}>
      {/* Nucleus */}
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      <Html center distanceFactor={6}>
        <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, pointerEvents: 'none' }}>
          {element.Z}
        </span>
      </Html>

      {/* Electron shells */}
      {shells.map((count, shellIdx) => {
        const radius = 0.9 + shellIdx * 0.7;
        const isValence = shellIdx === shells.length - 1;
        return (
          <group key={shellIdx}>
            {/* Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[radius, 0.015, 8, 48]} />
              <meshStandardMaterial color="#475569" transparent opacity={0.3} />
            </mesh>
            {/* Electrons */}
            {Array.from({ length: count }).map((_, eIdx) => {
              const angle = (eIdx / count) * Math.PI * 2;
              return (
                <mesh key={eIdx} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
                  <sphereGeometry args={[0.08, 8, 8]} />
                  <meshStandardMaterial color={isValence ? '#10b981' : '#3b82f6'} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}
