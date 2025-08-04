import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';

export function ResponsiveCamera() {
  const { camera, gl } = useThree();
  const startDistanceRef = useRef<number | null>(null);

  useEffect(() => {
    // Capture the initial camera position on first mount
    if (startDistanceRef.current === null) {
      startDistanceRef.current = camera.position.z;
    }
    const handleResize = () => {
      // Only apply to PerspectiveCamera (which has aspect property)
      if (camera instanceof PerspectiveCamera && startDistanceRef.current) {
        console.log('aspect ratio changed:', camera.aspect);
        if (camera.aspect < 1) {
          camera.position.z = startDistanceRef.current / camera.aspect;
        } else {
          camera.position.z = startDistanceRef.current;
        }
        camera.updateProjectionMatrix();
      }
    };

    // Initial setup
    handleResize();

    // Listen to canvas resize events
    const domElement = gl.domElement;
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(domElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [camera, gl]);

  return null;
}
