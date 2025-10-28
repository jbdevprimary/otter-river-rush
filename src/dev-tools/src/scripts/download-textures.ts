#!/usr/bin/env node
/**
 * Texture Downloader - Gets CC0 textures from AmbientCG
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import https from 'https';

const TEXTURES_DIR = join(process.cwd(), 'public', 'textures');

if (!existsSync(TEXTURES_DIR)) {
  mkdirSync(TEXTURES_DIR, { recursive: true });
}

interface TextureConfig {
  name: string;
  ambientcgId: string;
  resolution: string;
  filename: string;
}

const TEXTURES: TextureConfig[] = [
  {
    name: 'Water 1',
    ambientcgId: 'Water001',
    resolution: '1K',
    filename: 'water-001.jpg',
  },
  {
    name: 'Water 2',
    ambientcgId: 'Water002',
    resolution: '1K',
    filename: 'water-002.jpg',
  },
  {
    name: 'Rock texture 1',
    ambientcgId: 'Rock035',
    resolution: '1K',
    filename: 'rock-texture-001.jpg',
  },
  {
    name: 'Rock texture 2',
    ambientcgId: 'Rock037',
    resolution: '1K',
    filename: 'rock-texture-002.jpg',
  },
  {
    name: 'Ground (riverbank)',
    ambientcgId: 'Ground037',
    resolution: '1K',
    filename: 'riverbank.jpg',
  },
];

async function downloadTexture(config: TextureConfig): Promise<void> {
  console.log(`\n📥 Downloading: ${config.name} (${config.ambientcgId})`);
  
  // AmbientCG direct download URL format
  const url = `https://ambientcg.com/get?file=${config.ambientcgId}_${config.resolution}-JPG.zip`;
  
  console.log(`   Note: ${config.ambientcgId} requires manual download from ambientcg.com`);
  console.log(`   URL: https://ambientcg.com/view?id=${config.ambientcgId}`);
  console.log(`   ⏭️ Skipping auto-download (would need unzip). Please download manually.`);
}

async function main() {
  console.log('🖼️ AmbientCG Texture Download Guide\n');
  console.log('All textures are CC0 (public domain) from https://ambientcg.com\n');
  
  console.log('📋 Textures to download:\n');
  
  for (const config of TEXTURES) {
    console.log(`${config.name}:`);
    console.log(`  - Visit: https://ambientcg.com/view?id=${config.ambientcgId}`);
    console.log(`  - Download: ${config.resolution}-JPG`);
    console.log(`  - Extract and rename Color.jpg to: ${config.filename}`);
    console.log(`  - Place in: public/textures/\n`);
  }
  
  console.log('💡 Quick Command to get started:');
  console.log('   Open browser and download from ambientcg.com\n');
  console.log('✨ Or use the canvas-based procedural textures already in BackgroundGenerator!');
}

main().catch(console.error);
