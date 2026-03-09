/**
 * CenterStageVisualization — renders atom/bond/lattice visualizations
 * directly inside the U-shaped gap of the 3D periodic table.
 * 
 * No OrbitControls here — the parent Canvas already has them.
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSelection } from '@/state/selectionStore';
import { byZ, type Element } from '@/data/elements';
import { CATEGORY_COLORS } from '@/data/categoryColors';
import { analyzePair, type PairAnalysis } from '@/utils/interactionPredictor';
import { getShellElectrons } from '@/scenes/AtomStructureScene';

// ─── Position: center of the U-gap (groups 3-12, periods 1-3) ──────────────
// col ~7 → x = (7-8.5)*1.3 ≈ -1.95,  row ~1 → y = -(1-4.5)*1.3 ≈ 4.55
const GAP_CENTER: [number, number, number] = [0, 3.5, 0.5];
const STAGE_SCALE = 1.8;

// ─── Single atom visualization ──────────────────────────────────────────────
function AtomViz({ element }: { element: Element }) {
  const groupRef = useRef<THREE.Group>(null);
  const shells = useMemo(() => getShellElectrons(element.Z), [element.Z]);
  const catColor = CATEGORY_COLORS[element.category] ?? '#3b82f6';

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.4;
  });

  return (
    <group ref={groupRef}>
      {/* Nucleus */}
      <mesh>
        <sphereGeometry args={[0.25, 14, 14]} />
        <meshStandardMaterial color={catColor} emissive={catColor} emissiveIntensity={0.3} />
      </mesh>

      {/* Electron shells */}
      {shells.map((count, si) => {
        const r = 0.5 + si * 0.4;
        const isValence = si === shells.length - 1;
        return (
          <group key={si}>
            {/* Shell ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[r, 0.008, 6, 32]} />
              <meshStandardMaterial color="#475569" transparent opacity={0.25} />
            </mesh>
            {/* Electrons */}
            {Array.from({ length: count }).map((_, ei) => {
              const angle = (ei / count) * Math.PI * 2;
              return (
                <mesh key={ei} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}>
                  <sphereGeometry args={[0.05, 6, 6]} />
                  <meshStandardMaterial color={isValence ? '#10b981' : '#3b82f6'} />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* Label */}
      <Html center position={[0, -0.3, 0]} distanceFactor={12}>
        <span style={{ color: '#e2e8f0', fontSize: 9, fontWeight: 700, pointerEvents: 'none', whiteSpace: 'nowrap', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
          {element.sym}
        </span>
      </Html>
    </group>
  );
}

// ─── Bond pair visualization ────────────────────────────────────────────────
function BondViz({ a, b, pair }: { a: Element; b: Element; pair: PairAnalysis }) {
  const groupRef = useRef<THREE.Group>(null);
  const phaseRef = useRef(0);
  const colorA = CATEGORY_COLORS[a.category] ?? '#3b82f6';
  const colorB = CATEGORY_COLORS[b.category] ?? '#ef4444';

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.2;
    phaseRef.current = (phaseRef.current + dt * 0.5) % 2;
  });

  // Animate atoms approaching
  const sep = 1.2;

  return (
    <group ref={groupRef}>
      {/* Atom A */}
      <mesh position={[-sep / 2, 0, 0]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color={colorA} emissive={colorA} emissiveIntensity={0.2} />
      </mesh>

      {/* Atom B */}
      <mesh position={[sep / 2, 0, 0]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color={colorB} emissive={colorB} emissiveIntensity={0.2} />
      </mesh>

      {/* Bond line */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, sep - 0.4, 6]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.6} />
      </mesh>

      {/* Electron sharing dots */}
      {pair.bondType.includes('Covalent') && (
        <>
          <mesh position={[-0.08, 0.1, 0]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.08, -0.1, 0]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}

      {/* Label */}
      <Html center position={[0, -0.5, 0]} distanceFactor={12}>
        <span style={{ color: '#e2e8f0', fontSize: 8, fontWeight: 600, pointerEvents: 'none', whiteSpace: 'nowrap', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
          {a.sym}–{b.sym} {pair.bondType}
        </span>
      </Html>
    </group>
  );
}

// ─── Lattice visualization ──────────────────────────────────────────────────
function LatticeViz({ elements }: { elements: Element[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const colorA = CATEGORY_COLORS[elements[0]?.category] ?? '#3b82f6';
  const colorB = CATEGORY_COLORS[elements[1]?.category] ?? '#ef4444';

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.15;
  });

  const nodes = useMemo(() => {
    const list: { pos: [number, number, number]; color: string }[] = [];
    const size = 2;
    for (let x = 0; x < size; x++)
      for (let y = 0; y < size; y++)
        for (let z = 0; z < size; z++) {
          const isA = (x + y + z) % 2 === 0;
          list.push({
            pos: [(x - 0.5) * 0.5, (y - 0.5) * 0.5, (z - 0.5) * 0.5],
            color: isA ? colorA : colorB,
          });
        }
    return list;
  }, [colorA, colorB]);

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={n.color} emissive={n.color} emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export function CenterStageVisualization() {
  const { selectedElements } = useSelection();

  const elements = useMemo(
    () => selectedElements.map(Z => byZ(Z)).filter(Boolean) as Element[],
    [selectedElements],
  );

  const pair = useMemo(() => {
    if (elements.length >= 2) return analyzePair(elements[0], elements[1]);
    return null;
  }, [elements]);

  if (elements.length === 0) return null;

  // Decide what to show
  let content: React.ReactNode;
  if (elements.length === 1) {
    content = <AtomViz element={elements[0]} />;
  } else if (elements.length >= 2 && pair) {
    // Show bond + optional lattice hint
    content = <BondViz a={elements[0]} b={elements[1]} pair={pair} />;
  } else {
    content = <AtomViz element={elements[0]} />;
  }

  return (
    <group position={GAP_CENTER} scale={[STAGE_SCALE, STAGE_SCALE, STAGE_SCALE]}>
      {/* Subtle glow backdrop */}
      <mesh>
        <circleGeometry args={[1.2, 24]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.03} side={THREE.DoubleSide} />
      </mesh>
      {content}
    </group>
  );
}
