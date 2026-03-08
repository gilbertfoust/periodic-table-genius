import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Element } from '@/data/elements';
import { CATEGORY_COLORS } from '@/data/categoryColors';

interface Props {
  element: Element;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: (Z: number, multi: boolean) => void;
}

function catColor(category: string): THREE.Color {
  const hex = CATEGORY_COLORS[category] ?? '#9aa6c8';
  return new THREE.Color(hex);
}

export function ElementCube({ element, position, isSelected, onSelect }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const color = useMemo(() => catColor(element.category), [element.category]);
  const emissiveColor = useMemo(() => color.clone().multiplyScalar(0.5), [color]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = position[1] + (hovered ? 0.2 : 0);
    const targetScale = isSelected ? 1.1 : hovered ? 1.06 : 1;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * Math.min(delta * 8, 1);
    const s = groupRef.current.scale.x + (targetScale - groupRef.current.scale.x) * Math.min(delta * 8, 1);
    groupRef.current.scale.set(s, s, s);
  });

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    onSelect(element.Z, e.nativeEvent?.shiftKey ?? false);
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

  const glowIntensity = isSelected ? 1.0 : hovered ? 0.6 : 0.25;

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Main cube */}
      <mesh>
        <boxGeometry args={[1.05, 1.05, 0.3]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={glowIntensity}
          metalness={0.2}
          roughness={0.5}
          transparent
          opacity={hovered || isSelected ? 0.95 : 0.75}
        />
      </mesh>

      {/* Atomic number */}
      <Text
        position={[-0.35, 0.35, 0.17]}
        fontSize={0.17}
        color="white"
        anchorX="left"
        anchorY="top"
      >
        {String(element.Z)}
      </Text>

      {/* Symbol - larger and bold-looking */}
      <Text
        position={[0, 0, 0.17]}
        fontSize={0.38}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {element.sym}
      </Text>

      {/* Name */}
      <Text
        position={[0, -0.35, 0.17]}
        fontSize={0.1}
        color="rgba(255,255,255,0.65)"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.95}
      >
        {element.name.length > 10 ? element.name.slice(0, 9) + '…' : element.name}
      </Text>

      {/* Selection glow ring */}
      {isSelected && (
        <mesh position={[0, 0, 0.17]}>
          <ringGeometry args={[0.54, 0.6, 4]} />
          <meshBasicMaterial color="#66f0a6" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
