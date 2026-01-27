# Asset Management - Otter River Rush

**Last Updated**: 2026-01-26
**Status**: Assets currently in `apps/mobile/public/` - NEEDS MIGRATION to `~/assets`

---

## Table of Contents

- [Current Problem](#current-problem)
- [Available Assets in ~/assets](#available-assets-in-assets)
- [Required Assets for Game](#required-assets-for-game)
- [Asset Sources](#asset-sources)
- [Migration Plan](#migration-plan)

---

## Current Problem

### Current (WRONG) Setup
Assets are copied into `apps/mobile/public/`:
```
apps/mobile/public/
├── models/          # GLB files (duplicated)
├── textures/        # PBR textures (duplicated)
└── audio/           # Sound effects (duplicated)
```

### Why This Is Wrong
1. **Duplication**: Assets stored in two places (git repo + `~/assets`)
2. **Git bloat**: Binary assets bloating repository size
3. **Out of sync**: Local copies may be outdated vs `~/assets` library
4. **Not using library**: Defeats purpose of centralized `~/assets` collection

### Correct Approach
- **Source**: All assets from `~/assets` library
- **Generate**: Missing assets via Meshy AI
- **Build time**: Symlink or copy assets during build
- **Runtime**: Load assets from appropriate paths

---

## Available Assets in ~/assets

### AmbientCG PBR Textures

**Location**: `~/assets/AmbientCG/Assets/`

**Categories**:
- **MATERIAL**: ~1000+ PBR texture sets
  - Grass, ground, dirt, rock, gravel
  - Wood, bark, leaves
  - Water, ice, snow
  - Metal, concrete, brick
- **TERRAIN**: Heightmaps and terrain textures
- **HDRI**: Sky and environment maps
- **DECAL**: Surface details (scratches, stains, etc.)

**Formats**:
- Resolutions: 1K, 2K, 4K JPG
- Maps: Color, Normal, Roughness, AO, Displacement
- Optimized for real-time rendering

**Example Assets for Game**:
```
~/assets/AmbientCG/Assets/MATERIAL/1K-JPG/
├── Grass004/             # River bank grass
├── Grass005/             # Meadow grass
├── Water001/             # Calm water
├── Water002/             # River water
├── Rock031/              # River rocks
├── Rock032/              # Boulder rocks
├── Ground037/            # Sandy riverbed
└── Ground044/            # Dirt riverbed
```

### Kenney 3D Assets

**Location**: `~/assets/Kenney/3D assets/`

**Statistics**:
- **GLB**: 4,677 files
- **FBX**: 8,783 files
- **GLTF**: 1,940 files

**Relevant Collections**:
```
~/assets/Kenney/3D assets/
├── Nature Kit/                # Trees, rocks, plants
├── Racing Kit/                # Props, obstacles
├── Platformer Kit/            # Collectibles, power-ups
├── Prototype Textures/        # Low-poly materials
└── [Many more kits...]
```

**Example Models for Game**:
- Rocks (various sizes)
- Trees and vegetation
- Coins and gems
- Water effects
- Decorative props

### Kenney Audio

**Location**: `~/assets/Kenney/Audio/`

**Collections** (~15 packs):
- Digital Audio
- Interface Sounds
- Impact Sounds
- Casino Audio
- RPG Audio
- Sci-Fi Sounds
- UI Audio
- [More...]

**Example Sounds for Game**:
- Collect coin (UI Audio)
- Hit obstacle (Impact Sounds)
- Power-up activation (Interface Sounds)
- Water ambience (RPG Audio)
- Menu navigation (UI Audio)

### KayKit Adventurers

**Location**: `~/assets/KayKit_Adventurers_1.0_EXTRA/`

**Contents**:
- Character models (GLB/FBX)
- Character animations (walk, run, idle, etc.)
- Textures

**Potential Use**:
- Otter character model (if suitable)
- Animation reference

### Other Assets

**Quaternius**: `~/assets/Quaternius/`
- Low-poly stylized models
- Characters, props, environments

**Low poly Western Objects**: `~/assets/Low poly Western Objects/`
- Western-themed props
- Buildings and decorations

---

## Required Assets for Game

### 3D Models

#### Player
- **Otter model**: Swimming/running animation
- **Otter variants**: Different skins (unlockables)

**Source Options**:
1. Generate via Meshy AI (`packages/content-gen`)
2. Adapt from KayKit Adventurers
3. Use existing GLB in `~/assets/Kenney/`

#### Obstacles
- **Rocks**: Small, medium, large (river obstacles)
- **Logs**: Floating logs
- **Rapids**: Water hazards

**Source**: `~/assets/Kenney/3D assets/Nature Kit/`

#### Collectibles
- **Coins**: Gold coins (points)
- **Gems**: Special collectibles (bonus points)
- **Power-ups**: Shield, magnet, multiplier icons

**Source**: `~/assets/Kenney/3D assets/Platformer Kit/`

#### Environment
- **Trees**: River bank vegetation
- **Plants**: Bushes, grass clumps
- **Decorations**: Biome-specific props

**Source**: `~/assets/Kenney/3D assets/Nature Kit/`

### PBR Textures

#### Terrain
- **Grass** (river banks): AmbientCG Grass004, Grass005
- **Water** (river surface): AmbientCG Water001, Water002
- **Riverbed** (under water): AmbientCG Ground037 (sand), Ground044 (dirt)
- **Rocks** (obstacles): AmbientCG Rock031, Rock032

#### Sky
- **HDRI** (environment lighting): AmbientCG HDRI collection

**Source**: `~/assets/AmbientCG/Assets/MATERIAL/1K-JPG/` (mobile) or `2K-JPG/` (desktop)

### Audio

#### SFX
- **Collect coin**: UI sound
- **Hit obstacle**: Impact sound
- **Power-up**: Interface sound
- **Water splash**: Impact sound

#### Ambience
- **River flowing**: Looping water sound
- **Birds**: Nature ambience

#### Music
- **Menu**: Upbeat, chill
- **Gameplay**: Energetic, adaptive
- **Game Over**: Calming

**Source**: `~/assets/Kenney/Audio/` + procedural generation with Tone.js

---

## Asset Sources

### Priority 1: Use ~/assets Library
For common assets (rocks, grass, water, UI sounds):
- AmbientCG PBR textures
- Kenney 3D models
- Kenney audio

### Priority 2: Generate via Meshy
For game-specific assets (otter character, unique obstacles):
```bash
cd packages/content-gen
pnpm gen:all
```

### Priority 3: Procedural Generation
For audio (music, adaptive sounds):
- Tone.js for procedural music
- Web Audio API for effects

---

## Migration Plan

### Step 1: Audit Current Assets
```bash
# List what's currently in public/
tree apps/mobile/public/
```

### Step 2: Map to ~/assets Sources
For each asset in `public/`, determine:
- Is it in `~/assets`? → Use that
- Can it be generated? → Use Meshy
- Is it procedural? → Generate at runtime

### Step 3: Update Asset Loading Code

**Current**:
```typescript
const texture = useTexture('/textures/grass/color.jpg');
```

**New**:
```typescript
// Reference ~/assets during build
const texture = useTexture(
  resolveAsset('AmbientCG/MATERIAL/1K-JPG/Grass004/Grass004_1K_Color.jpg')
);
```

### Step 4: Build Configuration

**Option A: Symlink** (Development)
```bash
# Link ~/assets into public/ during dev
ln -s ~/assets apps/mobile/public/assets
```

**Option B: Copy** (Production Build)
```javascript
// metro.config.js or build script
// Copy required assets from ~/assets during build
```

**Option C: Asset Resolver** (Dynamic)
```typescript
// packages/assets/src/resolver.ts
export function resolveAsset(path: string): string {
  // Map asset paths to ~/assets or bundled assets
  return Platform.select({
    web: `/assets/${path}`,
    native: require(`~/assets/${path}`),
  });
}
```

### Step 5: Remove Duplicates
```bash
# After migration, remove public/ copies
rm -rf apps/mobile/public/models
rm -rf apps/mobile/public/textures
rm -rf apps/mobile/public/audio
```

### Step 6: Update Documentation
- Update `packages/assets/README.md`
- Update `docs/DEVELOPMENT.md`
- Update memory-bank files

---

## Asset Inventory

### Current Status (apps/mobile/public/)

**Models**:
- [ ] Player: otter-player/model.glb
- [ ] Obstacles: rock-{large,medium,small}/model.glb
- [ ] Collectibles: coin-gold/model.glb

**Textures**:
- [ ] Terrain: grass, water, riverbed
- [ ] Sky: HDRI/skybox
- [ ] PBR: AmbientCG materials

**Audio**:
- [ ] SFX: collect, hit, powerup
- [ ] Ambience: water, nature
- [ ] Music: menu, gameplay, gameover

### Target Status (from ~/assets)

**Models**:
- [ ] Player: Generate via Meshy or adapt KayKit
- [ ] Obstacles: Kenney Nature Kit rocks
- [ ] Collectibles: Kenney Platformer Kit coins
- [ ] Environment: Kenney Nature Kit vegetation

**Textures**:
- [ ] Grass: AmbientCG Grass004, Grass005
- [ ] Water: AmbientCG Water001, Water002
- [ ] Riverbed: AmbientCG Ground037, Ground044
- [ ] Rocks: AmbientCG Rock031, Rock032
- [ ] Sky: AmbientCG HDRI

**Audio**:
- [ ] SFX: Kenney UI Audio, Impact Sounds
- [ ] Ambience: Kenney RPG Audio
- [ ] Music: Procedural (Tone.js)

---

## Asset Guidelines

### Performance
- **Mobile**: Use 1K textures from AmbientCG
- **Desktop**: Use 2K textures
- **Compression**: Use Draco compression for GLB files
- **Lazy loading**: Load assets on-demand, not all at once

### Licensing
- **AmbientCG**: CC0 (public domain)
- **Kenney**: CC0 (public domain)
- **Meshy**: Generated content owned by API user
- **Attribution**: Credit in game and README

### Optimization
- **Texture size**: 1K for mobile, 2K for desktop
- **Model complexity**: < 10K triangles per model
- **Audio**: Compress to OGG Vorbis, 44.1kHz
- **Total size**: Target < 50MB for initial load

---

**Status**: Asset migration plan defined. Implementation pending architecture clarification.
