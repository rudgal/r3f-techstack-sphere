import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import CustomObject from './CustomObject';
import * as THREE from 'three';

export default function Experience() {
  const cubeRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    // console.log("state", state);
    // console.log("delta", delta);
    if (cubeRef.current) {
      cubeRef.current.rotation.y += delta;
    }
    // if (groupRef.current) {
    //   groupRef.current.rotation.y += delta;
    // }

    // const radius = 10;
    // state.camera.position.x = Math.sin(state.clock.getElapsedTime()) * radius;
    // state.camera.position.z = Math.cos(state.clock.getElapsedTime()) * radius;
    // state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <OrbitControls />

      <directionalLight position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.5} />

      <group ref={groupRef}>
        <mesh position-x={-2}>
          <sphereGeometry />
          <meshStandardMaterial color="orange" />
        </mesh>
        <mesh ref={cubeRef} rotation-y={Math.PI / 4} position-x={2} scale={1.5}>
          <boxGeometry scale={1.5} />
          <meshStandardMaterial color="mediumpurple" wireframe={false} />
        </mesh>
      </group>
      <mesh position-y={-1} rotation-x={-Math.PI / 2} scale={10}>
        <planeGeometry />
        <meshStandardMaterial color="greenyellow" />
      </mesh>

      <CustomObject />
    </>
  );
}
