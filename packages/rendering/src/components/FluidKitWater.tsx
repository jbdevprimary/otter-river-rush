/**
 * Fluid Kit Water Component
 *
 * Quality-aware water rendering:
 * - Ultra/High: Fluid Kit 3D meshes with full shader
 * - Medium: Animated shader with AmbientCG textures
 * - Low: Simple PBR material with AmbientCG textures
 *
 * Features:
 * - LOD system for mobile performance
 * - Tiled rendering along river path
 * - Section-specific effects (rapids foam, calm pool reflections)
 * - Proper asset loading via useGLTF/useTexture
 */

import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { RiverPathPoint, RiverSectionType } from '@otter-river-rush/types';
import { AnimatedWaterMaterial } from '../shaders';

// Asset paths for Fluid Kit LOD meshes
const FLUID_KIT_PATHS = {
  high: '/assets/models/water/water_tile_high.glb',
  medium: '/assets/models/water/water_tile_medium.glb',
  low: '/assets/models/water/water_tile_low.glb',
} as const;

// AmbientCG water texture paths
const AMBIENT_CG_TEXTURES = {
  normal: '/textures/water/water_normal.jpg',
  roughness: '/textures/water/water_roughness.jpg',
  foamColor: '/textures/water/Foam001_1K-JPG_Color.jpg',
  foamNormal: '/textures/water/Foam001_1K-JPG_NormalGL.jpg',
} as const;

type FluidKitLOD = 'high' | 'medium' | 'low';

/**
 * Water parameters per section type
 */
const SECTION_WATER_PARAMS: Record<
  RiverSectionType,
  {
    waveHeight: number;
    waveSpeed: number;
    flowSpeed: number;
    foamIntensity: number;
    opacity: number;
  }
> = {
  normal: {
    waveHeight: 0.06,
    waveSpeed: 1.2,
    flowSpeed: 0.12,
    foamIntensity: 0.3,
    opacity: 0.88,
  },
  rapids: {
    waveHeight: 0.15,
    waveSpeed: 2.5,
    flowSpeed: 0.25,
    foamIntensity: 0.8,
    opacity: 0.75,
  },
  calm_pool: {
    waveHeight: 0.02,
    waveSpeed: 0.5,
    flowSpeed: 0.05,
    foamIntensity: 0.1,
    opacity: 0.92,
  },
  whirlpool: {
    waveHeight: 0.1,
    waveSpeed: 1.8,
    flowSpeed: 0.15,
    foamIntensity: 0.5,
    opacity: 0.82,
  },
};

interface FluidKitWaterProps {
  /** Path points defining river center and width */
  pathPoints?: RiverPathPoint[];
  /** Player distance for culling */
  playerDistance?: number;
  /** Current section type for effects */
  sectionType?: RiverSectionType;
  /** Primary water color from biome */
  waterColor?: string;
  /** Deep water color */
  deepColor?: string;
  /** Foam color for fresnel edges */
  foamColor?: string;
  /** River width (used when no path points) */
  riverWidth?: number;
  /** River length (used when no path points) */
  riverLength?: number;
  /** Whether to use Fluid Kit meshes (from quality settings) */
  useFluidKit?: boolean;
  /** Fluid Kit LOD level */
  fluidKitLOD?: FluidKitLOD;
  /** Water geometry segments for shader */
  waterSegments?: number;
}

// ============================================================================
// Fluid Kit 3D Water Mesh (Ultra/High quality)
// ============================================================================

function FluidKitWaterMesh({
  lod = 'medium',
  position,
  rotation,
  scale,
  waterColor = '#1e40af',
  foamColor = '#ffffff',
  sectionType = 'normal',
}: {
  lod?: FluidKitLOD;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  waterColor?: string;
  foamColor?: string;
  sectionType?: RiverSectionType;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(FLUID_KIT_PATHS[lod]);
  const params = SECTION_WATER_PARAMS[sectionType];

  // Clone the scene and apply custom water material
  const waterMesh = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const waterMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uWaterColor: { value: new THREE.Color(waterColor) },
            uDeepColor: { value: new THREE.Color(waterColor).multiplyScalar(0.5) },
            uFoamColor: { value: new THREE.Color(foamColor) },
            uWaveHeight: { value: params.waveHeight },
            uWaveFrequency: { value: 0.5 },
            uWaveSpeed: { value: params.waveSpeed },
            uFlowSpeed: { value: params.flowSpeed },
            uFresnelPower: { value: 2.5 },
            uOpacity: { value: params.opacity },
          },
          vertexShader: `
            uniform float uTime;
            uniform float uWaveHeight;
            uniform float uWaveFrequency;
            uniform float uWaveSpeed;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewDirection;

            void main() {
              vUv = uv;
              vec3 pos = position;
              float wave1 = sin(pos.y * uWaveFrequency + uTime * uWaveSpeed) * uWaveHeight;
              float wave2 = sin(pos.x * uWaveFrequency * 2.0 + uTime * uWaveSpeed * 1.3) * uWaveHeight * 0.5;
              pos.z += wave1 + wave2;

              vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
              vViewDirection = normalize(cameraPosition - worldPosition.xyz);
              vNormal = normalize(normalMatrix * normal);

              gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
          `,
          fragmentShader: `
            uniform float uTime;
            uniform vec3 uWaterColor;
            uniform vec3 uDeepColor;
            uniform vec3 uFoamColor;
            uniform float uFlowSpeed;
            uniform float uFresnelPower;
            uniform float uOpacity;

            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewDirection;

            void main() {
              vec2 flowUv = vUv;
              flowUv.y -= uTime * uFlowSpeed;

              float fresnel = pow(1.0 - max(dot(vNormal, vViewDirection), 0.0), uFresnelPower);
              float depthFactor = 1.0 - abs(vUv.x - 0.5) * 2.0;

              vec3 baseColor = mix(uWaterColor, uDeepColor, depthFactor * 0.5);
              vec3 finalColor = mix(baseColor, uFoamColor, fresnel * 0.6);

              gl_FragColor = vec4(finalColor, uOpacity);
            }
          `,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        child.material = waterMaterial;
      }
    });
    return cloned;
  }, [scene, waterColor, foamColor, params]);

  // Animate shader time uniform
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
          child.material.uniforms.uTime.value = state.clock.elapsedTime;
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={waterMesh} />
    </group>
  );
}

// ============================================================================
// AmbientCG Water Surface (Medium quality - animated shader with textures)
// ============================================================================

function AmbientCGWaterSurface({
  width,
  length,
  position,
  sectionType = 'normal',
  waterColor = '#1e40af',
  deepColor,
  foamColor = '#ffffff',
  segments = 64,
}: {
  width: number;
  length: number;
  position: [number, number, number];
  sectionType?: RiverSectionType;
  waterColor?: string;
  deepColor?: string;
  foamColor?: string;
  segments?: number;
}) {
  const params = SECTION_WATER_PARAMS[sectionType];

  // Load AmbientCG textures
  const [normalMap, roughnessMap] = useTexture([
    AMBIENT_CG_TEXTURES.normal,
    AMBIENT_CG_TEXTURES.roughness,
  ]);

  // Configure texture wrapping
  useMemo(() => {
    [normalMap, roughnessMap].forEach((tex) => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, Math.ceil(length / 4));
      }
    });
  }, [normalMap, roughnessMap, length]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
      <planeGeometry args={[width, length, segments, segments]} />
      <AnimatedWaterMaterial
        waterColor={waterColor}
        deepColor={deepColor}
        foamColor={foamColor}
        waveHeight={params.waveHeight}
        waveFrequency={0.4}
        waveSpeed={params.waveSpeed}
        flowSpeed={params.flowSpeed}
        fresnelPower={2.0}
        opacity={params.opacity}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
      />
    </mesh>
  );
}

// ============================================================================
// Simple PBR Water (Low quality - basic material with AmbientCG textures)
// ============================================================================

function SimplePBRWater({
  width,
  length,
  position,
  sectionType = 'normal',
  waterColor = '#1e40af',
}: {
  width: number;
  length: number;
  position: [number, number, number];
  sectionType?: RiverSectionType;
  waterColor?: string;
}) {
  const params = SECTION_WATER_PARAMS[sectionType];
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Load AmbientCG textures
  const [normalMap, roughnessMap] = useTexture([
    AMBIENT_CG_TEXTURES.normal,
    AMBIENT_CG_TEXTURES.roughness,
  ]);

  // Configure textures
  useMemo(() => {
    [normalMap, roughnessMap].forEach((tex) => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, Math.ceil(length / 8));
      }
    });
  }, [normalMap, roughnessMap, length]);

  // Simple UV scroll animation
  useFrame((state) => {
    if (normalMap) {
      normalMap.offset.y = state.clock.elapsedTime * params.flowSpeed * 0.5;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
      <planeGeometry args={[width, length, 16, 16]} />
      <meshStandardMaterial
        ref={materialRef}
        color={waterColor}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        roughness={0.3}
        metalness={0.1}
        transparent
        opacity={params.opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ============================================================================
// Procedural Fallback (for Suspense loading states)
// ============================================================================

export function ProceduralWaterSurface({
  width,
  length,
  position,
  sectionType = 'normal',
  waterColor = '#1e40af',
  deepColor,
  foamColor = '#ffffff',
}: {
  width: number;
  length: number;
  position: [number, number, number];
  sectionType?: RiverSectionType;
  waterColor?: string;
  deepColor?: string;
  foamColor?: string;
}) {
  const params = SECTION_WATER_PARAMS[sectionType];

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
      <planeGeometry args={[width, length, 32, 32]} />
      <AnimatedWaterMaterial
        waterColor={waterColor}
        deepColor={deepColor}
        foamColor={foamColor}
        waveHeight={params.waveHeight}
        waveFrequency={0.4}
        waveSpeed={params.waveSpeed}
        flowSpeed={params.flowSpeed}
        fresnelPower={2.0}
        opacity={params.opacity}
      />
    </mesh>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main Fluid Kit Water Component
 *
 * Renders water based on quality settings:
 * - useFluidKit=true: 3D Fluid Kit meshes (Ultra/High)
 * - useFluidKit=false: AmbientCG textured plane (Medium/Low)
 */
export function FluidKitWater({
  pathPoints,
  playerDistance = 0,
  sectionType = 'normal',
  waterColor = '#1e40af',
  deepColor,
  foamColor = '#ffffff',
  riverWidth = 8,
  riverLength = 50,
  useFluidKit = true,
  fluidKitLOD = 'medium',
  waterSegments = 64,
}: FluidKitWaterProps) {
  const defaultPosition: [number, number, number] = [0, -0.1, riverLength / 2 - 10];

  // Determine rendering based on quality settings
  if (useFluidKit) {
    // Ultra/High: Use Fluid Kit 3D meshes
    if (pathPoints && pathPoints.length >= 2) {
      return (
        <Suspense
          fallback={
            <ProceduralWaterSurface
              width={riverWidth}
              length={riverLength}
              position={defaultPosition}
              sectionType={sectionType}
              waterColor={waterColor}
              deepColor={deepColor}
              foamColor={foamColor}
            />
          }
        >
          <FluidKitWaterTiled
            pathPoints={pathPoints}
            playerDistance={playerDistance}
            sectionType={sectionType}
            waterColor={waterColor}
            foamColor={foamColor}
            quality={fluidKitLOD}
          />
        </Suspense>
      );
    }

    // Simple single-mesh mode
    return (
      <Suspense
        fallback={
          <ProceduralWaterSurface
            width={riverWidth}
            length={riverLength}
            position={defaultPosition}
            sectionType={sectionType}
            waterColor={waterColor}
            deepColor={deepColor}
            foamColor={foamColor}
          />
        }
      >
        <FluidKitWaterMesh
          lod={fluidKitLOD}
          position={defaultPosition}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[riverWidth / 4, riverLength / 4, 1]}
          sectionType={sectionType}
          waterColor={waterColor}
          foamColor={foamColor}
        />
      </Suspense>
    );
  }

  // Medium quality: AmbientCG with animated shader
  if (waterSegments >= 32) {
    return (
      <Suspense
        fallback={
          <ProceduralWaterSurface
            width={riverWidth}
            length={riverLength}
            position={defaultPosition}
            sectionType={sectionType}
            waterColor={waterColor}
            deepColor={deepColor}
            foamColor={foamColor}
          />
        }
      >
        <AmbientCGWaterSurface
          width={riverWidth}
          length={riverLength}
          position={defaultPosition}
          sectionType={sectionType}
          waterColor={waterColor}
          deepColor={deepColor}
          foamColor={foamColor}
          segments={waterSegments}
        />
      </Suspense>
    );
  }

  // Low quality: Simple PBR with AmbientCG textures
  return (
    <Suspense
      fallback={
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={defaultPosition}>
          <planeGeometry args={[riverWidth, riverLength]} />
          <meshBasicMaterial color={waterColor} transparent opacity={0.8} />
        </mesh>
      }
    >
      <SimplePBRWater
        width={riverWidth}
        length={riverLength}
        position={defaultPosition}
        sectionType={sectionType}
        waterColor={waterColor}
      />
    </Suspense>
  );
}

// ============================================================================
// Tiled Water for Path Following
// ============================================================================

function FluidKitWaterTiled({
  pathPoints,
  playerDistance,
  sectionType,
  waterColor,
  foamColor,
  quality,
}: {
  pathPoints: RiverPathPoint[];
  playerDistance: number;
  sectionType: RiverSectionType;
  waterColor: string;
  foamColor: string;
  quality: FluidKitLOD;
}) {
  const tiles = useMemo(() => {
    const result: Array<{
      position: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
      distance: number;
      lod: FluidKitLOD;
    }> = [];

    // Sample every N path points to create tiles
    const step = Math.floor(pathPoints.length / 20) || 1;
    for (let i = 0; i < pathPoints.length; i += step) {
      const point = pathPoints[i];
      const nextIdx = Math.min(i + 1, pathPoints.length - 1);
      const nextPoint = pathPoints[nextIdx];

      // Calculate angle between points for rotation
      const dx = nextPoint.centerX - point.centerX;
      const dy = nextPoint.distance - point.distance;
      const angle = Math.atan2(dx, dy);

      // Scale based on river width
      const widthScale = point.width / 4;

      // LOD based on distance from player
      const distFromPlayer = Math.abs(point.distance - playerDistance);
      let lod: FluidKitLOD = quality;
      if (distFromPlayer > 30) lod = 'low';
      else if (distFromPlayer > 15) lod = 'medium';

      result.push({
        position: [point.centerX, point.centerZ - 0.1, point.distance],
        rotation: [-Math.PI / 2, 0, -angle],
        scale: [widthScale, 1, 1],
        distance: point.distance,
        lod,
      });
    }

    return result;
  }, [pathPoints, playerDistance, quality]);

  return (
    <group>
      {tiles.map((tile, index) => (
        <FluidKitWaterMesh
          key={`water-tile-${index}`}
          lod={tile.lod}
          position={tile.position}
          rotation={tile.rotation}
          scale={tile.scale}
          sectionType={sectionType}
          waterColor={waterColor}
          foamColor={foamColor}
        />
      ))}
    </group>
  );
}

// ============================================================================
// Foam Overlay for Rapids
// ============================================================================

export function RapidsFoamOverlay({
  width,
  length,
  position,
  intensity = 0.5,
}: {
  width: number;
  length: number;
  position: [number, number, number];
  intensity?: number;
}) {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.9;
      materialRef.current.opacity = intensity * 0.4 * pulse;
    }
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[position[0], position[1] + 0.02, position[2]]}
    >
      <planeGeometry args={[width, length]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#ffffff"
        transparent
        opacity={intensity * 0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Preload Fluid Kit meshes
useGLTF.preload(FLUID_KIT_PATHS.high);
useGLTF.preload(FLUID_KIT_PATHS.medium);
useGLTF.preload(FLUID_KIT_PATHS.low);

export default FluidKitWater;
