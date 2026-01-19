/**
 * Asset Manifest Schema
 *
 * Declarative manifest format for defining asset generation pipelines.
 * Each asset has a manifest.json that tracks generation state for idempotency.
 */

import { z } from 'zod';

// ============================================================================
// TASK STATE SCHEMAS
// ============================================================================

export const TaskStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'CANCELED']);

/**
 * Generic task state record
 */
export const TaskStateSchema = z.object({
  taskId: z.string().optional(),
  status: TaskStatusSchema,
  progress: z.number().optional(),
  startedAt: z.number().optional(),
  completedAt: z.number().optional(),
  error: z.string().optional(),
  outputs: z.record(z.string(), z.string()).optional(),
});

// ============================================================================
// TEXT-TO-3D TASK CONFIGS
// ============================================================================

/**
 * Text-to-3D Preview Task Configuration
 * @see https://docs.meshy.ai/en/api/text-to-3d
 */
export const TextTo3DPreviewTaskSchema = z.object({
  /** Object description, max 600 characters */
  prompt: z.string().max(600),

  /** Negative prompt - what to avoid */
  negativePrompt: z.string().max(600).optional(),

  /** Art style: 'realistic' or 'sculpture' (NOT 'pbr' or 'cartoon') */
  artStyle: z.enum(['realistic', 'sculpture']).default('sculpture'),

  /** Mesh topology */
  topology: z.enum(['quad', 'triangle']).default('quad'),

  /** Target polygon count (100-300,000) */
  targetPolycount: z.number().min(100).max(300000).default(5000),

  /** Symmetry mode */
  symmetryMode: z.enum(['off', 'auto', 'on']).default('auto'),
});

/**
 * Text-to-3D Refine Task Configuration
 * This step adds textures to the preview model
 */
export const TextTo3DRefineTaskSchema = z.object({
  /** Enable PBR maps (metallic, roughness, normal) */
  enablePbr: z.boolean().default(true),

  /** Texturing guidance, max 600 characters */
  texturePrompt: z.string().max(600).optional(),
});

// ============================================================================
// ASSET MANIFEST
// ============================================================================

/**
 * Main Asset Manifest Schema
 *
 * Each asset directory contains a manifest.json that declares:
 * 1. Asset metadata (id, name, type, description)
 * 2. Task configurations for each pipeline step
 * 3. Task execution state (populated by content-gen)
 */
export const AssetManifestSchema = z.object({
  // --- Metadata ---
  id: z.string(),
  name: z.string(),
  type: z.enum(['player', 'obstacle', 'collectible', 'decoration']),
  description: z.string(),

  /** Pipeline to use: 'prop' for text-to-3d with textures */
  pipeline: z.enum(['prop']).default('prop'),

  /** Seed for reproducible generation (auto-generated if not provided) */
  seed: z.number().int().optional(),

  // --- Task Configurations ---
  textTo3DPreviewTask: TextTo3DPreviewTaskSchema.optional(),
  textTo3DRefineTask: TextTo3DRefineTaskSchema.optional(),

  // --- Task Execution State ---
  tasks: z.object({
    'text-to-3d-preview': TaskStateSchema.optional(),
    'text-to-3d-refine': TaskStateSchema.optional(),
  }).default({}),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskState = z.infer<typeof TaskStateSchema>;
export type TextTo3DPreviewTask = z.infer<typeof TextTo3DPreviewTaskSchema>;
export type TextTo3DRefineTask = z.infer<typeof TextTo3DRefineTaskSchema>;
export type AssetManifest = z.infer<typeof AssetManifestSchema>;

/**
 * Parse and validate an asset manifest
 */
export function parseManifest(data: unknown): AssetManifest {
  return AssetManifestSchema.parse(data);
}

/**
 * Create a new asset manifest with defaults
 */
export function createManifest(
  id: string,
  name: string,
  type: AssetManifest['type'],
  description: string,
  previewTask: TextTo3DPreviewTask,
  refineTask?: TextTo3DRefineTask
): AssetManifest {
  return {
    id,
    name,
    type,
    description,
    pipeline: 'prop',
    textTo3DPreviewTask: previewTask,
    textTo3DRefineTask: refineTask ?? { enablePbr: true },
    tasks: {},
  };
}
