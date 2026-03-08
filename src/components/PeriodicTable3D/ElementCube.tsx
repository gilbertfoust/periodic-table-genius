import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Element } from '@/data/elements';
import { CATEGORY_COLORS } from '@/data/categoryColors';

interface Props {
  element: Element;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: (Z: number, multi: boolean) => void;
}

// Parse hex to THREE.Color
function catColor(category: string): THREE.Color {
  const hex = CATEGORY_COLORS[category] ?? '#9aa6c8';
  return new THREE.Color(hex);
}

export function ElementCube({ element, position, isSelected, onSelect }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = useMemo(() => catColor(element.category), [element.category]);
  const emissiveColor = useMemo(() => color.clone().multiplyScalar(0.4), [color]);

  // Animate hover lift + pulse for selected
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const targetY = position[1] + (hovered ? 0.15 : 0);
    const targetScale = isSelected ? 1.08 : hovered ? 1.04 : 1;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * Math.min(delta * 8, 1);
    const s = meshRef.current.scale.x + (targetScale - meshRef.current.scale.x) * Math.min(delta * 8, 1);
    meshRef.current.scale.set(s, s, s);
  });

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    onSelect(element.Z, e.shiftKey ?? false);
  }, [element.Z, onSelect]);

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  const glowIntensity = isSelected ? 0.8 : hovered ? 0.5 : 0.2;

  return (
    <mesh
      ref={meshRef}
      position={[position[0], position[1], position[2]]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <RoundedBox args={[1.05, 1.05, 0.35]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={glowIntensity}
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={hovered || isSelected ? 0.95 : 0.8}
        />
      </RoundedBox>

      {/* Atomic number */}
      <Text
        position={[-0.32, 0.32, 0.2]}
        fontSize={0.16}
        color="white"
        anchorX="left"
        anchorY="top"
        font="/fonts/inter-medium.woff"
      >
        {String(element.Z)}
      </Text>

      {/* Symbol */}
      <Text
        position={[0, -0.02, 0.2]}
        fontSize={0.36}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
      >
        {element.sym}
      </Text>

      {/* Name (truncated for small cubes) */}
      <Text
        position={[0, -0.34, 0.2]}
        fontSize={0.11}
        color="rgba(255,255,255,0.7)"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.95}
      >
        {element.name}
      </Text>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0, 0.19]}>
          <ringGeometry args={[0.52, 0.58, 32]} />
          <meshBasicMaterial color="#66f0a6" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </mesh>
  );
}
