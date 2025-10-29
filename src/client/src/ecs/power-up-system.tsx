import { useFrame } from '@react-three/fiber';
import { queries, world, spawn } from './world';
import { useGameStore } from '../hooks/useGameStore';

export function PowerUpSystem() {
  const { status } = useGameStore();

  // Spawn power-ups
  useFrame((state) => {
    if (status !== 'playing') return;

    const time = state.clock.elapsedTime;

    // Spawn power-up every 15 seconds
    if (Math.floor(time / 15) > Math.floor((time - 0.016) / 15)) {
      const lanes = [-2, 0, 2];
      const lane = lanes[Math.floor(Math.random() * 3)];
      const powerUpTypes: Array<
        'shield' | 'magnet' | 'ghost' | 'multiplier' | 'slow_motion'
      > = ['shield', 'magnet', 'ghost', 'multiplier', 'slow_motion'];
      const type =
        powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

      world.add({
        powerUp: { type, duration: 5000 },
        position: { x: lane, y: 8, z: 0.2 },
        velocity: { x: 0, y: -5, z: 0 },
        collider: { width: 0.5, height: 0.5, depth: 0.5 },
      });
    }
  });

  // Handle power-up collection
  useFrame(() => {
    if (status !== 'playing') return;

    const [player] = queries.player.entities;
    if (!player) return;

    for (const powerUp of queries.powerUps) {
      if (checkAABB(player as any, powerUp as any)) {
        activatePowerUp(player, powerUp.powerUp!.type);
        world.addComponent(powerUp, 'collected', true);

        // Spawn particles
        for (let i = 0; i < 16; i++) {
          spawn.particle(powerUp.position.x, powerUp.position.y, '#fbbf24');
        }
      }
    }
  });

  // Deactivate expired power-ups
  useFrame(() => {
    const now = Date.now();
    const [player] = queries.player.entities;

    if (
      player &&
      (player as any).powerUpEndTime &&
      now > (player as any).powerUpEndTime
    ) {
      // Deactivate power-up
      delete (player as any).powerUpEndTime;
      if ((player as any).powerUpType === 'ghost') {
        world.removeComponent(player, 'ghost');
      }
    }
  });

  return null;
}

function checkAABB(a: any, b: any): boolean {
  if (!a.collider || !b.collider) return false;

  const aBox = {
    minX: a.position.x - a.collider.width / 2,
    maxX: a.position.x + a.collider.width / 2,
    minY: a.position.y - a.collider.height / 2,
    maxY: a.position.y + a.collider.height / 2,
  };

  const bBox = {
    minX: b.position.x - b.collider.width / 2,
    maxX: b.position.x + b.collider.width / 2,
    minY: b.position.y - b.collider.height / 2,
    maxY: b.position.y + b.collider.height / 2,
  };

  return (
    aBox.minX < bBox.maxX &&
    aBox.maxX > bBox.minX &&
    aBox.minY < bBox.maxY &&
    aBox.maxY > bBox.minY
  );
}

function activatePowerUp(player: any, type: string) {
  const { activatePowerUp } = useGameStore.getState();

  switch (type) {
    case 'shield':
      world.addComponent(player, 'invincible', true);
      (player as any).powerUpType = 'shield';
      (player as any).powerUpEndTime = Date.now() + 5000;
      break;
    case 'ghost':
      world.addComponent(player, 'ghost', true);
      (player as any).powerUpType = 'ghost';
      (player as any).powerUpEndTime = Date.now() + 5000;
      break;
    case 'magnet':
      // Magnet handled in spawner
      (player as any).magnetActive = true;
      (player as any).magnetEndTime = Date.now() + 8000;
      break;
    case 'multiplier':
      activatePowerUp('multiplier', 10000);
      break;
    case 'slow_motion':
      // Slow down obstacles
      for (const entity of queries.moving) {
        if (entity.obstacle || entity.collectible) {
          if (entity.velocity) {
            entity.velocity.y *= 0.5;
          }
        }
      }
      setTimeout(() => {
        for (const entity of queries.moving) {
          if (entity.velocity) {
            entity.velocity.y /= 0.5;
          }
        }
      }, 5000);
      break;
  }
}
