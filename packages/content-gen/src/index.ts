/**
 * Otter River Rush Content Generation
 *
 * Uses Meshy AI to generate 3D game assets from text prompts.
 */

export { MeshyClient, MeshyApiError, RateLimitError, AuthenticationError } from './api/meshy-client';
export { TaskExecutor } from './tasks/executor';
export { taskRegistry } from './tasks/registry';
export type {
  TaskDefinition,
  TaskInputDef,
  TaskOutputDef,
  TaskContext,
  TaskRecord,
  TaskState,
  GameAssetType,
  AssetManifest,
  AssetEntry,
} from './tasks/types';
export {
  ALL_PROMPTS,
  PLAYER_PROMPTS,
  OBSTACLE_PROMPTS,
  COLLECTIBLE_PROMPTS,
  DECORATION_PROMPTS,
  getPromptById,
  getPromptsByCategory,
} from './assets/prompts';
export type { AssetPrompt } from './assets/prompts';
