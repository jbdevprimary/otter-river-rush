import React, { useEffect, useRef } from 'react';
import nipplejs from 'nipplejs';
import type { JoystickManager, EventData } from 'nipplejs';

/**
 * VirtualJoystick Component
 * Provides a visual joystick for mobile/touch devices
 * Uses nipplejs for smooth, responsive controls
 */

interface VirtualJoystickProps {
  onMove?: (direction: 'left' | 'right') => void;
  enabled?: boolean;
}

export function VirtualJoystick({
  onMove,
  enabled = true,
}: VirtualJoystickProps): React.JSX.Element {
  const joystickRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<JoystickManager | null>(null);

  useEffect(() => {
    if (!joystickRef.current || !enabled) return;

    // Create joystick
    const manager = nipplejs.create({
      zone: joystickRef.current,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: '#3b82f6', // Blue color matching theme
      size: 120,
      threshold: 0.2, // Sensitivity
      fadeTime: 200,
    });

    managerRef.current = manager;

    // Track the last direction to avoid spam
    let lastDirection: 'left' | 'right' | null = null;

    // Handle joystick move
    manager.on('move', (evt: unknown, data: EventData) => {
      if (!data.angle) return;

      const angle = data.angle.degree;

      // Determine direction based on angle
      // 0° = right, 90° = up, 180° = left, 270° = down
      // We only care about left/right for lane switching

      let direction: 'left' | 'right' | null = null;

      // Right: 315° - 45° (or -45° to 45°)
      if ((angle >= 315 && angle <= 360) || (angle >= 0 && angle < 45)) {
        direction = 'right';
      }
      // Left: 135° - 225°
      else if (angle >= 135 && angle <= 225) {
        direction = 'left';
      }

      // Only trigger if direction changed
      if (direction && direction !== lastDirection) {
        lastDirection = direction;
        onMove?.(direction);
      }
    });

    // Reset on release
    manager.on('end', () => {
      lastDirection = null;
    });

    // Cleanup
    return () => {
      manager.destroy();
      managerRef.current = null;
    };
  }, [enabled, onMove]);

  // Only show on touch devices
  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  if (!isTouchDevice || !enabled) {
    return <></>;
  }

  return (
    <div className="fixed bottom-8 left-8 z-50 pointer-events-auto">
      <div
        ref={joystickRef}
        className="relative w-32 h-32 opacity-60 hover:opacity-80 transition-opacity"
        style={{
          touchAction: 'none', // Prevent page scroll
        }}
      />
      {/* Helper text */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs whitespace-nowrap">
        Swipe to move
      </div>
    </div>
  );
}
