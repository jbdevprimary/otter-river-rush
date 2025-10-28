import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { queries } from '../../ecs/world';
import { useGameStore } from '../../hooks/useGameStore';

export function TrailEffect() {
  const trailPointsRef = useRef<Vector3[]>([]);
  const maxPoints = 20;
  const { status } = useGameStore();
  
  useFrame(() => {
    if (status !== 'playing') return;
    
    const [player] = queries.player.entities;
    if (!player) return;
    
    // Add current position to trail
    const newPoint = new Vector3(player.position.x, player.position.y, player.position.z);
    trailPointsRef.current.unshift(newPoint);
    
    // Remove old points
    if (trailPointsRef.current.length > maxPoints) {
      trailPointsRef.current = trailPointsRef.current.slice(0, maxPoints);
    }
  });
  
  const trailGeometry = useMemo(() => {
    const points = trailPointsRef.current.length > 0 ? trailPointsRef.current : [new Vector3(0, -3, 0)];
    return points;
  }, [trailPointsRef.current.length]);
  
  if (trailPointsRef.current.length < 2) return null;
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={trailPointsRef.current.length}
          array={new Float32Array(trailPointsRef.current.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#60a5fa" transparent opacity={0.5} linewidth={2} />
    </line>
  );
}
