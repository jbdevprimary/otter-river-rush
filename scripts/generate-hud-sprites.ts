#!/usr/bin/env node
/**
 * HUD & Splash Screen Generator - Uses GPT-Image-1 for UI elements
 */

import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage } from 'ai';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const SPRITES_DIR = join(process.cwd(), 'public', 'sprites');
const HUD_DIR = join(process.cwd(), 'public', 'hud');

// Ensure directories exist
[SPRITES_DIR, HUD_DIR].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

interface ImageConfig {
  name: string;
  prompt: string;
  filename: string;
  size: '1024x1024' | '1792x1024' | '1024x1792';
  directory: string;
}

const HUD_CONFIGS: ImageConfig[] = [
  {
    name: 'Splash Screen',
    prompt: 'Otter River Rush game title screen, cute otter surfing on water, vibrant cartoon style, blue river background, playful logo design, game art, bright colors, professional mobile game splash screen',
    filename: 'splash-screen.png',
    size: '1024x1536',
    directory: HUD_DIR,
  },
  {
    name: 'Heart/Life Icon',
    prompt: 'Cute red heart icon for game UI, simple clean design, slight 3D effect, game HUD element, transparent background',
    filename: 'heart-icon.png',
    size: '1024x1024',
    directory: HUD_DIR,
  },
  {
    name: 'Coin Counter Background',
    prompt: 'Small rounded rectangle UI panel for coin counter, wood texture, game HUD element, slightly transparent, warm brown color',
    filename: 'coin-panel.png',
    size: '1024x1024',
    directory: HUD_DIR,
  },
  {
    name: 'Pause Button',
    prompt: 'Pause button icon for mobile game, two vertical bars, circular blue background, glossy effect, game UI button',
    filename: 'pause-button.png',
    size: '1024x1024',
    directory: HUD_DIR,
  },
  {
    name: 'Play Button',
    prompt: 'Play button icon for mobile game, triangle play symbol, circular green background, glossy effect, game UI button',
    filename: 'play-button.png',
    size: '1024x1024',
    directory: HUD_DIR,
  },
  {
    name: 'Settings Button',
    prompt: 'Settings gear icon for mobile game, circular gray background, modern clean design, game UI button',
    filename: 'settings-button.png',
    size: '1024x1024',
    directory: HUD_DIR,
  },
  {
    name: 'Achievement Badge',
    prompt: 'Golden star achievement badge, shiny metallic effect, ribbon banner, game UI element, celebration icon',
    filename: 'achievement-badge.png',
    size: '1024x1024',
    directory: HUD_DIR,
  },
  {
    name: 'Level Up Banner',
    prompt: 'Level up celebration banner, colorful confetti, golden text background, game UI victory element, wide banner format',
    filename: 'levelup-banner.png',
    size: '1536x1024',
    directory: HUD_DIR,
  },
];

async function generateImage_single(config: ImageConfig): Promise<void> {
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
    
    const filepath = join(config.directory, config.filename);
    writeFileSync(filepath, buffer);
    
    console.log(`   ✅ Saved: ${config.filename} (${Math.round(buffer.length / 1024)}KB)`);
  } catch (error) {
    console.error(`   ❌ Failed to generate ${config.name}:`, error);
  }
}

async function main() {
  console.log('🚀 Starting HUD & Splash Screen Generation...\n');
  console.log(`📁 Output directory: ${HUD_DIR}`);
  console.log(`🖼️  Total images: ${HUD_CONFIGS.length}\n`);

  for (const config of HUD_CONFIGS) {
    await generateImage_single(config);
    // Delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✨ HUD Generation Complete!');
  console.log(`📂 HUD elements saved to: ${HUD_DIR}`);
}

main().catch(console.error);
