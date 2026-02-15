import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Element } from '@/data/elements';
import { CATEGORY_COLORS } from '@/data/categoryColors';
import type { SceneControls } from '@/types/learningLayers';

interface Props {
  elements: Element[];
  controls: SceneControls;
  onResetRef?: React.MutableRefObject<(() => void) | null>;
}

export function getLatticeCaption(elements: Element[]): string {
  const names = elements.map(e => e.sym).join('-');
  return `Crystal lattice of ${names} — ions arrange in a repeating 3D pattern. This structure forms when oppositely charged ions are attracted to each other.`;
}

interface Node { pos: [number, number, number]; color: string; delay: number }

export function LatticeScene({ elements, controls, onResetRef }: Props) {
  const startTime = useRef<number | null>(null);
  const visibleRef = useRef(0);
  const showUnitCell = !!controls.overlays['unitCell'];

  const totalDuration = useMemo(() => {
    const size = 3;
    return (size * size * size - 1) * 0.06 + 0.5; // last delay + buffer
  }, []);

  const nodes = useMemo<Node[]>(() => {
    const list: Node[] = [];
    const size = 3;
    const colorA = CATEGORY_COLORS[elements[0]?.category] ?? '#3b82f6';
    const colorB = CATEGORY_COLORS[elements[1]?.category] ?? '#ef4444';
    let idx = 0;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          const isA = (x + y + z) % 2 === 0;
          list.push({
            pos: [(x - 1) * 0.8, (y - 1) * 0.8, (z - 1) * 0.8],
            color: isA ? colorA : colorB,
            delay: idx * 0.06,
          });
          idx++;
        }
      }
    }
    return list;
  }, [elements]);

  // Reset handler
  const reset = useCallback(() => {
    startTime.current = null;
    visibleRef.current = 0;
  }, []);

  if (onResetRef) onResetRef.current = reset;

  useFrame(({ clock }) => {
    if (controls.scrubPhase !== null) {
      visibleRef.current = controls.scrubPhase * totalDuration;
      return;
    }
    if (controls.paused) return;
    if (startTime.current === null) startTime.current = clock.elapsedTime;
    const elapsed = (clock.elapsedTime - startTime.current) * controls.speed;
    visibleRef.current = elapsed;
  });

  return (
    <>
      <OrbitControls enableDamping dampingFactor={0.1} enableZoom enablePan={false} />
      {nodes.map((n, i) => (
        <LatticeNode key={i} node={n} timeRef={visibleRef} />
      ))}
      {/* Unit cell wireframe overlay */}
      {showUnitCell && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#fbbf24" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </>
  );
}

function LatticeNode({ node, timeRef }: { node: Node; timeRef: React.MutableRefObject<number> }) {
  const ref = useRef<any>(null);

  useFrame(() => {
    if (ref.current) {
      const show = timeRef.current > node.delay;
      ref.current.visible = show;
      if (show) {
        const t = Math.min((timeRef.current - node.delay) * 3, 1);
        ref.current.scale.setScalar(t);
      }
    }
  });

  return (
    <mesh ref={ref} position={node.pos} visible={false} scale={0}>
      <sphereGeometry args={[0.18, 12, 12]} />
      <meshStandardMaterial color={node.color} />
    </mesh>
  );
}
