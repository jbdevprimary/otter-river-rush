/**
 * Weather Effects Component
 * Biome-specific particle weather effects using R3F
 *
 * Weather types:
 * - Forest: Light rain (occasional vertical streaks)
 * - Canyon: Dust/sand (horizontal drift)
 * - Arctic: Snow particles (slow falling dots)
 * - Tropical: Flower petals (gentle floating)
 * - Volcanic: Embers/ash (rising particles)
 *
 * Performance: Limits particle count for mobile (200-500 max)
 * Accessibility: Respects reducedMotion setting
 */

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { BiomeType } from '../../../game/types';

/**
 * Weather configuration per biome
 */
interface WeatherConfig {
  particleCount: number;
  color: string;
  opacity: number;
  size: number;
  speed: { x: number; y: number; z: number };
  spread: { x: number; y: number; z: number };
  turbulence: number;
  active: boolean;
  /** Whether particles rise (true) or fall (false) */
  rising?: boolean;
}

const WEATHER_CONFIGS: Record<BiomeType, WeatherConfig> = {
  forest: {
    particleCount: 150,
    color: '#a0c4ff',
    opacity: 0.6,
    size: 0.03,
    speed: { x: 0.2, y: -3, z: 0 },
    spread: { x: 12, y: 20, z: 8 },
    turbulence: 0.1,
    active: true,
  },
  canyon: {
    particleCount: 100,
    color: '#d4a574',
    opacity: 0.5,
    size: 0.05,
    speed: { x: 2, y: -0.3, z: 0.5 },
    spread: { x: 15, y: 20, z: 8 },
    turbulence: 0.5,
    active: true,
  },
  arctic: {
    particleCount: 200,
    color: '#ffffff',
    opacity: 0.8,
    size: 0.08,
    speed: { x: 0.5, y: -0.8, z: 0.3 },
    spread: { x: 15, y: 25, z: 10 },
    turbulence: 0.3,
    active: true,
  },
  tropical: {
    particleCount: 80,
    color: '#ff69b4',
    opacity: 0.7,
    size: 0.1,
    speed: { x: 0.8, y: -1.2, z: 0.4 },
    spread: { x: 14, y: 22, z: 9 },
    turbulence: 0.6,
    active: true,
  },
  volcanic: {
    particleCount: 250,
    color: '#ff4500',
    opacity: 0.8,
    size: 0.06,
    speed: { x: 0.3, y: 2, z: 0.2 },
    spread: { x: 12, y: 18, z: 8 },
    turbulence: 0.8,
    active: true,
    rising: true,
  },
};

/**
 * Maximum particle count for performance (mobile-friendly)
 */
const MAX_PARTICLES = 500;

const FALLING_RESET_Y = -10;

function getParticleCount(config: WeatherConfig, intensity: number): number {
  return Math.min(Math.round(config.particleCount * intensity), MAX_PARTICLES);
}

function createParticleBuffers(config: WeatherConfig, particleCount: number) {
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const x = (Math.random() - 0.5) * config.spread.x;
    const y = Math.random() * config.spread.y - 5;
    const z = Math.random() * config.spread.z + 5;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    velocities[i3] = config.speed.x + (Math.random() - 0.5) * config.turbulence;
    velocities[i3 + 1] = config.speed.y + (Math.random() - 0.5) * config.turbulence;
    velocities[i3 + 2] = config.speed.z + (Math.random() - 0.5) * config.turbulence;
  }

  return { positions, velocities };
}

function applyParticleTurbulence(
  positions: Float32Array,
  index: number,
  config: WeatherConfig,
  delta: number
): void {
  if (config.turbulence <= 0) return;
  const i3 = index * 3;
  const time = Date.now() * 0.001;
  positions[i3] += Math.sin(time + index * 0.1) * config.turbulence * delta;
  positions[i3 + 2] += Math.cos(time + index * 0.15) * config.turbulence * delta;
}

function isParticleOutOfBounds(
  positions: Float32Array,
  index: number,
  config: WeatherConfig
): boolean {
  const i3 = index * 3;
  const isRising = config.rising === true;
  const y = positions[i3 + 1];
  const x = positions[i3];
  const z = positions[i3 + 2];

  const outOfBoundsY = isRising ? y > config.spread.y : y < FALLING_RESET_Y;
  const outOfBoundsX = Math.abs(x) > config.spread.x / 2 + 2;
  const outOfBoundsZ = z < 0 || z > config.spread.z + 10;

  return outOfBoundsY || outOfBoundsX || outOfBoundsZ;
}

function respawnParticle(
  positions: Float32Array,
  velocities: Float32Array,
  index: number,
  config: WeatherConfig
): void {
  const i3 = index * 3;
  const isRising = config.rising === true;

  positions[i3] = (Math.random() - 0.5) * config.spread.x;
  positions[i3 + 1] = isRising ? -2 : config.spread.y - 5;
  positions[i3 + 2] = Math.random() * config.spread.z + 5;

  velocities[i3] = config.speed.x + (Math.random() - 0.5) * config.turbulence;
  velocities[i3 + 1] = config.speed.y + (Math.random() - 0.5) * config.turbulence;
  velocities[i3 + 2] = config.speed.z + (Math.random() - 0.5) * config.turbulence;
}

function updateParticles(
  positions: Float32Array,
  velocities: Float32Array,
  config: WeatherConfig,
  delta: number
): void {
  const particleCount = positions.length / 3;

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] += velocities[i3] * delta;
    positions[i3 + 1] += velocities[i3 + 1] * delta;
    positions[i3 + 2] += velocities[i3 + 2] * delta;

    applyParticleTurbulence(positions, i, config, delta);

    if (isParticleOutOfBounds(positions, i, config)) {
      respawnParticle(positions, velocities, i, config);
    }
  }
}

interface WeatherEffectsProps {
  biome: BiomeType;
  reducedMotion?: boolean;
  intensity?: number; // 0-1 multiplier for effect intensity
}

export function WeatherEffects({
  biome,
  reducedMotion = false,
  intensity = 1,
}: WeatherEffectsProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const config = WEATHER_CONFIGS[biome];
  const isActive = !reducedMotion && config.active && intensity > 0;

  // Calculate effective particle count based on intensity
  const particleCount = isActive ? getParticleCount(config, intensity) : 0;

  // Create particle positions and velocities
  const { positions, velocities } = useMemo(() => {
    return createParticleBuffers(config, particleCount);
  }, [config, particleCount]);

  // Animation loop for particle movement
  useFrame((_, delta) => {
    if (!pointsRef.current || !isActive) return;

    const positionAttr = pointsRef.current.geometry.attributes.position;
    const posArray = positionAttr.array as Float32Array;
    updateParticles(posArray, velocities, config, delta);

    positionAttr.needsUpdate = true;
  });

  // Create buffer geometry with positions
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  if (!isActive) {
    return null;
  }

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color={config.color}
        size={config.size * intensity}
        transparent
        opacity={config.opacity * intensity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Rain-specific effect for forest biome
 * Creates vertical streak effect for more realistic rain
 */
interface RainStreaksProps {
  intensity?: number;
  reducedMotion?: boolean;
}

function createRainBuffers(lineCount: number) {
  const positions = new Float32Array(lineCount * 6);
  const velocities = new Float32Array(lineCount);

  for (let i = 0; i < lineCount; i++) {
    const i6 = i * 6;
    const x = (Math.random() - 0.5) * 12;
    const y = Math.random() * 20 - 5;
    const z = Math.random() * 8 + 5;
    const streakLength = 0.3 + Math.random() * 0.2;

    positions[i6] = x;
    positions[i6 + 1] = y;
    positions[i6 + 2] = z;
    positions[i6 + 3] = x + 0.05;
    positions[i6 + 4] = y - streakLength;
    positions[i6 + 5] = z;

    velocities[i] = 8 + Math.random() * 4;
  }

  return { positions, velocities };
}

function respawnRainStreak(positions: Float32Array, index: number): void {
  const i6 = index * 6;
  const x = (Math.random() - 0.5) * 12;
  const y = 15 + Math.random() * 5;
  const z = Math.random() * 8 + 5;
  const streakLength = 0.3 + Math.random() * 0.2;

  positions[i6] = x;
  positions[i6 + 1] = y;
  positions[i6 + 2] = z;
  positions[i6 + 3] = x + 0.05;
  positions[i6 + 4] = y - streakLength;
  positions[i6 + 5] = z;
}

function updateRainStreaks(positions: Float32Array, velocities: Float32Array, delta: number): void {
  const lineCount = velocities.length;
  for (let i = 0; i < lineCount; i++) {
    const i6 = i * 6;
    const fallDist = velocities[i] * delta;
    positions[i6 + 1] -= fallDist;
    positions[i6 + 4] -= fallDist;

    if (positions[i6 + 1] < FALLING_RESET_Y) {
      respawnRainStreak(positions, i);
    }
  }
}

export function RainStreaks({ intensity = 1, reducedMotion = false }: RainStreaksProps) {
  const linesRef = useRef<THREE.LineSegments>(null);
  const isActive = !reducedMotion && intensity > 0;
  const lineCount = isActive ? Math.min(Math.round(80 * intensity), 150) : 0;

  const { positions, velocities } = useMemo(() => {
    return createRainBuffers(lineCount);
  }, [lineCount]);

  useFrame((_, delta) => {
    if (!linesRef.current || !isActive) return;

    const positionAttr = linesRef.current.geometry.attributes.position;
    const posArray = positionAttr.array as Float32Array;
    updateRainStreaks(posArray, velocities, delta);

    positionAttr.needsUpdate = true;
  });

  // Create buffer geometry with positions for line segments
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  if (!isActive) {
    return null;
  }

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color="#a0c4ff" transparent opacity={0.4 * intensity} linewidth={1} />
    </lineSegments>
  );
}

/**
 * Combined weather component that renders appropriate effects based on biome
 */
interface BiomeWeatherProps {
  biome: BiomeType;
  biomeProgress?: number; // For transition effects
  reducedMotion?: boolean;
  particleQuality?: 'low' | 'medium' | 'high';
}

export function BiomeWeather({
  biome,
  biomeProgress = 0,
  reducedMotion = false,
  particleQuality = 'medium',
}: BiomeWeatherProps) {
  // Skip all weather if reduced motion is enabled
  if (reducedMotion) {
    return null;
  }

  // Calculate intensity based on quality setting
  const qualityMultiplier = particleQuality === 'low' ? 0.5 : particleQuality === 'high' ? 1 : 0.75;

  // Fade out current biome weather as we transition, fade in next
  const currentIntensity = 1 - biomeProgress * 0.5;
  const effectiveIntensity = currentIntensity * qualityMultiplier;

  return (
    <group>
      {/* Base particle weather for all biomes */}
      <WeatherEffects biome={biome} intensity={effectiveIntensity} reducedMotion={reducedMotion} />

      {/* Additional rain streaks for forest */}
      {biome === 'forest' && (
        <RainStreaks intensity={effectiveIntensity} reducedMotion={reducedMotion} />
      )}
    </group>
  );
}

export default BiomeWeather;
