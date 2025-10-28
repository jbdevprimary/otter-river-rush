#!/usr/bin/env node
/**
 * PWA Icon Generator - Creates required PWA icons using AI
 */

import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage } from 'ai';
import { writeFileSync } from 'fs';
import { join } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');

interface IconConfig {
  name: string;
  prompt: string;
  filename: string;
  size: '1024x1024' | '1024x1536' | '1536x1024';
}

const ICON_CONFIGS: IconConfig[] = [
  {
    name: 'PWA Icon 512x512',
    prompt: 'Otter River Rush game app icon, cute otter face mascot, bright blue water background, circular app icon design, professional mobile game icon, vibrant colors, simple clean design, centered character',
    filename: 'pwa-512x512.png',
    size: '1024x1024',
  },
  {
    name: 'PWA Icon 192x192',
    prompt: 'Otter River Rush game app icon, cute otter face mascot, bright blue water background, circular app icon design, professional mobile game icon, vibrant colors, simple clean design, centered character',
    filename: 'pwa-192x192.png',
    size: '1024x1024',
  },
  {
    name: 'Apple Touch Icon',
    prompt: 'Otter River Rush game app icon, cute otter face mascot, bright blue water background, rounded square app icon for iOS, professional mobile game icon, vibrant colors, simple clean design',
    filename: 'apple-touch-icon.png',
    size: '1024x1024',
  },
  {
    name: 'Favicon',
    prompt: 'Cute otter face icon, simple minimalist design, game mascot, bright colors, small icon suitable for browser tab, clear at small sizes',
    filename: 'favicon-temp.png',
    size: '1024x1024',
  },
];

async function generateIcon(config: IconConfig): Promise<void> {
  console.log(`\n🎨 Generating: ${config.name}`);
  console.log(`   Size: ${config.size}`);
  
  try {
    const result = await generateImage({
      model: openai.image('gpt-image-1'),
      prompt: config.prompt,
      size: config.size,
    });

    const base64Data = result.image.base64;
    const buffer = Buffer.from(base64Data, 'base64');
    
    const filepath = join(PUBLIC_DIR, config.filename);
    writeFileSync(filepath, buffer);
    
    console.log(`   ✅ Saved: ${config.filename} (${Math.round(buffer.length / 1024)}KB)`);
  } catch (error) {
    console.error(`   ❌ Failed to generate ${config.name}:`, error);
  }
}

async function generateSVGMaskIcon(): Promise<void> {
  console.log('\n🎨 Generating: SVG Mask Icon');
  
  // Simple SVG mask icon with otter silhouette
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="currentColor"/>
  <ellipse cx="35" cy="40" rx="4" ry="6" fill="white"/>
  <ellipse cx="65" cy="40" rx="4" ry="6" fill="white"/>
  <path d="M 30,55 Q 50,65 70,55" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="25" cy="35" rx="8" ry="10" fill="currentColor"/>
  <ellipse cx="75" cy="35" rx="8" ry="10" fill="currentColor"/>
</svg>`;

  const filepath = join(PUBLIC_DIR, 'mask-icon.svg');
  writeFileSync(filepath, svg);
  
  console.log('   ✅ Saved: mask-icon.svg');
}

async function main() {
  console.log('🚀 Starting PWA Icon Generation...\n');
  console.log(`📁 Output directory: ${PUBLIC_DIR}`);
  console.log(`🖼️  Total icons: ${ICON_CONFIGS.length + 1}\n`);

  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('\n❌ Error: OPENAI_API_KEY environment variable not set');
    process.exit(1);
  }

  // Generate raster icons
  for (const config of ICON_CONFIGS) {
    await generateIcon(config);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Generate SVG mask icon
  await generateSVGMaskIcon();

  console.log('\n✨ PWA Icon Generation Complete!');
  console.log(`📂 Icons saved to: ${PUBLIC_DIR}`);
  console.log('\n📝 Post-generation steps:');
  console.log('   1. Convert favicon-temp.png to favicon.ico using online tool or ImageMagick');
  console.log('   2. Verify all icons look good at their target sizes');
  console.log('   3. Test PWA installation on mobile devices');
}

main().catch(console.error);
