import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface CustomTileMaterialProps {
  map?: THREE.Texture | null;
  color: string;
  roughness: number;
  metalness: number;
  transparent?: boolean;
}

export function CustomTileMaterial({
  map,
  color,
  roughness,
  metalness,
  transparent = false,
}: CustomTileMaterialProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      roughness,
      metalness,
      transparent,
      map,
    });

    // Store reference for updates
    materialRef.current = mat;

    // Custom fragment shader that blends texture with background color
    mat.onBeforeCompile = (shader) => {
      // Add custom uniform for background color
      shader.uniforms.backgroundColor = { value: new THREE.Color(color) };

      // Add the uniform declaration to the fragment shader
      shader.fragmentShader = shader.fragmentShader.replace(
        'uniform float opacity;',
        `uniform float opacity;
        uniform vec3 backgroundColor;`
      );

      // Modify fragment shader to blend texture with background color
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D( map, vMapUv );
          
          // Blend the texture with background color based on texture alpha
          // Where texture is transparent (alpha = 0), show background color
          // Where texture is opaque (alpha = 1), show texture color
          vec3 finalColor = mix(backgroundColor, sampledDiffuseColor.rgb, sampledDiffuseColor.a);
          
          diffuseColor.rgb *= finalColor;
        #else
          // No texture, just use background color
          diffuseColor.rgb *= backgroundColor;
        #endif
        `
      );

      // Store shader reference for uniform updates
      mat.userData.shader = shader;
    };

    return mat;
  }, [map, color, roughness, metalness, transparent]);

  // Update color when it changes
  useMemo(() => {
    if (materialRef.current?.userData.shader) {
      materialRef.current.userData.shader.uniforms.backgroundColor.value.set(color);
    }
  }, [color]);

  return <primitive object={material} attach="material" />;
}