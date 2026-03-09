import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Element } from '@/data/elements';
import { CATEGORY_COLORS } from '@/data/categoryColors';
import { normalizeRadius } from '@/data/atomicRadii';
import { normalizeProperty } from '@/data/elementProperties';
import type { TableOverlay3D } from './PeriodicTable3D';

interface Props {
  element: Element;
  position: [number, number, number];
  isSelected: boolean;
  isFocused?: boolean;
  isDimmed?: boolean;
  onSelect: (Z: number, multi: boolean) => void;
  onHover?: (Z: number | null) => void;
  onDoubleClick?: (Z: number) => void;
  overlay: TableOverlay3D;
  entranceDelay?: number;
}

function catColor(category: string): THREE.Color {
  const hex = CATEGORY_COLORS[category] ?? '#9aa6c8';
  return new THREE.Color(hex);
}

// Electronegativity range for normalization
const EN_MIN = 0.7;
const EN_MAX = 4.0;

function normalizeEN(en: number | null): number | null {
  if (en == null) return null;
  return (en - EN_MIN) / (EN_MAX - EN_MIN);
}

export function ElementCube({ element, position, isSelected, isFocused, isDimmed, onSelect, onHover, onDoubleClick, overlay, entranceDelay = 0 }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const focusRingRef = useRef<THREE.Mesh>(null);

  // Random spawn position, computed once
  const spawnPos = useMemo(() => ({
    x: (Math.random() - 0.5) * 60,
    y: (Math.random() - 0.5) * 40 + 15,
    z: (Math.random() - 0.5) * 40 - 20,
  }), []);

  const arrivedRef = useRef(false);
  const elapsedRef = useRef(0);

  const color = useMemo(() => catColor(element.category), [element.category]);
  const emissiveColor = useMemo(() => color.clone().multiplyScalar(0.5), [color]);

  // Compute overlay-driven dimensions
  const { scaleXZ, heightZ, yOffset } = useMemo(() => {
    if (overlay === 'radius') {
      const t = normalizeRadius(element.Z);
      const s = t != null ? 0.5 + t * 0.7 : 0.7;
      return { scaleXZ: s, heightZ: 0.3, yOffset: 0 };
    }
    if (overlay === 'electronegativity') {
      const t = normalizeEN(element.en);
      const h = t != null ? 0.15 + t * 2.35 : 0.15;
      return { scaleXZ: 0.85, heightZ: h, yOffset: h / 2 - 0.15 };
    }
    if (overlay === 'both') {
      const tR = normalizeRadius(element.Z);
      const tEN = normalizeEN(element.en);
      const s = tR != null ? 0.5 + tR * 0.7 : 0.7;
      const h = tEN != null ? 0.15 + tEN * 2.35 : 0.15;
      return { scaleXZ: s, heightZ: h, yOffset: h / 2 - 0.15 };
    }
    if (overlay === 'meltingPoint' || overlay === 'density' || overlay === 'ionizationEnergy') {
      const t = normalizeProperty(element.Z, overlay);
      const h = t != null ? 0.15 + t * 2.35 : 0.15;
      return { scaleXZ: 0.85, heightZ: h, yOffset: h / 2 - 0.15 };
    }
    return { scaleXZ: 1, heightZ: 0.3, yOffset: 0 };
  }, [overlay, element.Z, element.en]);

  // Smooth animation targets
  const targetRef = useRef({ scaleXZ, heightZ, yOffset });
  targetRef.current = { scaleXZ, heightZ, yOffset };
  const animState = useRef({ scaleXZ: 1, heightZ: 0.3, yOffset: 0 });

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    elapsedRef.current += delta;
    const t_entrance = Math.max(0, Math.min(1, (elapsedRef.current - entranceDelay) / 1.2));
    // Smooth ease-out cubic
    const ease = 1 - Math.pow(1 - t_entrance, 3);

    const lerp = Math.min(delta * 5, 1);
    const a = animState.current;
    const tgt = targetRef.current;
    a.scaleXZ += (tgt.scaleXZ - a.scaleXZ) * lerp;
    a.heightZ += (tgt.heightZ - a.heightZ) * lerp;
    a.yOffset += (tgt.yOffset - a.yOffset) * lerp;

    const hoverLift = hovered ? 0.25 : 0;
    const selectScale = isSelected ? 1.08 : hovered ? 1.04 : 1;

    // Interpolate from spawn to final position
    const finalX = position[0];
    const finalY = position[1] + a.yOffset + hoverLift;
    const finalZ = position[2];

    groupRef.current.position.x = spawnPos.x + (finalX - spawnPos.x) * ease;
    groupRef.current.position.y = spawnPos.y + (finalY - spawnPos.y) * ease;
    groupRef.current.position.z = spawnPos.z + (finalZ - spawnPos.z) * ease;

    const entranceScale = 0.01 + ease * 0.99;
    groupRef.current.scale.set(
      a.scaleXZ * selectScale * entranceScale,
      selectScale * entranceScale,
      a.scaleXZ * selectScale * entranceScale
    );

    if (t_entrance >= 1) arrivedRef.current = true;

    // Animate focus ring
    if (focusRingRef.current) {
      const mat = focusRingRef.current.material as THREE.MeshStandardMaterial;
      const targetOpacity = isFocused ? 0.9 : 0;
      mat.opacity += (targetOpacity - mat.opacity) * delta * 10;
      
      // Pulse effect when focused
      if (isFocused) {
        const pulse = Math.sin(Date.now() * 0.004) * 0.08 + 1.0;
        focusRingRef.current.scale.setScalar(pulse);
      }
    }
  });

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    onSelect(element.Z, e.nativeEvent?.shiftKey ?? false);
  }, [element.Z, onSelect]);

  const handleDoubleClick = useCallback((e: any) => {
    e.stopPropagation();
    onDoubleClick?.(element.Z);
  }, [element.Z, onDoubleClick]);

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(element.Z);
    document.body.style.cursor = 'pointer';
  }, [element.Z, onHover]);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    onHover?.(null);
    document.body.style.cursor = 'auto';
  }, [onHover]);

  const glowIntensity = isSelected ? 1.0 : hovered ? 0.6 : isDimmed ? 0.1 : 0.25;
  const currentHeight = animState.current.heightZ;
  const baseOpacity = isDimmed ? 0.2 : (hovered || isSelected ? 0.95 : 0.75);

  // Color tint for heatmap overlays
  const matColor = useMemo(() => {
    let baseColor = color;
    
    if (overlay === 'electronegativity' || overlay === 'both') {
      const t = normalizeEN(element.en);
      if (t != null) {
        const c = new THREE.Color();
        c.setHSL(0.7 - t * 0.7, 0.85, 0.45 + t * 0.15);
        baseColor = c;
      }
    } else if (overlay === 'meltingPoint') {
      const t = normalizeProperty(element.Z, 'meltingPoint');
      if (t != null) {
        const c = new THREE.Color();
        c.setHSL(0.58 - t * 0.58, 0.9, 0.45 + t * 0.1);
        baseColor = c;
      }
    } else if (overlay === 'density') {
      const t = normalizeProperty(element.Z, 'density');
      if (t != null) {
        const c = new THREE.Color();
        c.setHSL(0.5 - t * 0.28, 0.7 + t * 0.15, 0.55 - t * 0.15);
        baseColor = c;
      }
    } else if (overlay === 'ionizationEnergy') {
      const t = normalizeProperty(element.Z, 'ionizationEnergy');
      if (t != null) {
        const c = new THREE.Color();
        c.setHSL(0.33 - t * 0.33, 0.75 + t * 0.15, 0.4 + t * 0.1);
        baseColor = c;
      }
    }
    
    // Apply dimming if needed
    if (isDimmed) {
      return baseColor.clone().multiplyScalar(0.3);
    }
    return baseColor;
  }, [overlay, element.en, element.Z, color, isDimmed]);

  const matEmissive = useMemo(() => matColor.clone().multiplyScalar(0.5), [matColor]);

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Main box — height driven by overlay */}
      <mesh>
        <boxGeometry args={[1.05, heightZ, 1.05]} />
        <meshStandardMaterial
          color={matColor}
          emissive={matEmissive}
          emissiveIntensity={glowIntensity}
          metalness={0.2}
          roughness={0.5}
          transparent
          opacity={baseOpacity}
        />
      </mesh>

      {/* Atomic number */}
      <Text
        position={[-0.35, heightZ / 2 + 0.04, 0.35]}
        fontSize={0.15}
        color="white"
        anchorX="left"
        anchorY="bottom"
        fillOpacity={isDimmed ? 0.3 : 1}
      >
        {String(element.Z)}
      </Text>

      {/* Symbol */}
      <Text
        position={[0, heightZ / 2 + 0.04, 0]}
        fontSize={0.34}
        color="white"
        anchorX="center"
        anchorY="bottom"
        fillOpacity={isDimmed ? 0.3 : 1}
      >
        {element.sym}
      </Text>

      {/* Name on the face */}
      <Text
        position={[0, -heightZ / 2 - 0.02, 0.35]}
        fontSize={0.09}
        color="rgba(255,255,255,0.6)"
        anchorX="center"
        anchorY="top"
        maxWidth={0.95}
        fillOpacity={isDimmed ? 0.3 : 1}
      >
        {element.name.length > 10 ? element.name.slice(0, 9) + '…' : element.name}
      </Text>

      {/* Focus ring indicator (white pulsing ring) */}
      <mesh ref={focusRingRef} position={[0, heightZ / 2 + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.58, 0.66, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.8}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Selection glow ring */}
      {isSelected && (
        <mesh position={[0, heightZ / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.56, 4]} />
          <meshBasicMaterial color="#66f0a6" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
