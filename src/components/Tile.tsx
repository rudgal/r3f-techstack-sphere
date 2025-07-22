import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TileProps {
  geometry: THREE.BufferGeometry;
  color: string;
  index: number;
}

export function Tile({ geometry, color }: TileProps) {
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

  // Parse HSL color to get components
  const hslMatch = color.match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
  const hue = hslMatch ? parseInt(hslMatch[1]) : 0;
  const saturation = hslMatch ? parseInt(hslMatch[2]) : 70;
  const lightness = hslMatch ? parseInt(hslMatch[3]) : 50;

  // Brighten color on hover
  const displayColor = hovered
    ? `hsl(${hue}, ${saturation}%, ${Math.min(lightness + 20, 80)}%)`
    : color;

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
    >
      <meshStandardMaterial
        color={displayColor}
        side={THREE.DoubleSide}
        emissive={hovered ? displayColor : 'black'}
        emissiveIntensity={hovered ? 0.2 : 0}
      />
    </mesh>
  );
}
