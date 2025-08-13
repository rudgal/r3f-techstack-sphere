import { useMemo, useRef, useState } from 'react';
import { type ThreeEvent, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import type { Texture } from 'three';
import * as THREE from 'three';
import type { Technology } from '../types/techstack';
import { HoverLabel } from './HoverLabel';
import { useTechstackSphereConfig } from '../hooks/useTechstackSphereConfig.ts';
import { CustomTileMaterial } from './CustomTileMaterial';

interface TileProps {
  rotation: THREE.Euler;
  technology: Technology;
  texture?: Texture | null;
  visible?: boolean;
  sphereRadius?: number; // For dynamic sphere radius
  normalizedPosition?: THREE.Vector3; // For base position calculation
  onHover?: (isHovered: boolean) => void;
  viewMode?: 'sphere' | 'flat';
}

export function Tile({
  rotation,
  technology,
  texture,
  visible = true,
  sphereRadius,
  normalizedPosition,
  onHover,
  viewMode = 'sphere',
}: TileProps) {
  const { tile, animation } = useTechstackSphereConfig();
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);
  const [currentOffset, setCurrentOffset] = useState(0);

  // Determine background color once
  const backgroundColor =
    technology.backgroundColor || tile.defaultBackgroundColor;

  // Calculate target position based on view mode
  const targetPosition = useMemo(() => {
    if (viewMode === 'flat') {
      // In flat mode, normalizedPosition is already the final position
      return normalizedPosition || new THREE.Vector3(0, 0, 0);
    } else {
      // In sphere mode, calculate position from normalized position and sphere radius
      if (normalizedPosition && sphereRadius !== undefined) {
        return normalizedPosition
          .clone()
          .multiplyScalar(sphereRadius + tile.depth / 2);
      }
    }

    // Fallback to origin if no position data
    return new THREE.Vector3(0, 0, 0);
  }, [normalizedPosition, sphereRadius, viewMode, tile.depth]);

  // Smooth scale and position animation
  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    const targetScale = hovered ? tile.hoverScaleFactor : 1;
    const targetOffset = hovered ? tile.hoverDistance : 0;

    const newScale = THREE.MathUtils.lerp(
      currentScale,
      targetScale,
      delta * animation.lerpSpeed
    );
    const newOffset = THREE.MathUtils.lerp(
      currentOffset,
      targetOffset,
      delta * animation.lerpSpeed
    );

    setCurrentScale(newScale);
    setCurrentOffset(newOffset);

    groupRef.current.scale.setScalar(newScale);

    // Calculate final position with hover offset
    let finalPosition: THREE.Vector3;

    if (viewMode === 'flat') {
      // In flat mode, move forward on Z axis when hovered
      finalPosition = targetPosition.clone();
      finalPosition.z += newOffset;
    } else {
      // In sphere mode, move away from center
      const normalizedDirection = targetPosition.clone().normalize();
      finalPosition = targetPosition
        .clone()
        .add(normalizedDirection.multiplyScalar(newOffset));
    }

    // Set position (smoothly lerp to new position when sphere radius changes)
    groupRef.current.position.lerp(
      finalPosition,
      delta * animation.positionLerpSpeed
    );
  });

  const handleClick = () => {
    if (technology.url) {
      window.open(technology.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    onHover?.(false);
    document.body.style.cursor = 'grab';
  };

  // Use a group to better handle textures
  return (
    <group
      ref={groupRef}
      rotation={rotation}
      visible={visible}
      raycast={visible ? undefined : () => null}
    >
      {/* Main tile body */}
      <RoundedBox
        onPointerOver={visible ? handlePointerOver : undefined}
        onPointerOut={visible ? handlePointerOut : undefined}
        onClick={visible ? handleClick : undefined}
        castShadow
        receiveShadow
        args={[tile.size, tile.size, tile.depth]}
        radius={0.02}
        smoothness={4}
      >
        <CustomTileMaterial
          map={texture}
          color={backgroundColor}
          transparent={!!texture}
          roughness={tile.textureRoughness}
          metalness={tile.textureMetalness}
        />
      </RoundedBox>

      {/* Hover label */}
      <HoverLabel
        label={technology.name}
        visible={visible && hovered}
        position={[0, tile.size * 0.7, 0]}
      />
    </group>
  );
}
