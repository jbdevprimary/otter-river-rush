# Placeholder Sprites

This directory contains game sprites. These can be:

1. **AI-Generated** (recommended): Run `npm run generate-sprites` to create high-quality sprites using OpenAI
2. **Fallback**: The game will use simple rectangle rendering if sprites are missing

## Quick Start

### Option 1: Generate with AI (Best Quality)
```bash
export OPENAI_API_KEY="your-key-here"
npm run generate-sprites
```

### Option 2: Use Placeholder Images
For development without AI generation, you can:
- Create simple PNG files with the names below
- Use any image editor (GIMP, Photoshop, etc.)
- Or grab sprites from free game asset sites like OpenGameArt.org

## Required Sprite Files

**Characters:**
- `otter.png` - Main character (64x64px recommended)
- `otter-shield.png` - Otter with shield effect

**Obstacles:**
- `rock-1.png` - Rock variation 1
- `rock-2.png` - Rock variation 2
- `rock-3.png` - Rock variation 3

**Collectibles:**
- `coin.png` - Gold coin
- `gem-blue.png` - Blue gem
- `gem-red.png` - Red gem

**Power-ups:**
- `powerup-shield.png` - Shield power-up icon
- `powerup-speed.png` - Speed boost icon
- `powerup-multiplier.png` - Score multiplier icon
- `powerup-magnet.png` - Magnet power-up icon

**Effects:**
- `water-ripple.png` - Water ripple effect
- `splash.png` - Water splash effect

## Sprite Specifications

- **Size**: 512x512 or 1024x1024 pixels (will be scaled)
- **Format**: PNG with transparency
- **Style**: Cartoon/game-friendly, bright colors
- **Background**: Transparent (alpha channel)

## Game Behavior

- ✅ **With sprites**: Game renders beautiful AI-generated or custom sprites
- ⚠️ **Without sprites**: Game falls back to colored rectangles (still playable!)
- 🔄 **Loading**: Shows progress bar while sprites load

The game is fully functional with or without sprites!
