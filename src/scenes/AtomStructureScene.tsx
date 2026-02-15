import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import type { Element } from '@/data/elements';
import type { Group } from 'three';
import type { SceneControls } from '@/types/learningLayers';

interface Props {
  element: Element;
  controls: SceneControls;
}

/** Simplified 2-8-8-18… shell filling */
export function getShellElectrons(Z: number): number[] {
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

export function AtomStructureScene({ element, controls }: Props) {
  const groupRef = useRef<Group>(null);
  const shells = useMemo(() => getShellElectrons(element.Z), [element.Z]);
  const showValenceHighlight = controls.overlays['valenceHighlight'] !== false;
  const showOctetRing = !!controls.overlays['octetRing'];
  const isMainGroup = element.group !== null && [1,2,13,14,15,16,17,18].includes(element.group);
  const [tooltip, setTooltip] = useState<string | null>(null);

  useFrame((_, delta) => {
    if (controls.paused) return;
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3 * controls.speed;
  });

  return (
    <>
      <OrbitControls enableDamping dampingFactor={0.1} enableZoom enablePan={false} />
      <group ref={groupRef}>
        {/* Nucleus - click to inspect */}
        <mesh onClick={(e) => { e.stopPropagation(); setTooltip(tooltip === 'nucleus' ? null : 'nucleus'); }}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
        <Html center distanceFactor={6}>
          <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, pointerEvents: 'none' }}>
            {element.Z}
          </span>
        </Html>

        {/* Nucleus tooltip */}
        {tooltip === 'nucleus' && (
          <Html center position={[0, 0.7, 0]} distanceFactor={6}>
            <div style={{ background: 'rgba(0,0,0,0.85)', color: '#e2e8f0', padding: '4px 8px', borderRadius: 6, fontSize: 10, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
              Atomic number Z={element.Z}. Protons ≈ Z (simplified model).
            </div>
          </Html>
        )}

        {/* Electron shells */}
        {shells.map((count, shellIdx) => {
          const radius = 0.9 + shellIdx * 0.7;
          const isValence = shellIdx === shells.length - 1;
          return (
            <group key={shellIdx}>
              {/* Ring - click valence to inspect */}
              <mesh
                rotation={[Math.PI / 2, 0, 0]}
                onClick={isValence ? (e) => { e.stopPropagation(); setTooltip(tooltip === 'valence' ? null : 'valence'); } : undefined}
              >
                <torusGeometry args={[radius, 0.015, 8, 48]} />
                <meshStandardMaterial color="#475569" transparent opacity={0.3} />
              </mesh>
              {/* Electrons */}
              {Array.from({ length: count }).map((_, eIdx) => {
                const angle = (eIdx / count) * Math.PI * 2;
                const color = isValence && showValenceHighlight ? '#10b981' : '#3b82f6';
                return (
                  <mesh key={eIdx} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshStandardMaterial color={color} />
                  </mesh>
                );
              })}
              {/* Valence tooltip */}
              {isValence && tooltip === 'valence' && (
                <Html center position={[0, -0.4, 0]} distanceFactor={6}>
                  <div style={{ background: 'rgba(0,0,0,0.85)', color: '#e2e8f0', padding: '4px 8px', borderRadius: 6, fontSize: 10, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                    Valence electrons are commonly involved in bonding.
                  </div>
                </Html>
              )}
            </group>
          );
        })}

        {/* Octet target ring overlay */}
        {showOctetRing && (
          <group>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.9 + (shells.length - 1) * 0.7 + 0.15, 0.008, 8, 48]} />
              <meshStandardMaterial color={isMainGroup ? '#fbbf24' : '#ef4444'} transparent opacity={0.5} />
            </mesh>
            {!isMainGroup && (
              <Html center position={[0, -1.8, 0]} distanceFactor={8}>
                <span style={{ color: '#fbbf24', fontSize: 9, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                  Octet rule has exceptions
                </span>
              </Html>
            )}
          </group>
        )}
      </group>
    </>
  );
}

/** Extra data for the HTML panel */
export function getAtomAccountingData(el: Element) {
  const shells = getShellElectrons(el.Z);
  const valence = shells[shells.length - 1] ?? 0;
  return { shells, valence, shellLabel: shells.join(' | ') };
}
