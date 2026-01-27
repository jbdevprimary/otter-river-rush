/**
 * FloatingText Component - Cross-platform React Native/Web
 * Displays animated floating text effects for game events like near-misses
 * Uses NativeWind styling with inline styles for dynamic positioning
 */

import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

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
      const easeOut = 1 - (1 - progress) ** 3;

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

  return (
    <View
      className="absolute"
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        transform: [{ translateX: -50 }, { translateY: translateY - 50 }, { scale: scale }],
        opacity,
      }}
    >
      <Text
        className="text-2xl font-bold font-mono"
        style={{
          color: item.color ?? '#ffeb3b',
          textShadowColor: 'rgba(0, 0, 0, 0.8)',
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 4,
        }}
      >
        {item.text}
      </Text>
    </View>
  );
}

export function FloatingText({ items, onComplete }: FloatingTextProps) {
  return (
    <View className="absolute inset-0 pointer-events-none z-[200] overflow-hidden">
      {items.map((item) => (
        <FloatingTextItemComponent key={item.id} item={item} onComplete={onComplete} />
      ))}
    </View>
  );
}
