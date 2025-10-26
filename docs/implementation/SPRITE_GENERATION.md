# 🎨 Sprite Generation System

This project uses AI-generated sprites with OpenAI's image generation API for high-quality, transparent PNG sprites.

## Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Set OpenAI API Key**

The Vercel AI SDK automatically uses your OpenAI API key from environment variables:

```bash
export OPENAI_API_KEY="your-key-here"
```

Or create a `.env.local` file:
```
OPENAI_API_KEY=sk-...
```

## Generating Sprites

### Generate All Sprites
```bash
npm run generate-sprites
```

This will generate all game sprites including:
- Otter character (normal & shield)
- Rock obstacles (3 variations)
- Collectibles (coins, gems)
- Power-ups (shield, speed, multiplier, magnet)
- Effects (water ripples, splashes)

### List Available Sprites
```bash
npm run generate-sprites:list
```

### Generate Specific Sprite
```bash
npm run generate-sprites --sprite "Otter (Normal)"
```

## Sprite Configuration

Edit `scripts/generate-sprites.ts` to:
- Add new sprites
- Modify prompts for better results
- Change image sizes
- Adjust generation parameters

## Usage in Game

Sprites are automatically loaded at runtime:

```typescript
import { spriteLoader } from '@/rendering/SpriteLoader';

// Preload all sprites
await spriteLoader.preloadAll();

// Draw a sprite
spriteLoader.draw(ctx, 'otter.png', x, y, width, height, {
  rotation: Math.PI / 4,
  alpha: 0.8,
  flipX: false,
});
```

## AI Enemy System with Yuka.js

The game now includes AI-driven enemies with pathfinding:

```typescript
import { AIEnemyManager, EnemyType } from '@/game/systems/AIEnemySystem';

const aiManager = new AIEnemyManager();

// Spawn a chaser enemy that follows the player
aiManager.spawn({ x: 100, y: 200 }, EnemyType.CHASER);

// Update AI each frame
aiManager.update(deltaTime, playerPosition, lanes);
```

### Enemy Types

- **CHASER**: Actively seeks and follows the player
- **PATROL**: Moves between lanes in a pattern
- **ZIGZAG**: Random wandering movement
- **AMBUSH**: Waits motionless until player is close, then strikes

## Performance Notes

- Sprites are cached after first load
- AI updates at configurable intervals (not every frame)
- Use `spriteLoader.getProgress()` for loading screens

## Troubleshooting

**Rate Limits**: Add delays between sprite generation (default: 2s)

**Transparency**: DALL-E 3 may not support full transparency. Consider using:
- Post-processing with image libraries
- Alternative models that support transparency
- Manual touch-up in image editors

**Cost**: Image generation costs $0.04-0.08 per image with DALL-E 3. Generate sprites once and commit them to the repository.

## Directory Structure

```
public/
  sprites/          # Generated PNG sprites
    otter.png
    rock-1.png
    coin.png
    ...
```

## Next Steps

1. Run `npm run generate-sprites` to create all sprites
2. Check `public/sprites/` directory
3. Start the dev server: `npm run dev`
4. Enjoy the game with proper sprites and AI enemies!
