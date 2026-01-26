/**
 * Animated Water Shader Material
 *
 * A performance-optimized water shader for the river surface featuring:
 * - Wave ripples via sine-based vertex displacement
 * - Flow animation via UV scrolling
 * - Fresnel effect for edge highlights
 * - Biome-aware coloring through uniforms
 *
 * Optimized for mobile with reduced wave calculations and simple lighting.
 */

import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import type React from 'react';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

/**
 * Vertex Shader
 *
 * Handles wave displacement and passes data to fragment shader:
 * - Multi-frequency sine waves for natural-looking ripples
 * - UV coordinates for flow animation
 * - View direction for fresnel calculation
 */
const waterVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWaveHeight;
  uniform float uWaveFrequency;
  uniform float uWaveSpeed;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    vUv = uv;

    // Calculate wave displacement using multiple sine waves
    // This creates natural-looking ripples at different scales
    vec3 pos = position;

    // Primary wave (large slow waves flowing down river)
    float wave1 = sin(pos.y * uWaveFrequency + uTime * uWaveSpeed) * uWaveHeight;

    // Secondary wave (smaller faster cross-waves)
    float wave2 = sin(pos.x * uWaveFrequency * 2.0 + uTime * uWaveSpeed * 1.3) * uWaveHeight * 0.5;

    // Tertiary wave (fine ripples for detail)
    float wave3 = sin((pos.x + pos.y) * uWaveFrequency * 3.0 + uTime * uWaveSpeed * 0.7) * uWaveHeight * 0.25;

    // Combine waves with slight position-based variation
    pos.z += wave1 + wave2 + wave3;

    // Calculate world position for fresnel
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;

    // Calculate view direction for fresnel effect
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);

    // Calculate modified normal based on wave displacement
    // Approximate normal by calculating partial derivatives
    float dx = cos(pos.x * uWaveFrequency * 2.0 + uTime * uWaveSpeed * 1.3) * uWaveHeight * 0.5 * uWaveFrequency * 2.0;
    float dy = cos(pos.y * uWaveFrequency + uTime * uWaveSpeed) * uWaveHeight * uWaveFrequency;
    vNormal = normalize(vec3(-dx, -dy, 1.0));

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

/**
 * Fragment Shader
 *
 * Handles water appearance:
 * - Base color from biome
 * - Flow-animated caustic-like patterns
 * - Fresnel edge highlighting
 * - Subtle specular highlights
 */
const waterFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uWaterColor;
  uniform vec3 uDeepColor;
  uniform vec3 uFoamColor;
  uniform float uFlowSpeed;
  uniform float uFresnelPower;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  // Simple noise function for water variation
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // Smooth noise
  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    // Flow animation - UV offset over time (flowing down the river)
    vec2 flowUv = vUv;
    flowUv.y -= uTime * uFlowSpeed;

    // Create flowing caustic-like pattern
    float caustic1 = smoothNoise(flowUv * 8.0);
    float caustic2 = smoothNoise(flowUv * 12.0 + vec2(uTime * 0.1, 0.0));
    float causticPattern = (caustic1 + caustic2) * 0.5;

    // Fresnel effect - edges are brighter
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDirection), 0.0), uFresnelPower);

    // Depth variation based on UV (center is deeper)
    float depthFactor = 1.0 - abs(vUv.x - 0.5) * 2.0;
    depthFactor = depthFactor * depthFactor;

    // Mix base color with deep color based on depth
    vec3 baseColor = mix(uWaterColor, uDeepColor, depthFactor * 0.5);

    // Add caustic pattern variation
    baseColor += causticPattern * 0.1;

    // Add fresnel highlight (foam-like edges)
    vec3 fresnelColor = mix(baseColor, uFoamColor, fresnel * 0.6);

    // Simple specular highlight (sun reflection)
    vec3 lightDir = normalize(vec3(-1.0, 2.0, -1.0));
    vec3 halfDir = normalize(lightDir + vViewDirection);
    float specular = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
    vec3 specularColor = vec3(1.0) * specular * 0.5;

    // Final color
    vec3 finalColor = fresnelColor + specularColor;

    // Output with transparency
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

/**
 * Water shader material uniforms interface
 */
interface WaterMaterialUniforms {
  uTime: number;
  uWaterColor: THREE.Color;
  uDeepColor: THREE.Color;
  uFoamColor: THREE.Color;
  uWaveHeight: number;
  uWaveFrequency: number;
  uWaveSpeed: number;
  uFlowSpeed: number;
  uFresnelPower: number;
  uOpacity: number;
}

/**
 * Create the shader material using drei's shaderMaterial helper
 */
const WaterShaderMaterial = shaderMaterial(
  // Default uniforms
  {
    uTime: 0,
    uWaterColor: new THREE.Color('#1e40af'),
    uDeepColor: new THREE.Color('#0c2461'),
    uFoamColor: new THREE.Color('#ffffff'),
    uWaveHeight: 0.08,
    uWaveFrequency: 0.5,
    uWaveSpeed: 1.5,
    uFlowSpeed: 0.15,
    uFresnelPower: 2.5,
    uOpacity: 0.85,
  },
  waterVertexShader,
  waterFragmentShader
);

// Extend Three.js with our custom material
extend({ WaterShaderMaterial });

// Type for the shader material props in JSX
type WaterShaderMaterialProps = React.JSX.IntrinsicElements['shaderMaterial'] & Partial<WaterMaterialUniforms>;

// Add type declaration for R3F JSX
declare module '@react-three/fiber' {
  interface ThreeElements {
    waterShaderMaterial: WaterShaderMaterialProps;
  }
}

/**
 * Water Material Props
 */
export interface WaterMaterialProps {
  /** Primary water color (from biome) */
  waterColor?: string;
  /** Deeper water color for depth variation */
  deepColor?: string;
  /** Foam/highlight color for fresnel edges */
  foamColor?: string;
  /** Wave height for vertex displacement (default: 0.08) */
  waveHeight?: number;
  /** Wave frequency for ripple density (default: 0.5) */
  waveFrequency?: number;
  /** Wave animation speed (default: 1.5) */
  waveSpeed?: number;
  /** Flow animation speed (default: 0.15) */
  flowSpeed?: number;
  /** Fresnel power for edge brightness (default: 2.5) */
  fresnelPower?: number;
  /** Material opacity (default: 0.85) */
  opacity?: number;
}

/**
 * Animated Water Material Component
 *
 * Use this component as a child of a mesh to apply the water shader.
 * Automatically animates based on the render loop.
 *
 * @example
 * ```tsx
 * <mesh rotation={[-Math.PI / 2, 0, 0]}>
 *   <planeGeometry args={[8, 50, 32, 32]} />
 *   <AnimatedWaterMaterial waterColor="#1e40af" />
 * </mesh>
 * ```
 */
export function AnimatedWaterMaterial({
  waterColor = '#1e40af',
  deepColor,
  foamColor = '#ffffff',
  waveHeight = 0.08,
  waveFrequency = 0.5,
  waveSpeed = 1.5,
  flowSpeed = 0.15,
  fresnelPower = 2.5,
  opacity = 0.85,
}: WaterMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Compute deep color from water color if not provided
  const computedDeepColor = useMemo(() => {
    if (deepColor) return deepColor;
    // Darken the water color for depth
    const color = new THREE.Color(waterColor);
    color.multiplyScalar(0.5);
    return `#${color.getHexString()}`;
  }, [waterColor, deepColor]);

  // Memoize color objects to avoid recreating every frame
  const colors = useMemo(
    () => ({
      water: new THREE.Color(waterColor),
      deep: new THREE.Color(computedDeepColor),
      foam: new THREE.Color(foamColor),
    }),
    [waterColor, computedDeepColor, foamColor]
  );

  // Update time uniform each frame for animation
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <waterShaderMaterial
      ref={materialRef}
      key={WaterShaderMaterial.key}
      uTime={0}
      uWaterColor={colors.water}
      uDeepColor={colors.deep}
      uFoamColor={colors.foam}
      uWaveHeight={waveHeight}
      uWaveFrequency={waveFrequency}
      uWaveSpeed={waveSpeed}
      uFlowSpeed={flowSpeed}
      uFresnelPower={fresnelPower}
      uOpacity={opacity}
      transparent
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

export { WaterShaderMaterial };
