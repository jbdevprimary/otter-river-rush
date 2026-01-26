/**
 * Speed Lines Effect Component
 * Creates radial speed lines from screen edges at high speeds
 *
 * Lines appear when speedMultiplier > 1.5 (i.e., 50% faster than base speed)
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpeedLine {
  /** Start position (at screen edge) */
  startX: number;
  startY: number;
  /** Direction toward center (normalized) */
  dirX: number;
  dirY: number;
  /** Current position along the line (0-1) */
  progress: number;
  /** Speed variation */
  speed: number;
  /** Length variation */
  length: number;
}

interface SpeedLinesProps {
  /** Current speed multiplier (1.0 = base speed) */
  speedMultiplier?: number;
  /** Threshold at which speed lines appear */
  threshold?: number;
  /** Number of speed lines */
  lineCount?: number;
  /** Whether to respect reduced motion preference */
  reducedMotion?: boolean;
  /** Whether the game is currently playing */
  isPlaying?: boolean;
}

export function SpeedLines({
  speedMultiplier = 1.0,
  threshold = 1.5,
  lineCount = 24,
  reducedMotion = false,
  isPlaying = false,
}: SpeedLinesProps) {
  const meshRef = useRef<THREE.LineSegments>(null);
  const linesRef = useRef<SpeedLine[]>([]);

  // Initialize lines
  const initializeLines = (): SpeedLine[] => {
    const lines: SpeedLine[] = [];
    for (let i = 0; i < lineCount; i++) {
      lines.push(createRandomLine());
    }
    return lines;
  };

  const createRandomLine = (): SpeedLine => {
    // Random position around screen edge
    const side = Math.floor(Math.random() * 4);
    let startX: number;
    let startY: number;

    // Distribute lines around edges
    switch (side) {
      case 0: // Top
        startX = (Math.random() - 0.5) * 20;
        startY = 8;
        break;
      case 1: // Right
        startX = 10;
        startY = (Math.random() - 0.5) * 16;
        break;
      case 2: // Bottom
        startX = (Math.random() - 0.5) * 20;
        startY = -8;
        break;
      default: // Left
        startX = -10;
        startY = (Math.random() - 0.5) * 16;
        break;
    }

    // Direction toward center with some randomization
    const toCenter = new THREE.Vector2(-startX, -startY).normalize();
    const angle = Math.atan2(toCenter.y, toCenter.x) + (Math.random() - 0.5) * 0.3;

    return {
      startX,
      startY,
      dirX: Math.cos(angle),
      dirY: Math.sin(angle),
      progress: Math.random(), // Start at random progress
      speed: 0.5 + Math.random() * 0.5,
      length: 1 + Math.random() * 2,
    };
  };

  // Create geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(lineCount * 6); // 2 points per line, 3 components each
    const colors = new Float32Array(lineCount * 6);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [lineCount]);

  // Material with vertex colors
  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((_, delta) => {
    if (!isPlaying || reducedMotion) return;

    // Only show lines above threshold
    const intensity = speedMultiplier > threshold ? (speedMultiplier - threshold) / (2 - threshold) : 0;
    if (intensity <= 0) {
      // Hide all lines
      const positions = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i++) {
        positions[i] = 0;
      }
      geometry.attributes.position.needsUpdate = true;
      return;
    }

    // Initialize lines if needed
    if (linesRef.current.length === 0) {
      linesRef.current = initializeLines();
    }

    const positions = geometry.attributes.position.array as Float32Array;
    const colors = geometry.attributes.color.array as Float32Array;

    // Update each line
    linesRef.current.forEach((line, i) => {
      // Move line along its direction
      line.progress += delta * line.speed * (1 + intensity);

      // Reset when line reaches center area
      if (line.progress > 1) {
        const newLine = createRandomLine();
        newLine.progress = 0;
        linesRef.current[i] = newLine;
        return;
      }

      // Calculate current position
      const progress = line.progress;
      const fadeIn = Math.min(progress * 3, 1);
      const fadeOut = 1 - Math.pow(progress, 2);
      const alpha = fadeIn * fadeOut * intensity;

      // Start point (further from center)
      const startDist = 8 * (1 - progress);
      const x1 = line.startX + line.dirX * startDist;
      const y1 = line.startY + line.dirY * startDist;

      // End point (closer to center)
      const endDist = startDist - line.length * (0.5 + intensity * 0.5);
      const x2 = line.startX + line.dirX * Math.max(endDist, 0);
      const y2 = line.startY + line.dirY * Math.max(endDist, 0);

      // Update positions
      // Position lines in front of camera
      const z = -5;
      positions[i * 6] = x1 * 0.5;
      positions[i * 6 + 1] = y1 * 0.5;
      positions[i * 6 + 2] = z;
      positions[i * 6 + 3] = x2 * 0.5;
      positions[i * 6 + 4] = y2 * 0.5;
      positions[i * 6 + 5] = z;

      // Update colors (white with alpha via intensity)
      const colorIntensity = alpha;
      colors[i * 6] = colorIntensity;
      colors[i * 6 + 1] = colorIntensity;
      colors[i * 6 + 2] = colorIntensity;
      colors[i * 6 + 3] = colorIntensity * 0.3; // Fade at tail
      colors[i * 6 + 4] = colorIntensity * 0.3;
      colors[i * 6 + 5] = colorIntensity * 0.3;
    });

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  });

  if (reducedMotion || speedMultiplier <= threshold) return null;

  return <lineSegments ref={meshRef} geometry={geometry} material={material} />;
}
