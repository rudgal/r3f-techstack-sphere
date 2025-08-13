import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTechstackSphereConfig } from '../hooks/useTechstackSphereConfig.ts';

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
  const { tile } = useTechstackSphereConfig();

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
      // Add custom uniforms
      shader.uniforms.backgroundColor = { value: new THREE.Color(color) };
      shader.uniforms.tileSize = { value: tile.size };
      shader.uniforms.texturePadding = { value: tile.texturePadding };

      // Add the uniform declaration to the fragment shader
      shader.fragmentShader = shader.fragmentShader.replace(
        'uniform float opacity;',
        `uniform float opacity;
        
        
        uniform vec3 backgroundColor;
        uniform float tileSize;
        uniform float texturePadding;`
      );

      // Add vertex shader modification to pass position, UV transform, and pre-calculated constants
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
        uniform float tileSize;
        uniform float texturePadding;
        varying vec3 vPosition;
        varying mat3 vMapTransform;
        varying float vHalfTileSize;
        varying vec2 vInvTileSize;
        varying float vOneMinusPadding;
        varying float vInvPaddingRange;`
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vPosition = position;
        vMapTransform = mapTransform;
        
        // Pre-calculate constants that don't change per fragment
        vHalfTileSize = tileSize * 0.5;
        vInvTileSize = vec2(1.0 / tileSize);
        vOneMinusPadding = 1.0 - texturePadding;
        vInvPaddingRange = 1.0 / (vOneMinusPadding - texturePadding);`
      );

      // Modify fragment shader to detect the front face using position
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
        varying vec3 vPosition;
        varying mat3 vMapTransform;
        varying float vHalfTileSize;
        varying vec2 vInvTileSize;
        varying float vOneMinusPadding;
        varying float vInvPaddingRange;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        // Check if this is the front face (positive Z side) of the box
        bool isFrontFace = vPosition.z > 0.01;
        
        #ifdef USE_MAP
          vec4 sampledDiffuseColor;
          
          if (isFrontFace) {
            // Use pre-calculated constants from vertex shader
            vec2 normalizedUV = clamp((vPosition.xy + vHalfTileSize) * vInvTileSize, 0.0, 1.0);
            
            // Check if we're in the texture region using simple box test
            vec2 paddingBounds = step(texturePadding, normalizedUV) * step(normalizedUV, vec2(vOneMinusPadding));
            bool inTextureRegion = paddingBounds.x * paddingBounds.y > 0.5;
            
            if (inTextureRegion) {
              // Scale UV to non-padded area using pre-calculated inverse
              vec2 paddedUV = (normalizedUV - texturePadding) * vInvPaddingRange;
              
              // Apply texture atlas transformation
              vec2 transformedUV = (vMapTransform * vec3(paddedUV, 1.0)).xy;
              sampledDiffuseColor = texture2D(map, transformedUV);
            } else {
              sampledDiffuseColor = vec4(backgroundColor, 1.0);
            }
            
          } else {
            sampledDiffuseColor = texture2D(map, vMapUv);
          }
          
          // Determine final color based on face and alpha
          vec3 finalColor = (isFrontFace && sampledDiffuseColor.a > 0.1) ? 
                           sampledDiffuseColor.rgb : backgroundColor;
          
          diffuseColor.rgb *= finalColor;
        #else
          diffuseColor.rgb *= backgroundColor;
        #endif
        `
      );

      // Store shader reference for uniform updates
      mat.userData.shader = shader;
    };

    return mat;
  }, [
    map,
    color,
    roughness,
    metalness,
    transparent,
    tile.size,
    tile.texturePadding,
  ]);

  // Update color when it changes
  useMemo(() => {
    if (materialRef.current?.userData.shader) {
      materialRef.current.userData.shader.uniforms.backgroundColor.value.set(
        color
      );
    }
  }, [color]);

  return <primitive object={material} attach="material" />;
}
