/**
 * Zod Validation Schemas
 * Placeholder - will be populated later
 */

import { z } from 'zod';

// Asset definition schema
export const AssetDefinitionSchema = z.object({
  path: z.string(),
  source: z.enum(['kenney', 'quaternius', 'ambientcg', 'meshy']),
  scale: z.number().optional(),
  value: z.number().optional(),
  loop: z.boolean().optional(),
});

export type AssetDefinitionValidated = z.infer<typeof AssetDefinitionSchema>;
