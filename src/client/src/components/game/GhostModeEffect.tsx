import { queries } from '../../ecs/world';
import { useFrame } from '@react-three/fiber';

export function GhostModeEffect() {
  useFrame(() => {
    const [player] = queries.player.entities;
    if (!player) return;
    
    // Apply ghost shader effect to player's three object
    if (player.three && player.ghost) {
      player.three.traverse((child: any) => {
        if (child.isMesh && child.material) {
          child.material.opacity = 0.5;
          child.material.transparent = true;
          child.material.emissive?.setHex(0x9333ea);
          child.material.emissiveIntensity = 0.3;
        }
      });
    } else if (player.three && !player.ghost) {
      // Reset to normal
      player.three.traverse((child: any) => {
        if (child.isMesh && child.material) {
          child.material.opacity = 1.0;
          child.material.transparent = false;
          child.material.emissiveIntensity = 0;
        }
      });
    }
  });
  
  return null;
}
