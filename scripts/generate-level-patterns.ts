#!/usr/bin/env node
/**
 * Level Pattern Generator - Uses Claude to generate obstacle patterns
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function generateLevelPatterns() {
  console.log('🗺️ Generating Level Patterns with Claude...');
  
  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-20250514'),
    prompt: `Design 15 challenging and varied obstacle patterns for "Otter River Rush", a 3-lane endless runner.

For each pattern, provide:
1. id, name, description
2. difficulty (1-10)
3. duration (in seconds or distance)
4. obstacles array with:
   - lane (0, 1, or 2)
   - spawnTime (relative timing)
   - type (rock, log, turtle, etc)
5. recommendedBiome (FOREST, MOUNTAIN, CANYON, RAPIDS)
6. enemySpawnRules (which enemies to spawn, when)
7. collectibleDensity (how many coins/gems)

Pattern variety:
- Wave (alternating lanes)
- Zigzag (forces lane switching)
- Gauntlet (tight spacing) 
- Breather (easy recovery)
- Wall (block 2 lanes)
- Spiral (rotating)
- Clusters (grouped obstacles)
- Speed test (fast timing)

Output as valid TypeScript that can be imported directly.

Example structure:
\`\`\`typescript
export const LEVEL_PATTERNS = [
  {
    id: 'gentle_wave',
    name: 'Gentle Wave',
    description: 'Alternating obstacles between lanes',
    difficulty: 2,
    duration: 10,
    obstacles: [
      { lane: 0, spawnTime: 0, type: 'rock' },
      { lane: 1, spawnTime: 1, type: 'rock' },
      // ... more
    ],
    recommendedBiome: 'FOREST',
    enemySpawnRules: { type: 'lazy_log', count: 2, timing: 'random' },
    collectibleDensity: 0.6
  },
  // ... 14 more
];
\`\`\``,
  });

  // Try to extract TypeScript code block
  const tsCode = text.match(/```typescript\n([\s\S]*?)\n```/)?.[1];
  if (tsCode) {
    writeFileSync(
      join(process.cwd(), 'src', 'game', 'data', 'level-patterns.ts'),
      tsCode
    );
    console.log('✅ Level patterns generated and saved!');
    console.log(`📝 ${tsCode.split('\n').length} lines of pattern data`);
  } else {
    // Save the whole response if no code block found
    writeFileSync(
      join(process.cwd(), 'src', 'game', 'data', 'level-patterns.ts'),
      text
    );
    console.log('⚠️ Saved raw response - may need manual cleanup');
  }
}

generateLevelPatterns().catch(console.error);
