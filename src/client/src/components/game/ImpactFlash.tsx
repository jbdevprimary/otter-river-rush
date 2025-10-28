import { useEffect, useState } from 'react';
import { queries } from '../../ecs/world';

export function ImpactFlash() {
  const [flashing, setFlashing] = useState(false);
  
  useEffect(() => {
    const unsubscribe = queries.destroyed.onEntityAdded.subscribe((entity) => {
      if (entity.obstacle) {
        setFlashing(true);
        setTimeout(() => setFlashing(false), 100);
      }
    });
    
    return unsubscribe;
  }, []);
  
  if (!flashing) return null;
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none bg-red-500 opacity-30 z-40"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
