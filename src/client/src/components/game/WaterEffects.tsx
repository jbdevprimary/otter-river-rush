import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { useBiome } from '../../ecs/biome-system';
import { useGameStore } from '../../hooks/useGameStore';

export function WaterEffects() {
  const meshRef = useRef<Mesh>(null);
  const { status } = useGameStore();
  const biome = useBiome();
  
  useFrame((_, dt) => {
    if (!meshRef.current || status !== 'playing') return;
    
    // Animate water
    const material = meshRef.current.material as any;
    if (material.uniforms) {
      material.uniforms.time.value += dt;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, -0.5, -1]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 30, 32, 32]} />
      <shaderMaterial
        uniforms={{
          time: { value: 0 },
          color: { value: [0.1, 0.2, 0.7] },
        }}
        vertexShader={`
          uniform float time;
          varying vec2 vUv;
          varying float vWave;
          
          void main() {
            vUv = uv;
            vec3 pos = position;
            
            float wave1 = sin(pos.x * 2.0 + time) * 0.1;
            float wave2 = sin(pos.y * 3.0 + time * 0.5) * 0.05;
            pos.z += wave1 + wave2;
            
            vWave = wave1 + wave2;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          varying vec2 vUv;
          varying float vWave;
          
          void main() {
            vec3 waterColor = color + vec3(vWave * 0.2);
            gl_FragColor = vec4(waterColor, 0.9);
          }
        `}
        transparent
      />
    </mesh>
  );
}
