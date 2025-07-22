import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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

function createTileGeometry(
  center: THREE.Vector3,
  radius: number
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  // Create a curved quad that follows the sphere surface
  const segments = 8;
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Generate vertices in a grid pattern
  for (let i = 0; i <= segments; i++) {
    for (let j = 0; j <= segments; j++) {
      const u = (i / segments - 0.5) * 0.8; // Scale down to create gaps
      const v = (j / segments - 0.5) * 0.8;

      // Calculate position on tangent plane
      const up = new THREE.Vector3(0, 1, 0);
      const normal = center.clone().normalize();
      const tangent = new THREE.Vector3().crossVectors(up, normal).normalize();
      const bitangent = new THREE.Vector3()
        .crossVectors(normal, tangent)
        .normalize();

      // Create point on tangent plane
      const planePoint = center
        .clone()
        .add(tangent.clone().multiplyScalar(u * 0.5))
        .add(bitangent.clone().multiplyScalar(v * 0.5));

      // Project onto sphere
      const spherePoint = planePoint.normalize().multiplyScalar(radius);

      vertices.push(spherePoint.x, spherePoint.y, spherePoint.z);
      normals.push(
        spherePoint.x / radius,
        spherePoint.y / radius,
        spherePoint.z / radius
      );
      uvs.push(i / segments, j / segments);
    }
  }

  // Create indices for triangles
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = a + 1;
      const c = a + segments + 1;
      const d = c + 1;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  return geometry;
}

export function TechStackSphere() {
  const groupRef = useRef<THREE.Group>(null);
  const tileCount = 30;
  const sphereRadius = 3;

  // Generate sphere points and tile geometries
  const { spherePoints, tileGeometries } = useMemo(() => {
    const points = fibonacciSphere(tileCount, sphereRadius);
    const geometries = points.map((point) =>
      createTileGeometry(point, sphereRadius)
    );
    return { spherePoints: points, tileGeometries: geometries };
  }, [tileCount, sphereRadius]);

  // Auto-rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {spherePoints.map((point, index) => (
        <mesh key={index} geometry={tileGeometries[index]}>
          <meshStandardMaterial
            color={`hsl(${(index / tileCount) * 360}, 70%, 50%)`}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
