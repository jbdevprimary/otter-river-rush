import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useGameStore } from '../../hooks/useGameStore';

export function VisualEffects() {
  const { status } = useGameStore();
  
  return (
    <EffectComposer>
      <Bloom 
        intensity={status === 'playing' ? 0.5 : 0.3} 
        luminanceThreshold={0.9} 
        luminanceSmoothing={0.9}
      />
      <Vignette 
        offset={0.3} 
        darkness={0.5}
      />
    </EffectComposer>
  );
}
