import type { ReactNode } from 'react';
import { useControls, folder } from 'leva';
import {
  DEFAULT_TECHSTACK_SPHERE_CONFIG,
  type TechstackSphereConfig,
} from '../constants/techstackSphereConfig.ts';
import { TechstackSphereConfigContext } from './TechstackSphereConfigContext.ts';

// Provider component
interface TechstackSphereConfigProviderProps {
  children: ReactNode;
}

export function TechstackSphereConfigProvider({
  children,
}: TechstackSphereConfigProviderProps) {
  const config = useControls({
    Lighting: folder({
      'Directional Light': folder({
        directionalLightPosition: {
          value:
            DEFAULT_TECHSTACK_SPHERE_CONFIG.lighting.directionalLightPosition,
          label: 'Position',
          step: 0.1,
        },
        directionalLightIntensity: {
          value:
            DEFAULT_TECHSTACK_SPHERE_CONFIG.lighting.directionalLightIntensity,
          min: 0,
          max: 10,
          step: 0.1,
          label: 'Intensity',
        },
        directionalLightColor: {
          value: DEFAULT_TECHSTACK_SPHERE_CONFIG.lighting.directionalLightColor,
          label: 'Color',
        },
      }),

      'Ambient Light': folder({
        ambientLightIntensity: {
          value: DEFAULT_TECHSTACK_SPHERE_CONFIG.lighting.ambientLightIntensity,
          min: 0,
          max: 10,
          step: 0.1,
          label: 'Intensity',
        },
        ambientLightColor: {
          value: DEFAULT_TECHSTACK_SPHERE_CONFIG.lighting.ambientLightColor,
          label: 'Color',
        },
      }),
    }),

    'Tile Settings': folder({
      tileSize: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.tile.size,
        min: 0.1,
        max: 1.0,
        step: 0.01,
        label: 'Size',
      },
      tileDepth: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.tile.depth,
        min: 0.01,
        max: 0.2,
        step: 0.001,
        label: 'Depth',
      },
      tileRadius: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.tile.radius,
        min: 0.0,
        max: 0.1,
        step: 0.001,
        label: 'Corner Radius',
      },
      hoverScaleFactor: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.tile.hoverScaleFactor,
        min: 1.0,
        max: 3.0,
        step: 0.1,
        label: 'Hover Scale',
      },
      hoverDistance: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.tile.hoverDistance,
        min: 0.0,
        max: 0.5,
        step: 0.01,
        label: 'Hover Distance',
      },
      defaultBackgroundColor: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.tile.defaultBackgroundColor,
        label: 'Background',
      },

      Texture: folder({
        textureSizeRatio: {
          value: DEFAULT_TECHSTACK_SPHERE_CONFIG.tile.textureSizeRatio,
          min: 0.1,
          max: 1.0,
          step: 0.01,
          label: 'Size Ratio',
        },
        texturePadding: {
          value: DEFAULT_TECHSTACK_SPHERE_CONFIG.tile.texturePadding,
          min: 0.0,
          max: 0.3,
          step: 0.01,
          label: 'Padding',
        },
        textureRoughness: {
          value: DEFAULT_TECHSTACK_SPHERE_CONFIG.tile.textureRoughness,
          min: 0.0,
          max: 1.0,
          step: 0.01,
          label: 'Roughness',
        },
        textureMetalness: {
          value: DEFAULT_TECHSTACK_SPHERE_CONFIG.tile.textureMetalness,
          min: 0.0,
          max: 1.0,
          step: 0.01,
          label: 'Metalness',
        },
      }),
    }),

    'Sphere Settings': folder({
      minTileSeparation: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.sphere.minTileSeparation,
        min: 0.1,
        max: 1.0,
        step: 0.01,
        label: 'Tile Separation',
      },
      baseSphereRadius: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.sphere.baseSphereRadius,
        min: 0.1,
        max: 1.0,
        step: 0.01,
        label: 'Base Radius',
      },
      maxSphereRadius: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.sphere.maxSphereRadius,
        min: 1.0,
        max: 10.0,
        step: 0.1,
        label: 'Max Radius',
      },
      rotationSpeed: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.sphere.rotationSpeed,
        min: 0.0,
        max: 2.0,
        step: 0.01,
        label: 'Rotation Speed',
      },
      rotationSpeedTileHovered: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.sphere.rotationSpeedTileHovered,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        label: 'Speed (Hovered)',
      },
      speedLerpFactor: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.sphere.speedLerpFactor,
        min: 0.1,
        max: 10.0,
        step: 0.1,
        label: 'Speed Lerp',
      },
      radiusLerpFactor: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.sphere.radiusLerpFactor,
        min: 0.1,
        max: 10.0,
        step: 0.1,
        label: 'Radius Lerp',
      },
      radiusThreshold: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.sphere.radiusThreshold,
        min: 0.0001,
        max: 0.01,
        step: 0.0001,
        label: 'Radius Threshold',
      },
      poleExclusionPercentageTop: {
        value:
          DEFAULT_TECHSTACK_SPHERE_CONFIG.sphere.poleExclusionPercentageTop,
        min: 0.0,
        max: 0.5,
        step: 0.01,
        label: 'Top Exclusion',
      },
      poleExclusionPercentageBottom: {
        value:
          DEFAULT_TECHSTACK_SPHERE_CONFIG.sphere.poleExclusionPercentageBottom,
        min: 0.0,
        max: 0.5,
        step: 0.01,
        label: 'Bottom Exclusion',
      },
    }),

    'Flat View Settings': folder({
      wallSpacing: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.flatView.wallSpacing,
        min: 0.1,
        max: 2.0,
        step: 0.01,
        label: 'Spacing',
      },
      wallZ: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.flatView.wallZ,
        min: -2.0,
        max: 2.0,
        step: 0.01,
        label: 'Z Position',
      },
    }),

    'Animation Settings': folder({
      lerpSpeed: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.animation.lerpSpeed,
        min: 1.0,
        max: 20.0,
        step: 0.1,
        label: 'Lerp Speed',
      },
      positionLerpSpeed: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.animation.positionLerpSpeed,
        min: 1.0,
        max: 20.0,
        step: 0.1,
        label: 'Position Lerp',
      },
    }),

    Scene: folder({
      enableOrbitControls: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.scene.enableOrbitControls,
        label: 'Orbit Controls',
      },
      enableShadows: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.scene.enableShadows,
        label: 'Shadows',
      },
      showHelpers: {
        value: DEFAULT_TECHSTACK_SPHERE_CONFIG.scene.showHelpers,
        label: 'Show Helpers',
      },
    }),
  });

  // Map the Leva controls to our config structure
  const techstackSphereConfig: TechstackSphereConfig = {
    tile: {
      size: config.tileSize,
      depth: config.tileDepth,
      radius: config.tileRadius,
      hoverScaleFactor: config.hoverScaleFactor,
      hoverDistance: config.hoverDistance,
      defaultBackgroundColor: config.defaultBackgroundColor,
      textureSizeRatio: config.textureSizeRatio,
      texturePadding: config.texturePadding,
      textureRoughness: config.textureRoughness,
      textureMetalness: config.textureMetalness,
    },
    sphere: {
      minTileSeparation: config.minTileSeparation,
      baseSphereRadius: config.baseSphereRadius,
      maxSphereRadius: config.maxSphereRadius,
      rotationSpeed: config.rotationSpeed,
      rotationSpeedTileHovered: config.rotationSpeedTileHovered,
      speedLerpFactor: config.speedLerpFactor,
      radiusLerpFactor: config.radiusLerpFactor,
      radiusThreshold: config.radiusThreshold,
      poleExclusionPercentageTop: config.poleExclusionPercentageTop,
      poleExclusionPercentageBottom: config.poleExclusionPercentageBottom,
    },
    flatView: {
      wallSpacing: config.wallSpacing,
      wallZ: config.wallZ,
    },
    animation: {
      lerpSpeed: config.lerpSpeed,
      positionLerpSpeed: config.positionLerpSpeed,
    },
    lighting: {
      directionalLightPosition: config.directionalLightPosition,
      directionalLightIntensity: config.directionalLightIntensity,
      directionalLightColor: config.directionalLightColor,
      ambientLightIntensity: config.ambientLightIntensity,
      ambientLightColor: config.ambientLightColor,
    },
    scene: {
      enableOrbitControls: config.enableOrbitControls,
      enableShadows: config.enableShadows,
      showHelpers: config.showHelpers,
    },
  };

  return (
    <TechstackSphereConfigContext.Provider value={techstackSphereConfig}>
      {children}
    </TechstackSphereConfigContext.Provider>
  );
}
