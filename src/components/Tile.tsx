import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Technology } from '../types/techstack';

interface TileProps {
  geometry: THREE.BufferGeometry;
  technology: Technology;
  index: number;
}

export function Tile({ geometry, technology }: TileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);

  // Smooth scale animation
  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    const targetScale = hovered ? 1.1 : 1;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 8);
    setCurrentScale(newScale);

    meshRef.current.scale.setScalar(newScale);
  });

  const handleClick = () => {
    if (technology.url) {
      window.open(technology.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={handleClick}
    >
      <meshStandardMaterial
        color={technology.backgroundColor}
        side={THREE.DoubleSide}
        emissive={hovered ? technology.backgroundColor : 'black'}
        emissiveIntensity={hovered ? 0.3 : 0}
      />
    </mesh>
  );
}
