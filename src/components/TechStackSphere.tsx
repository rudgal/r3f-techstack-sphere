import { useCallback, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Tile } from './Tile';
import { useTechnologyTextures } from '../hooks/useTextureAtlas';
import type { Category, Technology } from '../types/techstack';
import techStackDataRaw from '../data/techstack.json';
import { useAppConfig } from '../hooks/useAppConfig';
import type { SphereConfig } from '../constants/appConfig';

const ALL_TECHNOLOGIES = techStackDataRaw.technologies as Technology[];

interface TechStackSphereProps {
  selectedCategory: Category | null;
  viewMode: 'sphere' | 'flat';
}

export function TechStackSphere({
  selectedCategory,
  viewMode,
}: TechStackSphereProps) {
  const { sphere, flatView, tile } = useAppConfig();
  const groupRef = useRef<THREE.Group>(null);
  const hoveredTileIndexRef = useRef<number | null>(null);
  const currentSpeedRef = useRef(sphere.rotationSpeed);
  const currentRadiusRef = useRef(sphere.baseSphereRadius);

  // Filter technologies for sphere size calculation only
  const visibleTechnologies: Technology[] = useMemo(() => {
    if (!selectedCategory) {
      return ALL_TECHNOLOGIES;
    }
    return ALL_TECHNOLOGIES.filter((tech) =>
      tech.categories.includes(selectedCategory)
    );
  }, [selectedCategory]);

  // Calculate Fibonacci points for the VISIBLE technology count (proper sphere distribution)
  const filteredFibonacciPoints = useMemo(() => {
    return fibonacciSphere(visibleTechnologies.length, 1, sphere);
  }, [visibleTechnologies.length, sphere]);

  // Calculate flat wall positions for visible technologies
  const flatWallPositions = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const cols = Math.ceil(Math.sqrt(visibleTechnologies.length * 1.5)); // More columns than rows for better aspect ratio

    visibleTechnologies.forEach((_, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const totalCols = Math.min(cols, visibleTechnologies.length);
      const totalRows = Math.ceil(visibleTechnologies.length / cols);

      // Center the grid
      const x = (col - (totalCols - 1) / 2) * flatView.wallSpacing;
      const y = (row - (totalRows - 1) / 2) * flatView.wallSpacing * -1; // Negative to flip Y

      positions.push(new THREE.Vector3(x, y, flatView.wallZ));
    });

    return positions;
  }, [visibleTechnologies, flatView.wallSpacing, flatView.wallZ]);

  // Create content mapping: assign visible technologies to properly distributed positions
  const tileContentMapping = useMemo(() => {
    const mapping = new Map<number, Technology>();
    const positionMapping = new Map<number, THREE.Vector3>(); // Map tile index to new position
    const rotationMapping = new Map<number, THREE.Euler>(); // Map tile index to new rotation

    if (viewMode === 'sphere') {
      visibleTechnologies.forEach((tech, index) => {
        if (
          index < ALL_TECHNOLOGIES.length &&
          index < filteredFibonacciPoints.length
        ) {
          const point = filteredFibonacciPoints[index];
          const normal = point.clone().normalize();
          const rotation = calculateTileRotation(normal);

          mapping.set(index, tech); // Assign technology to tile position `index`
          positionMapping.set(index, normal); // Store normalized position for this tile
          rotationMapping.set(index, rotation); // Store rotation for this tile
        }
      });
    } else {
      // Flat view mapping
      visibleTechnologies.forEach((tech, index) => {
        if (
          index < ALL_TECHNOLOGIES.length &&
          index < flatWallPositions.length
        ) {
          const position = flatWallPositions[index];
          const rotation = new THREE.Euler(0, 0, 0); // No rotation for flat view

          mapping.set(index, tech);
          positionMapping.set(index, position); // Store flat position
          rotationMapping.set(index, rotation);
        }
      });
    }

    return {
      technologyMapping: mapping,
      positionMapping,
      rotationMapping,
    };
  }, [
    visibleTechnologies,
    filteredFibonacciPoints,
    flatWallPositions,
    viewMode,
  ]);

  // Load textures for all technologies (with atlas optimization)
  const { getTexture } = useTechnologyTextures();

  // Calculate target sphere radius based on VISIBLE tile count
  const targetRadius = useMemo(() => {
    return calculateSphereRadius(visibleTechnologies.length, tile.size, sphere);
  }, [visibleTechnologies.length, tile.size, sphere]);

  // Generate tile data for ALL technologies (positions will be calculated later per tile)
  const allTilesData = useMemo(() => {
    const points = fibonacciSphere(ALL_TECHNOLOGIES.length, 1, sphere); // Use unit sphere for base calculations

    return points.map((point, index) => {
      const normal = point.clone().normalize();
      const rotation = calculateTileRotation(normal);

      return {
        rotation,
        technology: ALL_TECHNOLOGIES[index],
        normalizedPosition: normal, // Store normalized position for later position calculation
        index, // Store index for stable positioning
      };
    });
  }, [sphere]); // Depend on sphere config for pole exclusion settings

  // Animation helpers
  const animateRotationSpeed = (delta: number) => {
    const targetSpeed =
      hoveredTileIndexRef.current !== null
        ? sphere.rotationSpeedTileHovered
        : sphere.rotationSpeed;

    currentSpeedRef.current = THREE.MathUtils.lerp(
      currentSpeedRef.current,
      targetSpeed,
      delta * sphere.speedLerpFactor
    );
  };

  const animateRadius = (delta: number) => {
    const currentRadius = currentRadiusRef.current;
    const newRadius = THREE.MathUtils.lerp(
      currentRadius,
      targetRadius,
      delta * sphere.radiusLerpFactor
    );

    if (Math.abs(newRadius - currentRadius) > sphere.radiusThreshold) {
      currentRadiusRef.current = newRadius;
    }
  };

  // Auto-rotation and smooth radius transitions
  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    if (viewMode === 'sphere') {
      animateRotationSpeed(delta);
      animateRadius(delta);
      groupRef.current.rotation.y += delta * currentSpeedRef.current;
    } else {
      // Reset rotation smoothly when in flat view
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        0,
        delta * 5
      );
    }
  });

  const handleTileHover = useCallback((index: number, isHovered: boolean) => {
    hoveredTileIndexRef.current = isHovered ? index : null;
  }, []);

  return (
    <group ref={groupRef}>
      {allTilesData.map((tileData, index) => {
        // Get the technology assigned to this tile position (or null if none)
        const assignedTechnology =
          tileContentMapping.technologyMapping.get(index);
        const isVisible = assignedTechnology !== undefined;

        // Get the recalculated position and rotation for proper sphere distribution
        const filteredNormalizedPosition =
          tileContentMapping.positionMapping.get(index);
        const filteredRotation = tileContentMapping.rotationMapping.get(index);

        // Use assigned technology or fallback to original (for texture loading)
        const technologyToUse = assignedTechnology || tileData.technology;

        const texture = getTexture(technologyToUse.id);

        return (
          <Tile
            key={index} // Use stable index-based key instead of technology.id
            rotation={filteredRotation || tileData.rotation} // Use filtered rotation or fallback
            technology={technologyToUse} // Use assigned technology or fallback
            texture={texture}
            visible={isVisible}
            sphereRadius={targetRadius} // Pass target radius for position calculation
            normalizedPosition={
              filteredNormalizedPosition || tileData.normalizedPosition
            } // Use filtered position or fallback
            onHover={(isHovered) => handleTileHover(index, isHovered)}
            viewMode={viewMode}
          />
        );
      })}
    </group>
  );
}

// Utility functions
function calculateSphereRadius(
  tileCount: number,
  tileSize: number,
  sphereConfig: SphereConfig
): number {
  if (tileCount === 0) return sphereConfig.baseSphereRadius;
  if (tileCount === 1) return sphereConfig.baseSphereRadius;

  // Calculate required surface area per tile (including separation)
  const areaPerTile = Math.pow(tileSize + sphereConfig.minTileSeparation, 2);
  const totalRequiredArea = tileCount * areaPerTile;

  // Calculate radius from surface area: Surface Area = 4πr²
  const calculatedRadius = Math.sqrt(totalRequiredArea / (4 * Math.PI));

  // Apply reasonable bounds
  return Math.max(
    sphereConfig.baseSphereRadius,
    Math.min(sphereConfig.maxSphereRadius, calculatedRadius)
  );
}

function fibonacciSphere(
  samples: number,
  radius: number,
  sphereConfig?: SphereConfig
): THREE.Vector3[] {
  if (samples === 0) return [];
  if (samples === 1) return [new THREE.Vector3(0, radius, 0)];

  const points: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

  // Exclude poles based on configuration (only if config is provided)
  const yMax = sphereConfig ? 1 - sphereConfig.poleExclusionPercentageTop : 0.7; // Top exclusion
  const yMin = sphereConfig
    ? -(1 - sphereConfig.poleExclusionPercentageBottom)
    : -0.7; // Bottom exclusion

  // Generate more points than needed to filter out poles
  const oversample = Math.ceil(samples * 1.5); // Generate 50% more points

  for (let i = 0; i < oversample; i++) {
    const y = 1 - (i / (oversample - 1)) * 2; // y from 1 to -1

    // Skip points in the polar regions
    if (y > yMax || y < yMin) continue;

    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i; // golden angle increment

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    points.push(new THREE.Vector3(x * radius, y * radius, z * radius));

    // Stop when we have enough valid points
    if (points.length >= samples) break;
  }

  return points;
}

function calculateTileRotation(normal: THREE.Vector3): THREE.Euler {
  const rotation = new THREE.Euler();
  const quaternion = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);

  // If the point is at the poles, use a different reference vector
  if (Math.abs(normal.y) > 0.999) {
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  } else {
    // Calculate the rotation that aligns Z-axis with normal and keeps Y-axis pointing toward equator
    const tangent = new THREE.Vector3().crossVectors(up, normal).normalize();
    const bitangent = new THREE.Vector3()
      .crossVectors(normal, tangent)
      .normalize();

    const matrix = new THREE.Matrix4();
    matrix.makeBasis(tangent, bitangent, normal);
    quaternion.setFromRotationMatrix(matrix);
  }

  rotation.setFromQuaternion(quaternion);
  return rotation;
}
