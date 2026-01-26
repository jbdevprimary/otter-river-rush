/**
 * Visual Effects Module
 *
 * Exports all visual effect components for the game:
 * - PlayerTrail: Fading trail behind the otter when moving
 * - SpeedLines: Radial lines from screen edges at high speeds
 * - CollectionBurst: Particle burst when collecting items
 * - ImpactFlash: Screen flash when taking damage
 */

export { PlayerTrail } from './PlayerTrail';
export { SpeedLines } from './SpeedLines';
export { CollectionBurst, type CollectionBurstRef } from './CollectionBurst';
export { ImpactFlash, type ImpactFlashRef } from './ImpactFlash';
