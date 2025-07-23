import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Tile, TILE_DEPTH } from './Tile';
import techStackDataRaw from '../data/techstack.json';
import type { Technology, TechStackData, Category } from '../types/techstack';

const techStackData = techStackDataRaw as TechStackData;

interface TechStackSphereProps {
  selectedCategory: Category | null;
}

// Configuration constants
const SPHERE_RADIUS = 2;
const ROTATION_SPEED = 0.2; // Radians per second
const ROTATION_SPEED_TILE_HOVERED = 0.05; // Slower rotation when tile is hovered

function fibonacciSphere(samples: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2; // y from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y);

    const theta = phi * i; // golden angle increment

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }

  return points;
}

export function TechStackSphere({ selectedCategory }: TechStackSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredTileIndex, setHoveredTileIndex] = useState<number | null>(null);
  const currentSpeedRef = useRef(ROTATION_SPEED);

  // Filter technologies based on selected category
  const technologies: Technology[] = useMemo(() => {
    if (!selectedCategory) {
      return techStackData.technologies;
    }
    return techStackData.technologies.filter((tech) =>
      tech.categories.includes(selectedCategory)
    );
  }, [selectedCategory]);

  // Generate tile data with positions and rotations
  const tilesData = useMemo(() => {
    const points = fibonacciSphere(technologies.length, SPHERE_RADIUS);

    return points.map((point, index) => {
      // Calculate normal vector (from center to surface point)
      const normal = point.clone().normalize();
      
      // Create rotation to face outward and align with equator
      const rotation = new THREE.Euler();
      
      // First, create a quaternion to rotate the tile to face outward
      const quaternion = new THREE.Quaternion();
      const up = new THREE.Vector3(0, 1, 0);
      
      // If the point is at the poles, use a different reference vector
      if (Math.abs(normal.y) > 0.999) {
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      } else {
        // Calculate the rotation that aligns Z-axis with normal and keeps Y-axis pointing toward equator
        const tangent = new THREE.Vector3().crossVectors(up, normal).normalize();
        const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();
        
        const matrix = new THREE.Matrix4();
        matrix.makeBasis(tangent, bitangent, normal);
        quaternion.setFromRotationMatrix(matrix);
      }
      
      rotation.setFromQuaternion(quaternion);
      
      // Position tile slightly above sphere surface (half the depth) to make it sit on the sphere
      const position = point.clone().add(normal.clone().multiplyScalar(TILE_DEPTH / 2));

      return {
        position,
        rotation,
        technology: technologies[index],
      };
    });
  }, [technologies]);

  // Auto-rotation with smooth speed transition when hovering
  useFrame((_state, delta) => {
    if (groupRef.current) {
      const targetSpeed =
        hoveredTileIndex !== null
          ? ROTATION_SPEED_TILE_HOVERED
          : ROTATION_SPEED;
      // Smooth transition using lerp
      currentSpeedRef.current = THREE.MathUtils.lerp(
        currentSpeedRef.current,
        targetSpeed,
        delta * 3
      );
      groupRef.current.rotation.y += delta * currentSpeedRef.current;
    }
  });

  return (
    <group ref={groupRef}>
      {tilesData.map((tileData, index) => (
        <Tile
          key={tileData.technology.id}
          position={tileData.position}
          rotation={tileData.rotation}
          technology={tileData.technology}
          index={index}
          onHover={(isHovered) => setHoveredTileIndex(isHovered ? index : null)}
        />
      ))}
    </group>
  );
}
