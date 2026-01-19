#!/usr/bin/env node
/**
 * Otter River Rush Asset Generation CLI
 *
 * Usage:
 *   pnpm gen:all       # Generate all assets
 *   pnpm gen:otter     # Generate player otter
 *   pnpm gen:obstacles # Generate obstacles (rocks, logs)
 *   pnpm gen:collectibles # Generate collectibles (coins, gems, fish)
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { program } from 'commander';
import { MeshyClient } from './api/meshy-client';
import { TaskExecutor } from './tasks/executor';
import { taskRegistry } from './tasks/registry';
import {
  ALL_PROMPTS,
  PLAYER_PROMPTS,
  OBSTACLE_PROMPTS,
  COLLECTIBLE_PROMPTS,
  DECORATION_PROMPTS,
  type AssetPrompt,
} from './assets/prompts';
import type { TaskContext, AssetManifest, AssetEntry, TaskDefinition } from './tasks/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../../..', 'apps/web/public/assets/models');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

// ============================================================================
// HELPERS
// ============================================================================

function getApiKey(): string {
  const key = process.env.MESHY_API_KEY;
  if (!key) {
    console.error('Error: MESHY_API_KEY environment variable not set');
    console.error('Please set it in your .env file or environment');
    process.exit(1);
  }
  return key;
}

function loadManifest(): AssetManifest {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  }
  return {
    version: '1.0.0',
    generatedAt: Date.now(),
    assets: {
      otter: [],
      rock: [],
      log: [],
      coin: [],
      gem: [],
      fish: [],
      'lily-pad': [],
      cattail: [],
      duck: [],
    },
  };
}

function saveManifest(manifest: AssetManifest): void {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

async function generateAsset(
  client: MeshyClient,
  executor: TaskExecutor,
  prompt: AssetPrompt,
  manifest: AssetManifest
): Promise<void> {
  const assetDir = path.join(OUTPUT_DIR, prompt.category, prompt.id);
  fs.mkdirSync(assetDir, { recursive: true });

  const context: TaskContext = {
    assetDir,
    manifest: manifest as unknown as Record<string, unknown>,
    completedTasks: new Map(),
    log: console.log,
  };

  // Get the text-to-3d task definition
  const taskDef = taskRegistry.get('text-to-3d');
  if (!taskDef) {
    console.error('Task definition text-to-3d not found');
    return;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Generating: ${prompt.id}`);
  console.log(`Category: ${prompt.category}`);
  console.log(`Prompt: ${prompt.prompt.substring(0, 80)}...`);
  console.log('='.repeat(60));

  try {
    const result = await executor.execute(taskDef, context, {
      prompt: prompt.prompt,
      negative_prompt: prompt.negativePrompt,
      art_style: prompt.artStyle,
      target_polycount: prompt.targetPolycount,
    });

    if (result.status === 'SUCCEEDED') {
      // Get the correct category key for the manifest
      const categoryKey = getCategoryKey(prompt.id);

      const entry: AssetEntry = {
        id: prompt.id,
        prompt: prompt.prompt,
        taskId: result.taskId!,
        status: 'SUCCEEDED',
        files: {
          glb: result.outputs?.['glb'],
          thumbnail: result.outputs?.['thumbnail'],
        },
        generatedAt: Date.now(),
      };

      // Add to manifest
      if (!manifest.assets[categoryKey]) {
        manifest.assets[categoryKey] = [];
      }
      manifest.assets[categoryKey].push(entry);
      saveManifest(manifest);

      console.log(`\n✓ Successfully generated ${prompt.id}`);
    } else {
      console.error(`\n✗ Failed to generate ${prompt.id}: ${result.error}`);
    }
  } catch (error) {
    console.error(`\n✗ Error generating ${prompt.id}:`, error);
  }
}

function getCategoryKey(promptId: string): keyof AssetManifest['assets'] {
  if (promptId.includes('otter')) return 'otter';
  if (promptId.includes('rock')) return 'rock';
  if (promptId.includes('log') || promptId.includes('branch')) return 'log';
  if (promptId.includes('coin')) return 'coin';
  if (promptId.includes('gem')) return 'gem';
  if (promptId.includes('fish')) return 'fish';
  if (promptId.includes('lily')) return 'lily-pad';
  if (promptId.includes('cattail') || promptId.includes('reed')) return 'cattail';
  if (promptId.includes('duck')) return 'duck';
  return 'rock'; // fallback
}

async function generatePrompts(prompts: AssetPrompt[]): Promise<void> {
  const client = new MeshyClient({ apiKey: getApiKey() });
  const executor = new TaskExecutor(client);
  const manifest = loadManifest();

  console.log(`\nGenerating ${prompts.length} assets...`);
  console.log(`Output directory: ${OUTPUT_DIR}`);

  for (const prompt of prompts) {
    await generateAsset(client, executor, prompt, manifest);
  }

  manifest.generatedAt = Date.now();
  saveManifest(manifest);

  console.log('\n' + '='.repeat(60));
  console.log('Generation complete!');
  console.log(`Manifest saved to: ${MANIFEST_PATH}`);
  console.log('='.repeat(60));
}

// ============================================================================
// CLI COMMANDS
// ============================================================================

program
  .name('content-gen')
  .description('Otter River Rush 3D asset generation using Meshy AI')
  .version('0.1.0');

program
  .command('all')
  .description('Generate all game assets')
  .action(async () => {
    await generatePrompts(ALL_PROMPTS);
  });

program
  .command('otter')
  .description('Generate player otter model')
  .action(async () => {
    await generatePrompts(PLAYER_PROMPTS);
  });

program
  .command('obstacles')
  .description('Generate obstacle models (rocks, logs)')
  .action(async () => {
    await generatePrompts(OBSTACLE_PROMPTS);
  });

program
  .command('collectibles')
  .description('Generate collectible models (coins, gems, fish)')
  .action(async () => {
    await generatePrompts(COLLECTIBLE_PROMPTS);
  });

program
  .command('decorations')
  .description('Generate decoration models (lily pads, cattails)')
  .action(async () => {
    await generatePrompts(DECORATION_PROMPTS);
  });

program
  .command('single <promptId>')
  .description('Generate a single asset by prompt ID')
  .action(async (promptId: string) => {
    const prompt = ALL_PROMPTS.find(p => p.id === promptId);
    if (!prompt) {
      console.error(`Unknown prompt ID: ${promptId}`);
      console.error('Available IDs:', ALL_PROMPTS.map(p => p.id).join(', '));
      process.exit(1);
    }
    await generatePrompts([prompt]);
  });

program
  .command('list')
  .description('List all available prompts')
  .action(() => {
    console.log('\nAvailable asset prompts:\n');

    const categories = ['player', 'obstacle', 'collectible', 'decoration'] as const;
    for (const category of categories) {
      const prompts = ALL_PROMPTS.filter(p => p.category === category);
      console.log(`${category.toUpperCase()}:`);
      for (const p of prompts) {
        console.log(`  - ${p.id}: ${p.prompt.substring(0, 50)}...`);
      }
      console.log();
    }
  });

program.parse();
