// Tile configuration interface
export interface TileConfig {
  size: number;
  depth: number;
  radius: number;
  hoverScaleFactor: number;
  hoverDistance: number;
  defaultBackgroundColor: string;
  textureSizeRatio: number;
  textureRoughness: number;
  textureMetalness: number;
  texturePadding: number;
}

// Sphere configuration interface
export interface SphereConfig {
  minTileSeparation: number;
  baseSphereRadius: number;
  maxSphereRadius: number;
  rotationSpeed: number;
  rotationSpeedTileHovered: number;
  speedLerpFactor: number;
  radiusLerpFactor: number;
  radiusThreshold: number;
  poleExclusionPercentageTop: number;
  poleExclusionPercentageBottom: number;
}

// Flat view configuration interface
export interface FlatViewConfig {
  wallSpacing: number;
  wallZ: number;
}

// Animation configuration interface
export interface AnimationConfig {
  lerpSpeed: number;
  positionLerpSpeed: number;
}

// Lighting configuration interface
export interface LightingConfig {
  directionalLightPosition: [number, number, number];
  directionalLightIntensity: number;
  directionalLightColor: string;
  ambientLightIntensity: number;
  ambientLightColor: string;
}

// Scene configuration interface
export interface SceneConfig {
  enableOrbitControls: boolean;
  enableShadows: boolean;
  showHelpers: boolean;
}

// Complete TechstackSphere configuration interface
export interface TechstackSphereConfig {
  tile: TileConfig;
  sphere: SphereConfig;
  flatView: FlatViewConfig;
  animation: AnimationConfig;
  lighting: LightingConfig;
  scene: SceneConfig;
}

// Default configuration values (current constants from the components)
export const DEFAULT_TECHSTACK_SPHERE_CONFIG: TechstackSphereConfig = {
  scene: {
    enableOrbitControls: false,
    enableShadows: true,
    showHelpers: false,
  },
  lighting: {
    directionalLightPosition: [6, 2, 4],
    directionalLightIntensity: 2.5,
    directionalLightColor: '#ffffff',
    ambientLightIntensity: 4.5,
    ambientLightColor: '#ffffff',
  },
  tile: {
    size: 0.4,
    depth: 0.04,
    radius: 0.02,
    hoverScaleFactor: 1.4,
    hoverDistance: 0.1,
    defaultBackgroundColor: '#dee2e6',
    textureSizeRatio: 0.85,
    textureRoughness: 0.2,
    textureMetalness: 0.3,
    texturePadding: 0.1,
  },
  sphere: {
    minTileSeparation: 0.3,
    baseSphereRadius: 0.3,
    maxSphereRadius: 3.0,
    rotationSpeed: 1.4,
    rotationSpeedTileHovered: 0.3,
    speedLerpFactor: 3,
    radiusLerpFactor: 2,
    radiusThreshold: 0.001,
    poleExclusionPercentageTop: 0.3,
    poleExclusionPercentageBottom: 0.3,
  },
  flatView: {
    wallSpacing: 0.5,
    wallZ: 0,
  },
  animation: {
    lerpSpeed: 8,
    positionLerpSpeed: 5,
  },
};
