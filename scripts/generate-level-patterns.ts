#!/usr/bin/env node
/**
 * Level Pattern Generator - Uses Claude to generate obstacle patterns
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync } from 'fs';
import { join } from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateLevelPatterns() {
  console.log('🗺️ Generating Level Patterns with Claude...');
  
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `Design 15 challenging and varied obstacle patterns for "Otter River Rush", a 3-lane endless runner.

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
    }],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    // Try to extract TypeScript code block
    const tsCode = content.text.match(/```typescript\n([\s\S]*?)\n```/)?.[1];
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
        content.text
      );
      console.log('⚠️ Saved raw response - may need manual cleanup');
    }
  }
}

generateLevelPatterns().catch(console.error);
