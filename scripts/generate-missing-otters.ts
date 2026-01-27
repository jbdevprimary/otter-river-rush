#!/usr/bin/env npx tsx
/**
 * Generate Missing Otter Character 3D Models
 *
 * Uses the Meshy text-to-3D API to generate GLB models for each character
 * that doesn't have a model yet.
 *
 * Usage: npx tsx scripts/generate-missing-otters.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MESHY_API_KEY = process.env.MESHY_API_KEY;
const BASE_URL = 'https://api.meshy.ai/openapi/v2';

// Characters to generate (skip golden, silver, glacier as they map to existing)
const CHARACTERS_TO_GENERATE = [
  'aurora', 'cascade', 'coral', 'crystal', 'galaxy',
  'jade', 'mecha', 'phoenix', 'ripple', 'river',
  'shadow', 'splash', 'storm', 'torrent'
];

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const CHARACTERS_DIR = path.join(PROJECT_ROOT, 'assets', 'characters');
const MODELS_OUTPUT_DIR = path.join(PROJECT_ROOT, 'assets', 'models', 'player');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'assets', 'models', 'manifest.json');

interface CharacterManifest {
  id: string;
  name: string;
  textToImageTask: {
    prompt: string;
    generateMultiView?: boolean;
    poseMode?: string;
  };
  multiImageTo3DTask?: {
    topology?: string;
    targetPolycount?: number;
    symmetryMode?: string;
  };
}

interface MeshyTask {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED';
  progress?: number;
  model_urls?: {
    glb?: string;
    fbx?: string;
    usdz?: string;
  };
  thumbnail_url?: string;
}

interface GenerationResult {
  character: string;
  success: boolean;
  taskId?: string;
  glbPath?: string;
  error?: string;
}

/**
 * Make a request to the Meshy API with retries
 */
async function meshyRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  maxRetries = 5
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${MESHY_API_KEY}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.ok) {
        return await response.json() as T;
      }

      const errorText = await response.text();

      // Handle rate limits and server errors with retry
      if (response.status === 429 || response.status >= 500) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 60000);
        console.log(`  Rate limited or server error (${response.status}), waiting ${delayMs / 1000}s...`);
        await sleep(delayMs);
        continue;
      }

      throw new Error(`API Error (${response.status}): ${errorText}`);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      const retryDelayMs = Math.min(1000 * Math.pow(2, attempt), 60000);
      console.log(`  Request failed, retrying in ${retryDelayMs / 1000}s...`);
      await sleep(retryDelayMs);
    }
  }

  throw new Error(`Request failed after ${maxRetries} attempts`);
}

/**
 * Create a preview task for text-to-3D generation
 */
async function createPreviewTask(prompt: string, targetPolycount = 12000): Promise<string> {
  // Note: Meshy v2 API only supports 'realistic' and 'sculpture' art styles
  // The cartoon style is embedded in the prompt itself (e.g., "Pixar style", "stylized", "cartoon")
  const data = await meshyRequest<{ result: string }>('/text-to-3d', {
    method: 'POST',
    body: JSON.stringify({
      mode: 'preview',
      prompt: prompt,
      art_style: 'sculpture', // Use sculpture for stylized/cartoon-like characters
      ai_model: 'meshy-5',
      topology: 'quad',
      target_polycount: targetPolycount,
      should_remesh: true,
      symmetry_mode: 'auto',
    }),
  });

  return data.result;
}

/**
 * Get task status
 */
async function getTask(taskId: string): Promise<MeshyTask> {
  return meshyRequest<MeshyTask>(`/text-to-3d/${taskId}`);
}

/**
 * Poll task until complete
 */
async function pollTask(taskId: string, maxRetries = 120, intervalMs = 5000): Promise<MeshyTask> {
  for (let i = 0; i < maxRetries; i++) {
    const task = await getTask(taskId);

    if (task.status === 'SUCCEEDED') {
      return task;
    }

    if (task.status === 'FAILED' || task.status === 'EXPIRED') {
      throw new Error(`Task ${taskId} failed with status: ${task.status}`);
    }

    if (task.progress !== undefined) {
      console.log(`    Progress: ${task.progress}%`);
    }

    await sleep(intervalMs);
  }

  throw new Error(`Task ${taskId} timed out after ${maxRetries * intervalMs / 1000}s`);
}

/**
 * Download a file from URL to local path
 */
async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download from ${url}: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, Buffer.from(buffer));
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Read character manifest
 */
function readCharacterManifest(characterName: string): CharacterManifest | null {
  const manifestPath = path.join(CHARACTERS_DIR, characterName, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.log(`  No manifest found for ${characterName}`);
    return null;
  }

  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

/**
 * Check if character already has a model
 */
function hasExistingModel(characterName: string): boolean {
  const modelPath = path.join(MODELS_OUTPUT_DIR, `otter-${characterName}`, 'model.glb');
  return fs.existsSync(modelPath);
}

/**
 * Update the models manifest with new assets
 */
function updateManifest(results: GenerationResult[]): void {
  let manifest: any = { version: '1.0.0', generatedAt: Date.now(), assets: { otter: [] } };

  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  }

  // Add new otter entries
  for (const result of results) {
    if (!result.success || !result.glbPath) continue;

    const manifest_entry = readCharacterManifest(result.character);
    if (!manifest_entry) continue;

    manifest.assets.otter.push({
      id: `otter-${result.character}`,
      prompt: manifest_entry.textToImageTask.prompt,
      taskId: result.taskId,
      status: 'SUCCEEDED',
      files: {
        glb: result.glbPath,
      },
      generatedAt: Date.now(),
    });
  }

  manifest.generatedAt = Date.now();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nUpdated manifest at ${MANIFEST_PATH}`);
}

/**
 * Generate a single character model
 */
async function generateCharacter(characterName: string): Promise<GenerationResult> {
  console.log(`\nGenerating model for: ${characterName}`);

  try {
    // Check if already exists
    if (hasExistingModel(characterName)) {
      console.log(`  Model already exists, skipping`);
      return { character: characterName, success: true, glbPath: path.join(MODELS_OUTPUT_DIR, `otter-${characterName}`, 'model.glb') };
    }

    // Read manifest
    const manifest = readCharacterManifest(characterName);
    if (!manifest) {
      return { character: characterName, success: false, error: 'No manifest found' };
    }

    const prompt = manifest.textToImageTask.prompt;
    const targetPolycount = manifest.multiImageTo3DTask?.targetPolycount || 12000;

    console.log(`  Prompt: "${prompt.substring(0, 80)}..."`);
    console.log(`  Target polycount: ${targetPolycount}`);

    // Create preview task
    console.log(`  Creating preview task...`);
    const taskId = await createPreviewTask(prompt, targetPolycount);
    console.log(`  Task ID: ${taskId}`);

    // Poll until complete
    console.log(`  Waiting for generation...`);
    const task = await pollTask(taskId);

    if (!task.model_urls?.glb) {
      throw new Error('No GLB URL in completed task');
    }

    // Download GLB
    const outputDir = path.join(MODELS_OUTPUT_DIR, `otter-${characterName}`);
    const outputPath = path.join(outputDir, 'model.glb');

    console.log(`  Downloading GLB to ${outputPath}...`);
    await downloadFile(task.model_urls.glb, outputPath);

    // Download thumbnail if available
    if (task.thumbnail_url) {
      const thumbnailPath = path.join(outputDir, 'thumbnail.png');
      console.log(`  Downloading thumbnail...`);
      await downloadFile(task.thumbnail_url, thumbnailPath);
    }

    console.log(`  SUCCESS: Model saved to ${outputPath}`);
    return {
      character: characterName,
      success: true,
      taskId,
      glbPath: outputPath
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  FAILED: ${errorMessage}`);
    return { character: characterName, success: false, error: errorMessage };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('=================================================');
  console.log('   Otter River Rush - Missing Model Generator');
  console.log('=================================================\n');

  if (!MESHY_API_KEY) {
    console.error('ERROR: MESHY_API_KEY not found in environment');
    process.exit(1);
  }

  console.log(`API Key: ${MESHY_API_KEY.substring(0, 8)}...`);
  console.log(`Characters to generate: ${CHARACTERS_TO_GENERATE.length}`);
  console.log(`Output directory: ${MODELS_OUTPUT_DIR}\n`);

  const results: GenerationResult[] = [];

  // Generate each character sequentially (to avoid rate limits)
  for (const character of CHARACTERS_TO_GENERATE) {
    const result = await generateCharacter(character);
    results.push(result);

    // Small delay between characters to be nice to the API
    await sleep(2000);
  }

  // Summary
  console.log('\n=================================================');
  console.log('                  SUMMARY');
  console.log('=================================================');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\nSuccessful: ${successful.length}/${results.length}`);
  for (const r of successful) {
    console.log(`  - ${r.character}: ${r.glbPath}`);
  }

  if (failed.length > 0) {
    console.log(`\nFailed: ${failed.length}/${results.length}`);
    for (const r of failed) {
      console.log(`  - ${r.character}: ${r.error}`);
    }
  }

  // Update manifest with successful generations
  const newGenerations = successful.filter(r => r.taskId);
  if (newGenerations.length > 0) {
    updateManifest(newGenerations);
  }

  console.log('\nDone!');
}

main().catch(console.error);
