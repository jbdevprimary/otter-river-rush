/**
 * Rendering components
 *
 * React Three Fiber components for 3D rendering:
 * - GameCanvas: Main R3F Canvas wrapper with scene setup
 * - EntityRenderer: Renders ECS entities as GLB models
 * - RiverEnvironment: Environment with water, terrain, lighting
 * - GameLoop: Fixed timestep game loop component
 * - WeatherEffects: Biome-specific particle weather effects
 */

export { EntityRenderer } from './EntityRenderer';
export { GameCanvas, type GameCanvasProps } from './GameCanvas';
export { GameLoop, useGameLoop, type GameLoopProps } from './GameLoop';
export { RiverEnvironment } from './RiverEnvironment';
export {
  WeatherEffects,
  RainStreaks,
  BiomeWeather,
} from './WeatherEffects';
