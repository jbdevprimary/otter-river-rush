/**
 * Graphics Quality Configuration
 *
 * Defines quality presets for different device capabilities.
 * Ultra/High use Fluid Kit meshes, Medium/Low use AmbientCG textures.
 */

export type GraphicsQuality = 'ultra' | 'high' | 'medium' | 'low';

export interface QualitySettings {
  /** Quality preset name */
  quality: GraphicsQuality;
  /** Use Fluid Kit 3D water meshes (vs flat plane with shader) */
  useFluidKitWater: boolean;
  /** LOD level for Fluid Kit meshes */
  fluidKitLOD: 'high' | 'medium' | 'low';
  /** Use AmbientCG PBR textures for water */
  useWaterTextures: boolean;
  /** Water shader wave complexity (number of wave calculations) */
  waterWaveComplexity: 1 | 2 | 3;
  /** Water geometry segments (for vertex displacement) */
  waterSegments: number;
  /** Shadow map resolution */
  shadowMapSize: number;
  /** Enable soft shadows */
  softShadows: boolean;
  /** Max visible environment objects per side */
  maxEnvironmentObjects: number;
  /** Enable particle effects (foam, mist) */
  enableParticles: boolean;
  /** Terrain texture resolution */
  textureResolution: '1K' | '2K' | '512';
  /** Enable reflection probes */
  enableReflections: boolean;
  /** Post-processing effects */
  enablePostProcessing: boolean;
}

/**
 * Quality presets
 */
export const QUALITY_PRESETS: Record<GraphicsQuality, QualitySettings> = {
  ultra: {
    quality: 'ultra',
    useFluidKitWater: true,
    fluidKitLOD: 'high',
    useWaterTextures: true,
    waterWaveComplexity: 3,
    waterSegments: 128,
    shadowMapSize: 2048,
    softShadows: true,
    maxEnvironmentObjects: 50,
    enableParticles: true,
    textureResolution: '2K',
    enableReflections: true,
    enablePostProcessing: true,
  },
  high: {
    quality: 'high',
    useFluidKitWater: true,
    fluidKitLOD: 'medium',
    useWaterTextures: true,
    waterWaveComplexity: 3,
    waterSegments: 64,
    shadowMapSize: 1024,
    softShadows: true,
    maxEnvironmentObjects: 40,
    enableParticles: true,
    textureResolution: '1K',
    enableReflections: false,
    enablePostProcessing: true,
  },
  medium: {
    quality: 'medium',
    useFluidKitWater: false, // Use AmbientCG water shader instead
    fluidKitLOD: 'low',
    useWaterTextures: true,
    waterWaveComplexity: 2,
    waterSegments: 32,
    shadowMapSize: 512,
    softShadows: false,
    maxEnvironmentObjects: 25,
    enableParticles: false,
    textureResolution: '1K',
    enableReflections: false,
    enablePostProcessing: false,
  },
  low: {
    quality: 'low',
    useFluidKitWater: false, // Use simple AmbientCG PBR
    fluidKitLOD: 'low',
    useWaterTextures: true,
    waterWaveComplexity: 1,
    waterSegments: 16,
    shadowMapSize: 256,
    softShadows: false,
    maxEnvironmentObjects: 15,
    enableParticles: false,
    textureResolution: '512',
    enableReflections: false,
    enablePostProcessing: false,
  },
};

/**
 * Detect recommended quality based on device capabilities
 */
export function detectRecommendedQuality(): GraphicsQuality {
  const environment = getGraphicsEnvironment();
  if (!environment) return 'medium';
  if (!environment.hasWebGL) return 'low';
  return pickQuality(environment);
}

interface GraphicsEnvironment {
  isMobile: boolean;
  renderer: string;
  deviceMemory: number;
  hasWebGL: boolean;
}

function getGraphicsEnvironment(): GraphicsEnvironment | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null;
  }

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  const hasWebGL = Boolean(gl);
  const renderer = gl ? getRendererString(gl) : '';
  const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory || 4;

  return { isMobile, renderer, deviceMemory, hasWebGL };
}

function getRendererString(gl: WebGLRenderingContext | WebGL2RenderingContext): string {
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
}

function pickQuality(environment: GraphicsEnvironment): GraphicsQuality {
  const { isHighEnd, isMidRange } = getRendererTier(environment.renderer);
  const { isMobile, deviceMemory } = environment;

  if (isMobile) {
    if (isHighEnd && deviceMemory >= 6) return 'high';
    if (deviceMemory >= 4) return 'medium';
    return 'low';
  }

  if (isHighEnd && deviceMemory >= 8) return 'ultra';
  if (isHighEnd || (isMidRange && deviceMemory >= 8)) return 'high';
  if (isMidRange && deviceMemory >= 4) return 'medium';
  return 'low';
}

function getRendererTier(renderer: string): { isHighEnd: boolean; isMidRange: boolean } {
  return {
    isHighEnd: /NVIDIA|AMD|Radeon|GeForce|RTX|GTX|Apple M[1-3]/i.test(renderer),
    isMidRange: /Intel|Iris|Mali-G[7-9]/i.test(renderer),
  };
}

/**
 * Get quality settings for a preset
 */
export function getQualitySettings(quality: GraphicsQuality): QualitySettings {
  return QUALITY_PRESETS[quality];
}
