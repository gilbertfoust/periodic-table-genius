/**
 * MoleculeScene — renders a multi-atom molecule (3–4 elements) in 3D.
 * Shows a central atom, surrounding atoms, bond sticks, electron clouds,
 * and a continuously-looping bond-formation animation.
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import type { Element } from '@/data/elements';
import type { SceneControls } from '@/types/learningLayers';
import * as THREE from 'three';
import { getShellElectrons } from './AtomStructureScene';

interface Props {
  elements: Element[];
  controls: SceneControls;
}

// Simple element-color palette
const ELEMENT_COLORS: Record<string, string> = {
  H: '#e2e8f0', He: '#d4f4fd', Li: '#b4c5e4', Be: '#89b4fa',
  C: '#94a3b8', N: '#60a5fa', O: '#f87171', F: '#a3e635',
  Na: '#f59e0b', Mg: '#10b981', Al: '#94a3b8', Si: '#fb923c',
  P: '#f97316', S: '#facc15', Cl: '#4ade80', K: '#c084fc',
  Ca: '#38bdf8', Fe: '#f87171', Cu: '#fb923c', Zn: '#a3e635',
};

function elementColor(el: Element): string {
  return ELEMENT_COLORS[el.sym] ?? '#94a3b8';
}

// Atom radius scaled by shell count (visual only)
function atomRadius(el: Element): number {
  const shells = getShellElectrons(el.Z);
  return 0.28 + shells.length * 0.045;
}

// Molecule geometry: positions atoms around a central atom
function buildPositions(count: number): THREE.Vector3[] {
  if (count === 2) return [new THREE.Vector3(-1.1, 0, 0), new THREE.Vector3(1.1, 0, 0)];
  if (count === 3) return [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-1.3, 0.55, 0),
    new THREE.Vector3(1.3, 0.55, 0),
  ];
  if (count === 4) return [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-1.2, 0.7, 0.4),
    new THREE.Vector3(1.2, 0.7, 0.4),
    new THREE.Vector3(0, -1.2, -0.4),
  ];
  // 5 atoms – linear-ish
  return [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-1.4, 0, 0),
    new THREE.Vector3(1.4, 0, 0),
    new THREE.Vector3(0, 1.3, 0),
    new THREE.Vector3(0, -1.3, 0),
  ].slice(0, count);
}

// Bond stick between two positions — animates opacity from ref
function BondStick({ from, to, progressRef, delay = 0 }: {
  from: THREE.Vector3; to: THREE.Vector3;
  progressRef: React.MutableRefObject<number>;
  delay?: number;
}) {
  const mid = useMemo(() => from.clone().add(to).multiplyScalar(0.5), [from, to]);
  const dir = useMemo(() => to.clone().sub(from), [from, to]);
  const length = useMemo(() => dir.length(), [dir]);
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return q;
  }, [dir]);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    if (!matRef.current) return;
    matRef.current.opacity = Math.min(Math.max((progressRef.current - 0.1 - delay) / 0.4, 0), 0.82);
  });

  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[0.045, 0.045, length, 10]} />
      <meshStandardMaterial ref={matRef} color="#94a3b8" transparent opacity={0} roughness={0.4} metalness={0.05} />
    </mesh>
  );
}

// Pulsing electron cloud shared between atoms
function SharedCloud({ pos, color, progressRef, delay = 0 }: {
  pos: THREE.Vector3; color: string;
  progressRef: React.MutableRefObject<number>;
  delay?: number;
}) {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = Math.min(Math.max((progressRef.current - 0.3 - delay) / 0.5, 0), 1);
    const pulse = 0.9 + Math.sin(t * 2.5 + delay * 10) * 0.08;
    if (innerRef.current) {
      innerRef.current.scale.setScalar(p * pulse);
      (innerRef.current.material as THREE.MeshStandardMaterial).opacity = p * 0.3;
    }
    if (outerRef.current) {
      outerRef.current.scale.setScalar(p * pulse * 1.45);
      (outerRef.current.material as THREE.MeshStandardMaterial).opacity = p * 0.12;
    }
  });

  return (
    <group position={pos}>
      <mesh ref={innerRef} scale={0}>
        <sphereGeometry args={[0.38, 14, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={outerRef} scale={0}>
        <sphereGeometry args={[0.38, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Orbiting valence electrons around a single atom (local space)
function AtomElectrons({ element, color }: { element: Element; color: string }) {
  const shells = useMemo(() => getShellElectrons(element.Z), [element.Z]);
  const valence = shells[shells.length - 1] ?? 1;
  const r = atomRadius(element) + 0.35;
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    t.current += delta * 1.8;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const angle = t.current + (i / valence) * Math.PI * 2;
      m.position.x = Math.cos(angle) * r;
      m.position.y = Math.sin(angle * 0.5) * 0.1;
      m.position.z = Math.sin(angle) * r;
    });
  });

  return (
    <>
      {Array.from({ length: Math.min(valence, 6) }).map((_, i) => (
        <mesh key={i} ref={el => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} transparent opacity={0.85} />
        </mesh>
      ))}
    </>
  );
}

export function getMoleculeCaption(elements: Element[]): string {
  const formula = elements.map(e => e.sym).join('');
  const names = elements.map(e => e.name).join(', ');
  return `Molecule view: ${formula} — showing ${elements.length} atoms (${names}) with bond clouds and valence electrons. Bonds loop to show continuous formation.`;
}

export function MoleculeScene({ elements, controls }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);

  const LOOP_HOLD = 2.0;

  useFrame((_, delta) => {
    if (controls.scrubPhase !== null) {
      progressRef.current = controls.scrubPhase;
    } else if (!controls.paused) {
      progressRef.current += delta * 0.3 * controls.speed;
      if (progressRef.current > LOOP_HOLD) progressRef.current = 0;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15 * controls.speed * (controls.paused ? 0 : 1);
    }
  });

  const positions = useMemo(() => buildPositions(elements.length), [elements.length]);
  const colors = useMemo(() => elements.map(el => elementColor(el)), [elements]);
  const radii = useMemo(() => elements.map(el => atomRadius(el)), [elements]);

  // Bond pairs: connect index 0 to all others (central atom model), then sequential for linear
  const bondPairs = useMemo(() => {
    if (elements.length <= 1) return [];
    if (elements.length === 2) return [[0, 1]];
    // Central atom is index 0 for 3-4 atoms
    const pairs: [number, number][] = [];
    for (let i = 1; i < elements.length; i++) pairs.push([0, i]);
    return pairs;
  }, [elements.length]);

  // Cloud midpoints between bonded pairs
  const cloudPositions = useMemo(() =>
    bondPairs.map(([a, b]) => positions[a].clone().add(positions[b]).multiplyScalar(0.5)),
    [bondPairs, positions]
  );

  const level = controls.level;
  const formula = elements.map(e => e.sym).join('');

  return (
    <>
      <OrbitControls enableDamping dampingFactor={0.1} enableZoom enablePan={false} />
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 3, 4]} intensity={2} color="#f0f9ff" />
      <pointLight position={[-3, -1, 2]} intensity={0.8} color="#60a5fa" />
      <pointLight position={[3, -1, 2]} intensity={0.8} color="#f87171" />

      <group ref={groupRef}>
        {/* Bond sticks */}
        {bondPairs.map(([a, b], i) => (
          <BondStick
            key={i}
            from={positions[a]}
            to={positions[b]}
            progressRef={progressRef}
            delay={i * 0.05}
          />
        ))}

        {/* Shared electron clouds at bond midpoints */}
        {cloudPositions.map((pos, i) => (
          <SharedCloud
            key={i}
            pos={pos}
            color={`#${Math.floor(0x34d399).toString(16)}`}
            progressRef={progressRef}
            delay={i * 0.06}
          />
        ))}

        {/* Atoms */}
        {elements.map((el, i) => {
          const col = colors[i];
          const r = radii[i];
          return (
            <group key={i} position={positions[i]}>
              {/* Nucleus */}
              <mesh>
                <sphereGeometry args={[r, 22, 22]} />
                <meshStandardMaterial color={col} roughness={0.22} metalness={0.12} emissive={col} emissiveIntensity={0.32} />
              </mesh>
              {/* Glow */}
              <mesh>
                <sphereGeometry args={[r * 1.6, 14, 14]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.5} transparent opacity={0.1} depthWrite={false} />
              </mesh>
              {/* Label */}
              <Html center distanceFactor={6}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', gap: 1 }}>
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 800, textShadow: `0 0 6px ${col}` }}>{el.sym}</span>
                  {level !== 'beginner' && (
                    <span style={{ color: '#94a3b8', fontSize: 8 }}>Z={el.Z}</span>
                  )}
                </div>
              </Html>
              {/* Valence electrons */}
              <AtomElectrons element={el} color={col} />
            </group>
          );
        })}

        {/* Formula label */}
        <Html center position={[0, -2.4, 0]}>
          <div style={{ color: '#34d399', fontSize: 12, fontWeight: 800, pointerEvents: 'none', whiteSpace: 'nowrap', textShadow: '0 0 8px #34d399' }}>
            {formula} — {bondPairs.length} bond{bondPairs.length !== 1 ? 's' : ''} forming ⟳
          </div>
        </Html>
      </group>
    </>
  );
}
