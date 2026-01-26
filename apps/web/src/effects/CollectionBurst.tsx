/**
 * Collection Burst Effect Component
 * Creates a particle burst when collecting coins or gems
 *
 * This component manages a pool of burst effects that can be triggered
 * from game events.
 */

import { useRef, useMemo, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BurstParticle {
  active: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
  size: number;
}

interface ActiveBurst {
  particles: BurstParticle[];
  startTime: number;
}

export interface CollectionBurstRef {
  /** Trigger a burst at the specified position */
  burst: (x: number, y: number, z: number, type: 'coin' | 'gem') => void;
}

interface CollectionBurstProps {
  /** Maximum concurrent bursts */
  maxBursts?: number;
  /** Particles per burst */
  particlesPerBurst?: number;
  /** Whether to respect reduced motion preference */
  reducedMotion?: boolean;
}

export const CollectionBurst = forwardRef<CollectionBurstRef, CollectionBurstProps>(
  function CollectionBurst(
    { maxBursts = 5, particlesPerBurst = 16, reducedMotion = false },
    ref
  ) {
    const burstsRef = useRef<ActiveBurst[]>([]);
    const meshRef = useRef<THREE.Points>(null);

    // Color palettes
    const coinColors = useMemo(
      () => [
        new THREE.Color('#ffd700'), // Gold
        new THREE.Color('#ffeb3b'), // Yellow
        new THREE.Color('#ffc107'), // Amber
        new THREE.Color('#fff176'), // Light yellow
      ],
      []
    );

    const gemColors = useMemo(
      () => [
        new THREE.Color('#ff1493'), // Deep pink
        new THREE.Color('#e91e63'), // Pink
        new THREE.Color('#9c27b0'), // Purple
        new THREE.Color('#ff4081'), // Pink accent
      ],
      []
    );

    // Total particles across all possible bursts
    const totalParticles = maxBursts * particlesPerBurst;

    // Create geometry
    const geometry = useMemo(() => {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(totalParticles * 3);
      const colors = new Float32Array(totalParticles * 3);
      const sizes = new Float32Array(totalParticles);

      // Initialize all particles as hidden
      for (let i = 0; i < totalParticles; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = -100; // Hidden below scene
        positions[i * 3 + 2] = 0;
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
        sizes[i] = 0;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      return geo;
    }, [totalParticles]);

    // Shader material for particles
    const material = useMemo(() => {
      return new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
      });
    }, []);

    // Create a new burst
    const createBurst = useCallback(
      (x: number, y: number, z: number, type: 'coin' | 'gem'): ActiveBurst => {
        const particles: BurstParticle[] = [];
        const palette = type === 'coin' ? coinColors : gemColors;

        for (let i = 0; i < particlesPerBurst; i++) {
          // Random direction in a sphere
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const speed = 2 + Math.random() * 3;

          particles.push({
            active: true,
            position: new THREE.Vector3(x, y, z),
            velocity: new THREE.Vector3(
              Math.sin(phi) * Math.cos(theta) * speed,
              Math.sin(phi) * Math.sin(theta) * speed + 1, // Bias upward
              Math.cos(phi) * speed * 0.5
            ),
            life: 1.0,
            maxLife: 0.5 + Math.random() * 0.3, // 0.5-0.8 seconds
            color: palette[Math.floor(Math.random() * palette.length)].clone(),
            size: 0.1 + Math.random() * 0.15,
          });
        }

        return {
          particles,
          startTime: Date.now(),
        };
      },
      [coinColors, gemColors, particlesPerBurst]
    );

    // Expose burst method via ref
    useImperativeHandle(
      ref,
      () => ({
        burst: (x: number, y: number, z: number, type: 'coin' | 'gem') => {
          if (reducedMotion) return;

          // Convert game coordinates to Three.js coordinates
          // Game (x, y, z) -> Three.js (x, z, y)
          const threeX = x;
          const threeY = z; // Game Z -> Three.js Y (height)
          const threeZ = y; // Game Y -> Three.js Z (depth)

          // Remove oldest burst if at capacity
          if (burstsRef.current.length >= maxBursts) {
            burstsRef.current.shift();
          }

          burstsRef.current.push(createBurst(threeX, threeY, threeZ, type));
        },
      }),
      [createBurst, maxBursts, reducedMotion]
    );

    // Update particles each frame
    useFrame((_, delta) => {
      if (reducedMotion) return;

      const positions = geometry.attributes.position.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;
      const sizes = geometry.attributes.size.array as Float32Array;

      let particleIndex = 0;

      // Update all bursts
      burstsRef.current = burstsRef.current.filter((burst) => {
        let hasActiveParticles = false;

        burst.particles.forEach((particle) => {
          if (!particle.active) return;

          // Update life
          particle.life -= delta / particle.maxLife;

          if (particle.life <= 0) {
            particle.active = false;
            return;
          }

          hasActiveParticles = true;

          // Update physics
          particle.velocity.y -= 5 * delta; // Gravity
          particle.position.add(particle.velocity.clone().multiplyScalar(delta));

          // Update buffer
          if (particleIndex < totalParticles) {
            const alpha = particle.life;
            positions[particleIndex * 3] = particle.position.x;
            positions[particleIndex * 3 + 1] = particle.position.y;
            positions[particleIndex * 3 + 2] = particle.position.z;
            colors[particleIndex * 3] = particle.color.r * alpha;
            colors[particleIndex * 3 + 1] = particle.color.g * alpha;
            colors[particleIndex * 3 + 2] = particle.color.b * alpha;
            sizes[particleIndex] = particle.size * (0.5 + alpha * 0.5);
            particleIndex++;
          }
        });

        return hasActiveParticles;
      });

      // Hide remaining particles
      for (let i = particleIndex; i < totalParticles; i++) {
        positions[i * 3 + 1] = -100;
        sizes[i] = 0;
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;
    });

    if (reducedMotion) return null;

    return <points ref={meshRef} geometry={geometry} material={material} />;
  }
);
