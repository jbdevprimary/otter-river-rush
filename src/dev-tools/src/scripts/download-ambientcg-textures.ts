#!/usr/bin/env tsx
/**
 * Download AmbientCG Textures
 * Downloads required PBR texture sets for terrain
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import chalk from 'chalk';
import ora from 'ora';

const TEXTURES_TO_DOWNLOAD = [
  { id: 'Grass001', resolution: '1K', format: 'JPG', tags: ['grass', 'ground'] },
  { id: 'Rock024', resolution: '1K', format: 'JPG', tags: ['granite', 'mountain'] },
  { id: 'Rock022', resolution: '1K', format: 'JPG', tags: ['river', 'wet'] },
  { id: 'Ground037', resolution: '1K', format: 'JPG', tags: ['sand', 'desert'] },
  // Water002 doesn't exist on AmbientCG - using custom River component instead
];

const OUTPUT_DIR = join(process.cwd(), 'src/client/public/textures');

interface TextureDownload {
  id: string;
  resolution: string;
  format: string;
  url: string;
  outputPath: string;
}

async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  const fileStream = createWriteStream(outputPath);
  await pipeline(response.body as any, fileStream);
}

async function extractZip(zipPath: string, outputDir: string): Promise<void> {
  const AdmZip = (await import('adm-zip')).default;
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(outputDir, true);
}

async function downloadTexture(texture: typeof TEXTURES_TO_DOWNLOAD[0]): Promise<void> {
  const spinner = ora(`Downloading ${texture.id}...`).start();
  
  try {
    const textureDir = join(OUTPUT_DIR, texture.id);
    if (!existsSync(textureDir)) {
      mkdirSync(textureDir, { recursive: true });
    }
    
    // Download URL from AmbientCG
    const fileName = `${texture.id}_${texture.resolution}-${texture.format}.zip`;
    const downloadUrl = `https://ambientcg.com/get?file=${encodeURIComponent(fileName)}`;
    const zipPath = join(textureDir, fileName);
    
    // Check if already downloaded
    const expectedFiles = [
      `${texture.id}_${texture.resolution}_Color.${texture.format.toLowerCase()}`,
      `${texture.id}_${texture.resolution}_NormalGL.${texture.format.toLowerCase()}`,
      `${texture.id}_${texture.resolution}_Roughness.${texture.format.toLowerCase()}`,
      `${texture.id}_${texture.resolution}_AmbientOcclusion.${texture.format.toLowerCase()}`,
    ];
    
    const allExist = expectedFiles.every(f => existsSync(join(textureDir, f)));
    if (allExist) {
      spinner.succeed(`${texture.id} already downloaded`);
      return;
    }
    
    // Download ZIP
    spinner.text = `Downloading ${texture.id} (${texture.resolution}-${texture.format})...`;
    await downloadFile(downloadUrl, zipPath);
    
    // Extract
    spinner.text = `Extracting ${texture.id}...`;
    await extractZip(zipPath, textureDir);
    
    // Clean up ZIP
    const fs = await import('fs/promises');
    await fs.unlink(zipPath);
    
    spinner.succeed(`${texture.id} downloaded and extracted`);
  } catch (error: any) {
    spinner.fail(`Failed to download ${texture.id}: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log(chalk.cyan.bold('\n🎨 AmbientCG Texture Downloader\n'));
  
  console.log(`Output directory: ${chalk.yellow(OUTPUT_DIR)}\n`);
  
  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Download all textures
  for (const texture of TEXTURES_TO_DOWNLOAD) {
    await downloadTexture(texture);
  }
  
  console.log(chalk.green.bold('\n✅ All textures downloaded!\n'));
  console.log(chalk.gray('Textures location:'), chalk.yellow(`${OUTPUT_DIR}/\n`));
  console.log(chalk.gray('Usage:'));
  console.log(chalk.white('  import { getLocalTexturePaths } from \'@/utils/ambientcg\';'));
  console.log(chalk.white('  const paths = getLocalTexturePaths(\'Grass001\', \'1K\', \'jpg\');'));
  console.log(chalk.white('  const material = usePBRMaterial(paths);\n'));
}

main().catch(console.error);

