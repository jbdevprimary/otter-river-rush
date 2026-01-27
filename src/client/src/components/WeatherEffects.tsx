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

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BiomeType } from '../../../../game/types';

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

  // Skip rendering if reduced motion is enabled or weather is inactive
  if (reducedMotion || !config.active) {
    return null;
  }

  // Calculate effective particle count based on intensity
  const particleCount = Math.min(
    Math.round(config.particleCount * intensity),
    MAX_PARTICLES
  );

  // Create particle positions and velocities
  const { positions, velocities } = useMemo(() => {
    const posArray = new Float32Array(particleCount * 3);
    const velArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Random position within spread volume
      const x = (Math.random() - 0.5) * config.spread.x;
      const y = Math.random() * config.spread.y - 5; // Start above and extend down
      const z = Math.random() * config.spread.z + 5; // In front of camera

      posArray[i3] = x;
      posArray[i3 + 1] = y;
      posArray[i3 + 2] = z;

      // Base velocity with some randomization
      velArray[i3] = config.speed.x + (Math.random() - 0.5) * config.turbulence;
      velArray[i3 + 1] = config.speed.y + (Math.random() - 0.5) * config.turbulence;
      velArray[i3 + 2] = config.speed.z + (Math.random() - 0.5) * config.turbulence;
    }

    return {
      positions: posArray,
      velocities: velArray,
    };
  }, [particleCount, config, biome]);

  // Animation loop for particle movement
  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const positionAttr = pointsRef.current.geometry.attributes.position;
    const posArray = positionAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Update position based on velocity
      posArray[i3] += velocities[i3] * delta;
      posArray[i3 + 1] += velocities[i3 + 1] * delta;
      posArray[i3 + 2] += velocities[i3 + 2] * delta;

      // Add turbulence/waviness based on biome
      if (config.turbulence > 0) {
        const time = Date.now() * 0.001;
        const turbX = Math.sin(time + i * 0.1) * config.turbulence * delta;
        const turbZ = Math.cos(time + i * 0.15) * config.turbulence * delta;
        posArray[i3] += turbX;
        posArray[i3 + 2] += turbZ;
      }

      // Respawn particles that go out of bounds
      const isRising = config.rising === true;
      const outOfBoundsY = isRising
        ? posArray[i3 + 1] > config.spread.y // Rising particles go upward
        : posArray[i3 + 1] < -10; // Falling particles go down

      const outOfBoundsX =
        Math.abs(posArray[i3]) > config.spread.x / 2 + 2;

      const outOfBoundsZ =
        posArray[i3 + 2] < 0 || posArray[i3 + 2] > config.spread.z + 10;

      if (outOfBoundsY || outOfBoundsX || outOfBoundsZ) {
        // Respawn at appropriate position based on biome
        posArray[i3] = (Math.random() - 0.5) * config.spread.x;

        if (isRising) {
          // Rising particles (volcanic embers) come from below
          posArray[i3 + 1] = -2;
        } else {
          // Falling particles (rain, snow, dust) start from above
          posArray[i3 + 1] = config.spread.y - 5;
        }

        posArray[i3 + 2] = Math.random() * config.spread.z + 5;

        // Reset velocity with new randomization
        velocities[i3] = config.speed.x + (Math.random() - 0.5) * config.turbulence;
        velocities[i3 + 1] = config.speed.y + (Math.random() - 0.5) * config.turbulence;
        velocities[i3 + 2] = config.speed.z + (Math.random() - 0.5) * config.turbulence;
      }
    }

    positionAttr.needsUpdate = true;
  });

  // Create buffer geometry with positions
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

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

export function RainStreaks({
  intensity = 1,
  reducedMotion = false,
}: RainStreaksProps) {
  const linesRef = useRef<THREE.LineSegments>(null);

  if (reducedMotion) return null;

  const lineCount = Math.min(Math.round(80 * intensity), 150);

  const { positions, velocities } = useMemo(() => {
    const posArray = new Float32Array(lineCount * 6); // 2 points per line, 3 coords each
    const velArray = new Float32Array(lineCount);

    for (let i = 0; i < lineCount; i++) {
      const i6 = i * 6;

      // Start point
      const x = (Math.random() - 0.5) * 12;
      const y = Math.random() * 20 - 5;
      const z = Math.random() * 8 + 5;

      // Rain streak length
      const streakLength = 0.3 + Math.random() * 0.2;

      posArray[i6] = x;
      posArray[i6 + 1] = y;
      posArray[i6 + 2] = z;

      posArray[i6 + 3] = x + 0.05; // Slight angle
      posArray[i6 + 4] = y - streakLength;
      posArray[i6 + 5] = z;

      velArray[i] = 8 + Math.random() * 4; // Fall speed
    }

    return { positions: posArray, velocities: velArray };
  }, [lineCount]);

  useFrame((_, delta) => {
    if (!linesRef.current) return;

    const positionAttr = linesRef.current.geometry.attributes.position;
    const posArray = positionAttr.array as Float32Array;

    for (let i = 0; i < lineCount; i++) {
      const i6 = i * 6;
      const fallDist = velocities[i] * delta;

      // Move both points down
      posArray[i6 + 1] -= fallDist;
      posArray[i6 + 4] -= fallDist;

      // Respawn if below screen
      if (posArray[i6 + 1] < -10) {
        const x = (Math.random() - 0.5) * 12;
        const y = 15 + Math.random() * 5;
        const z = Math.random() * 8 + 5;
        const streakLength = 0.3 + Math.random() * 0.2;

        posArray[i6] = x;
        posArray[i6 + 1] = y;
        posArray[i6 + 2] = z;
        posArray[i6 + 3] = x + 0.05;
        posArray[i6 + 4] = y - streakLength;
        posArray[i6 + 5] = z;
      }
    }

    positionAttr.needsUpdate = true;
  });

  // Create buffer geometry with positions for line segments
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial
        color="#a0c4ff"
        transparent
        opacity={0.4 * intensity}
        linewidth={1}
      />
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
  const qualityMultiplier =
    particleQuality === 'low' ? 0.5 : particleQuality === 'high' ? 1 : 0.75;

  // Fade out current biome weather as we transition, fade in next
  const currentIntensity = 1 - biomeProgress * 0.5;
  const effectiveIntensity = currentIntensity * qualityMultiplier;

  return (
    <group>
      {/* Base particle weather for all biomes */}
      <WeatherEffects
        biome={biome}
        intensity={effectiveIntensity}
        reducedMotion={reducedMotion}
      />

      {/* Additional rain streaks for forest */}
      {biome === 'forest' && (
        <RainStreaks
          intensity={effectiveIntensity}
          reducedMotion={reducedMotion}
        />
      )}
    </group>
  );
}

export default BiomeWeather;
