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
      // Add custom uniforms
      shader.uniforms.backgroundColor = { value: new THREE.Color(color) };
      shader.uniforms.tileSize = { value: 0.4 }; // Make tile size configurable (should match actual tile size)
      shader.uniforms.texturePadding = { value: 0.1 };

      // Add the uniform declaration to the fragment shader
      shader.fragmentShader = shader.fragmentShader.replace(
        'uniform float opacity;',
        `uniform float opacity;
        uniform vec3 backgroundColor;
        uniform float tileSize;
        uniform float texturePadding;`
      );

      // Add vertex shader modification to pass position and UV transform to fragment shader
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
        varying vec3 vPosition;
        varying mat3 vMapTransform;`
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vPosition = position;
        vMapTransform = mapTransform;`
      );

      // Modify fragment shader to detect the front face using position
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
        varying vec3 vPosition;
        varying mat3 vMapTransform;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        // Check if this is the front face (positive Z side) of the box
        bool isFrontFace = vPosition.z > 0.01;
        
        #ifdef USE_MAP
          vec4 sampledDiffuseColor;
          
          if (isFrontFace) {
            // For ExtrudeGeometry (RoundedBox), UV coordinates are based on world coordinates
            // and need to be normalized to 0-1 range to work with our texture atlas
            
            // ExtrudeGeometry front face uses world X,Y coordinates directly
            // We need to normalize them to 0-1 range based on the tile size
            vec2 normalizedUV = (vPosition.xy + tileSize * 0.5) / tileSize;
            
            // Clamp to ensure we stay within bounds
            normalizedUV = clamp(normalizedUV, 0.0, 1.0);
            
            // Apply padding by checking if we're in the texture region
            vec2 textureStart = vec2(texturePadding);
            vec2 textureEnd = vec2(1.0 - texturePadding);
            
            // If we're outside the texture region, use background color
            if (normalizedUV.x < textureStart.x || normalizedUV.x > textureEnd.x ||
                normalizedUV.y < textureStart.y || normalizedUV.y > textureEnd.y) {
              sampledDiffuseColor = vec4(backgroundColor, 1.0);
            } else {
              // Scale and center the UV to fit within the non-padded area
              vec2 paddedUV = (normalizedUV - textureStart) / (textureEnd - textureStart);
              
              // Now we need to apply the texture atlas transformation
              // The vMapTransform matrix contains offset and repeat values
              vec2 transformedUV = (vMapTransform * vec3(paddedUV, 1.0)).xy;
              
              sampledDiffuseColor = texture2D(map, transformedUV);
            }
          } else {
            // Other faces: just sample normally
            sampledDiffuseColor = texture2D(map, vMapUv);
          }
          
          // Apply the color
          vec3 finalColor;
          if (isFrontFace && sampledDiffuseColor.a > 0.1) {
            // Front face with texture: show texture
            finalColor = sampledDiffuseColor.rgb;
          } else {
            // Other faces or no texture: show background color
            finalColor = backgroundColor;
          }
          
          diffuseColor.rgb *= finalColor;
        #else
          // No texture case - all faces get background color
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
      materialRef.current.userData.shader.uniforms.backgroundColor.value.set(
        color
      );
    }
  }, [color]);

  return <primitive object={material} attach="material" />;
}
