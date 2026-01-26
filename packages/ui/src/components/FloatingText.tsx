/**
 * FloatingText Component
 * Displays animated floating text effects for game events like near-misses
 */

import { useEffect, useState, type CSSProperties } from 'react';

export interface FloatingTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: string;
}

interface FloatingTextProps {
  items: FloatingTextItem[];
  onComplete: (id: string) => void;
}

const ANIMATION_DURATION = 1000; // milliseconds

const containerStyles: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 200,
  overflow: 'hidden',
};

interface FloatingTextItemComponentProps {
  item: FloatingTextItem;
  onComplete: (id: string) => void;
}

function FloatingTextItemComponent({ item, onComplete }: FloatingTextItemComponentProps) {
  const [opacity, setOpacity] = useState(1);
  const [translateY, setTranslateY] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // Animate over time
    const startTime = Date.now();
    let animationFrame: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

      // Ease out animation
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setOpacity(1 - easeOut);
      setTranslateY(-50 * easeOut); // Float upward 50px
      setScale(1 + 0.3 * easeOut); // Grow slightly

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        onComplete(item.id);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [item.id, onComplete]);

  const itemStyles: CSSProperties = {
    position: 'absolute',
    left: `${item.x}%`,
    top: `${item.y}%`,
    transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
    opacity,
    color: item.color ?? '#ffeb3b',
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(255, 235, 59, 0.5)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  return <div style={itemStyles}>{item.text}</div>;
}

export function FloatingText({ items, onComplete }: FloatingTextProps) {
  return (
    <div style={containerStyles}>
      {items.map((item) => (
        <FloatingTextItemComponent key={item.id} item={item} onComplete={onComplete} />
      ))}
    </div>
  );
}
