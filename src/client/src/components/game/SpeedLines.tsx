import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore } from '../../hooks/useGameStore';

export function SpeedLines() {
  const { status, distance } = useGameStore();
  
  const lines = useMemo(() => {
    const lineCount = 20;
    const result = [];
    
    for (let i = 0; i < lineCount; i++) {
      const angle = (Math.PI * 2 * i) / lineCount;
      const radius = 8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      result.push({
        start: new Vector3(x, 10, z),
        end: new Vector3(x, -10, z),
        offset: Math.random() * 10,
      });
    }
    
    return result;
  }, []);
  
  const speed = Math.min(distance / 100, 2);
  const opacity = Math.min(speed / 2, 0.3);
  
  if (status !== 'playing' || speed < 0.5) return null;
  
  return (
    <group>
      {lines.map((line, i) => (
        <Line
          key={i}
          points={[line.start, line.end]}
          color="#ffffff"
          lineWidth={1}
          transparent
          opacity={opacity}
        />
      ))}
    </group>
  );
}

function Line({ points, color, lineWidth, transparent, opacity }: any) {
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p: Vector3) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial 
        color={color} 
        linewidth={lineWidth} 
        transparent={transparent} 
        opacity={opacity} 
      />
    </line>
  );
}
