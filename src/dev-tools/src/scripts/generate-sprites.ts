#!/usr/bin/env node
/**
 * Sprite Generator - Uses OpenAI's GPT-IMAGE-1 to create game sprites
 * Run with: npm run generate-sprites
 */

import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage } from 'ai';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const SPRITES_DIR = join(process.cwd(), 'public', 'sprites');

// Ensure sprites directory exists
if (!existsSync(SPRITES_DIR)) {
  mkdirSync(SPRITES_DIR, { recursive: true });
}

interface SpriteConfig {
  name: string;
  prompt: string;
  filename: string;
}

const SPRITE_CONFIGS: SpriteConfig[] = [
  // Otter sprites
  {
    name: 'Otter (Normal)',
    prompt: 'Cute cartoon otter character for a river game, swimming position, playful expression, simple design, vibrant colors, transparent PNG background, game sprite style, clean edges',
    filename: 'otter.png',
  },
  {
    name: 'Otter (Shield)',
    prompt: 'Cute cartoon otter character with a glowing blue magical shield bubble around it, swimming position, protected look, vibrant colors, transparent PNG background, game sprite style',
    filename: 'otter-shield.png',
  },
  
  // Rock obstacles (variations)
  {
    name: 'Rock 1',
    prompt: 'Smooth river rock obstacle, gray stone with moss, simple geometric shape, game sprite style, transparent PNG background, top-down view, clean edges',
    filename: 'rock-1.png',
  },
  {
    name: 'Rock 2',
    prompt: 'Jagged river rock obstacle, dark gray stone, angular shape, game sprite style, transparent PNG background, top-down view, slightly different from first rock',
    filename: 'rock-2.png',
  },
  {
    name: 'Rock 3',
    prompt: 'Rounded boulder obstacle, light gray with cracks, game sprite style, transparent PNG background, top-down view, distinct shape variation',
    filename: 'rock-3.png',
  },
  
  // Collectibles
  {
    name: 'Coin',
    prompt: 'Shiny golden coin collectible, circular, gleaming effect, simple game icon style, transparent PNG background, sparkle effect, clean edges',
    filename: 'coin.png',
  },
  {
    name: 'Gem (Blue)',
    prompt: 'Beautiful blue gem diamond collectible, faceted crystal, glowing effect, game icon style, transparent PNG background, magical sparkle',
    filename: 'gem-blue.png',
  },
  {
    name: 'Gem (Red)',
    prompt: 'Beautiful red ruby gem collectible, faceted crystal, glowing effect, game icon style, transparent PNG background, valuable appearance',
    filename: 'gem-red.png',
  },
  
  // Power-ups
  {
    name: 'Shield Power-up',
    prompt: 'Blue shield icon power-up, glowing magical shield symbol, game power-up style, transparent PNG background, bright colors, circular base',
    filename: 'powerup-shield.png',
  },
  {
    name: 'Speed Boost Power-up',
    prompt: 'Yellow lightning bolt icon power-up, energy effect, speed boost symbol, game power-up style, transparent PNG background, dynamic appearance',
    filename: 'powerup-speed.png',
  },
  {
    name: 'Score Multiplier Power-up',
    prompt: 'Green star with x2 symbol power-up icon, score multiplier indicator, game power-up style, transparent PNG background, vibrant colors',
    filename: 'powerup-multiplier.png',
  },
  {
    name: 'Magnet Power-up',
    prompt: 'Purple horseshoe magnet icon power-up, attractive force symbol, game power-up style, transparent PNG background, magical effect',
    filename: 'powerup-magnet.png',
  },
  
  // Background elements
  {
    name: 'Water Ripple',
    prompt: 'Water ripple effect, circular wave pattern, translucent blue, game sprite overlay, transparent PNG background, subtle animation frame',
    filename: 'water-ripple.png',
  },
  {
    name: 'Splash Effect',
    prompt: 'Water splash effect, dynamic droplets, white and blue water spray, game VFX sprite, transparent PNG background, impact effect',
    filename: 'splash.png',
  },
];

async function generateSprite(config: SpriteConfig): Promise<void> {
  console.log(`\n🎨 Generating: ${config.name}`);
  console.log(`   Prompt: ${config.prompt.substring(0, 80)}...`);
  
  try {
    const result = await generateImage({
      model: openai.image('gpt-image-1'),
      prompt: config.prompt,
      size: '1024x1024',
    });

    // Get the base64 image data
    const base64Data = result.image.base64;
    const buffer = Buffer.from(base64Data, 'base64');
    
    const filepath = join(SPRITES_DIR, config.filename);
    writeFileSync(filepath, buffer);
    
    console.log(`   ✅ Saved: ${config.filename} (${Math.round(buffer.length / 1024)}KB)`);
  } catch (error) {
    console.error(`   ❌ Failed to generate ${config.name}:`, error);
  }
}

async function generateAllSprites(): Promise<void> {
  console.log('🚀 Starting sprite generation...');
  console.log(`📁 Output directory: ${SPRITES_DIR}`);
  console.log(`🖼️  Total sprites to generate: ${SPRITE_CONFIGS.length}`);
  
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('\n❌ Error: OPENAI_API_KEY environment variable not set');
    console.log('💡 Vercel AI SDK will automatically use the key from your environment');
    process.exit(1);
  }
  
  // Generate sprites sequentially to avoid rate limits
  for (const config of SPRITE_CONFIGS) {
    await generateSprite(config);
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n✨ Sprite generation complete!');
  console.log(`📂 Sprites saved to: ${SPRITES_DIR}`);
}

// Alternative: Generate specific sprite by name
async function generateSpecific(name: string): Promise<void> {
  const config = SPRITE_CONFIGS.find(
    c => c.name.toLowerCase() === name.toLowerCase()
  );
  
  if (!config) {
    console.error(`❌ Sprite "${name}" not found`);
    console.log('Available sprites:');
    SPRITE_CONFIGS.forEach(c => console.log(`  - ${c.name}`));
    process.exit(1);
  }
  
  await generateSprite(config);
}

// CLI handling
const args = process.argv.slice(2);

if (args.length === 0) {
  // Generate all sprites
  generateAllSprites().catch(console.error);
} else if (args[0] === '--list') {
  // List available sprites
  console.log('Available sprites:');
  SPRITE_CONFIGS.forEach(c => {
    console.log(`\n📌 ${c.name}`);
    console.log(`   File: ${c.filename}`);
    console.log(`   Prompt: ${c.prompt}`);
  });
} else if (args[0] === '--sprite' && args[1]) {
  // Generate specific sprite
  generateSpecific(args[1]).catch(console.error);
} else {
  console.log('Usage:');
  console.log('  npm run generate-sprites              # Generate all sprites');
  console.log('  npm run generate-sprites --list       # List available sprites');
  console.log('  npm run generate-sprites --sprite "Otter (Normal)"  # Generate specific sprite');
}
