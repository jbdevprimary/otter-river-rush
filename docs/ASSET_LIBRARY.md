# Asset Library Documentation

**Last Updated**: 2026-01-26
**License**: All assets are CC0 1.0 (Public Domain)

---

## Overview

This document catalogs all available assets from the local `~/assets` library that can be used in Otter River Rush. Assets are organized by category and include licensing information for proper attribution.

## Quick Access (Symlinks)

The `assets/lib/` directory contains symlinks to commonly used asset folders:

```
assets/lib/
  ambientcg-1k/           -> AmbientCG 1K PBR textures (1947 materials)
  kenney-audio/           -> All Kenney audio collections
  kenney-nature/          -> Kenney Nature Kit 3D models
  kenney-watercraft/      -> Kenney Watercraft Pack GLB models
  kenney-ui-fantasy-borders/  -> Fantasy UI borders (9-slice panels)
  kenney-ui-pack/         -> General UI elements
  kenney-onscreen-controls/   -> Mobile touch controls
  kenney-interface-sounds/    -> UI click/confirm sounds (100 files)
  kenney-impact-sounds/   -> Collision/impact sounds (130 files)
  kenney-music-loops/     -> Background music tracks (19 loops)
  quaternius-stylized-nature/ -> High-poly stylized nature assets
```

---

## Currently Used Assets

### 3D Models (In Use)

| Category | Source | Location | Usage |
|----------|--------|----------|-------|
| Player Otters | Meshy AI | `assets/models/player/` | 4 otter variants |
| Coins | Kenney | `assets/models/collectible/coins/` | Gold, Silver, Bronze |
| Gems | Kenney | `assets/models/collectible/gems/` | Crystal, Heart |
| Trees | Kenney Nature | `assets/models/environment/forest/` | 5 tree types |
| Rocks | Kenney Nature | `assets/models/environment/*/` | Per-biome rocks |
| Plants | Kenney Nature | `assets/models/environment/*/` | Grass, flowers |
| Decorations | Kenney/Quaternius | `assets/models/decoration/` | Lily pads, bushes |

### PBR Textures (In Use)

| Category | Source | Location | Biome |
|----------|--------|----------|-------|
| Grass001, Grass004 | AmbientCG | `assets/textures/pbr/grass/` | Forest, Tropical |
| Rock001, Rock005, Rock020 | AmbientCG | `assets/textures/pbr/rock/` | Canyon, Volcanic |
| Ground037, Ground054 | AmbientCG | `assets/textures/pbr/ground/` | Riverbanks |
| Gravel022, Gravel030 | AmbientCG | `assets/textures/pbr/gravel/` | Canyon |
| Ice001, Ice002 | AmbientCG | `assets/textures/pbr/ice/` | Arctic |
| Lava001, Lava004 | AmbientCG | `assets/textures/pbr/lava/` | Volcanic |
| Snow001, Snow006 | AmbientCG | `assets/textures/pbr/snow/` | Arctic |
| Bark005, Bark010 | AmbientCG | `assets/textures/pbr/bark/` | Tree trunks |

### Audio (Currently Procedural)

The game uses **Tone.js** for procedural audio synthesis. Physical audio files exist for fallback:

| Type | Source | Location |
|------|--------|----------|
| Music Loops | Kenney | `assets/audio/music/` |
| UI Sounds | Kenney | `assets/audio/sfx/` |
| Ambient | Kenney | `assets/audio/ambient/` |

---

## Available But Unused Assets

### High-Value Unused: 3D Models

#### Kenney Watercraft Pack (for river variety)
```
assets/lib/kenney-watercraft/
  boat-row-small.glb      -> Small rowing boat obstacle
  boat-row-large.glb      -> Large rowing boat obstacle
  canoe.glb               -> Canoe decoration
  buoy.glb                -> River marker decoration
  buoy-flag.glb           -> Flag buoy decoration
  boat-fishing-small.glb  -> Fishing boat obstacle
```

**Recommendation**: Add 2-3 watercraft models as new obstacles for river variety.

#### Kenney Nature Kit (additional variety)
```
assets/lib/kenney-nature/
  bridge_wood.glb         -> River crossing decoration
  bridge_stone.glb        -> Stone bridge decoration
  canoe_paddle.glb        -> Floating paddle decoration
  campfire_logs.glb       -> Riverbank decoration
  tent.glb                -> Campsite decoration (riverbank)
  wagon.glb               -> Riverbank scenery
```

#### Quaternius Stylized Nature
```
assets/lib/quaternius-stylized-nature/
  Various high-poly trees, bushes, rocks
  Better for desktop/high-performance mode
```

### High-Value Unused: UI Assets

#### Fantasy UI Borders (9-slice panels)
```
assets/lib/kenney-ui-fantasy-borders/PNG/Default/
  Panel/                  -> 9-slice panel backgrounds
  Border/                 -> Decorative borders
  Divider/                -> Section dividers
  Divider Fade/           -> Faded dividers
  Transparent border/     -> Outline-only borders
  Transparent center/     -> Center-transparent panels
```

**Recommendation**: Use for game menus, HUD panels, achievement popups.

#### Onscreen Controls (Mobile)
```
assets/lib/kenney-onscreen-controls/Sprites/
  flat-dark/              -> Dark flat style
  flat-light/             -> Light flat style
  shaded-dark/            -> 3D shaded dark
  shaded-light/           -> 3D shaded light
  line-dark/              -> Outline dark
  line-light/             -> Outline light
  transparent-dark/       -> Semi-transparent dark
  transparent-light/      -> Semi-transparent light
```

**Recommendation**: Use for mobile touch controls (d-pad, buttons).

#### UI Pack (General)
```
assets/lib/kenney-ui-pack/PNG/
  Blue/                   -> Blue theme buttons, panels
  Green/                  -> Green theme elements
  Grey/                   -> Neutral elements
  Red/                    -> Warning/danger elements
  Yellow/                 -> Highlight elements
  Extra/                  -> Icons, indicators
```

### High-Value Unused: Audio

#### Interface Sounds (100 sounds)
```
assets/lib/kenney-interface-sounds/
  click_001.ogg - click_005.ogg      -> Button clicks
  confirmation_001.ogg - _004.ogg    -> Confirm actions
  back_001.ogg - back_004.ogg        -> Cancel/back
  close_001.ogg - close_004.ogg      -> Close menus
  error_001.ogg - error_008.ogg      -> Error feedback
  drop_001.ogg - drop_004.ogg        -> Item drop
  bong_001.ogg                       -> Alert sound
```

#### Impact Sounds (130 sounds)
```
assets/lib/kenney-impact-sounds/
  impactBell_*.ogg                   -> Metal impact
  impactGlass_*.ogg                  -> Glass break
  impactMetal_*.ogg                  -> Metal collision
  impactMining_*.ogg                 -> Rock mining
  impactPlank_*.ogg                  -> Wood collision
  impactPlate_*.ogg                  -> Ceramic impact
  impactPunch_*.ogg                  -> Soft impact
  impactSoft_*.ogg                   -> Cushioned impact
  impactTin_*.ogg                    -> Tin can sounds
  impactWood_*.ogg                   -> Wood impact
  footstep_*_*.ogg                   -> Various surfaces
```

**Recommendation**: Use `impactWood_*.ogg` for log collisions, `impactSoft_*.ogg` for water splashes.

#### Music Loops (19 tracks)
```
assets/lib/kenney-music-loops/
  Flowing Rocks.ogg       -> Currently used (gameplay)
  Night at the Beach.ogg  -> Currently used (ambient)
  Game Over.ogg           -> Currently used (game over)
  Farm Frolics.ogg        -> Alternative upbeat track
  Cheerful Annoyance.ogg  -> Alternative playful track
  Mishief Stroll.ogg      -> Alternative adventure track
  Space Cadet.ogg         -> Alternative for special mode
  Wacky Waiting.ogg       -> Menu music alternative
```

### High-Value Unused: Textures

#### Sand Textures (for tropical riverbanks)
```
assets/lib/ambientcg-1k/Sand*/
  Sand001 - Sand007       -> Beach sand varieties
```

#### Moss Textures (for forest riverbanks)
```
assets/lib/ambientcg-1k/Moss*/
  Moss001 - Moss004       -> Mossy rock textures
```

#### Water Textures
```
assets/lib/ambientcg-1k/Water*/
  Water001 - Water007     -> Water surface textures
```

---

## Asset Integration Guide

### Adding a New 3D Model

1. **Copy to assets folder**:
   ```bash
   cp assets/lib/kenney-watercraft/boat-row-small.glb \
      assets/models/obstacle/boat/
   ```

2. **Register in Asset Registry** (`src/game/assets/AssetRegistry.ts`):
   ```typescript
   obstacles: {
     boatSmall: {
       path: 'models/obstacle/boat/boat-row-small.glb',
       source: 'kenney' as const,
       scale: 0.8,
     },
   },
   ```

3. **Add to spawner configuration** if needed.

### Adding New PBR Textures

1. **Copy texture set** (all maps):
   ```bash
   mkdir -p assets/textures/pbr/sand/Sand001
   cp assets/lib/ambientcg-1k/Sand001/*_Color.jpg \
      assets/textures/pbr/sand/Sand001/
   cp assets/lib/ambientcg-1k/Sand001/*_NormalGL.jpg \
      assets/textures/pbr/sand/Sand001/
   # etc.
   ```

2. **Register in biome-assets.ts** for the appropriate biome.

### Adding UI Elements

1. **Copy PNG assets**:
   ```bash
   mkdir -p assets/ui/panels
   cp "assets/lib/kenney-ui-fantasy-borders/PNG/Default/Panel/"* \
      assets/ui/panels/
   ```

2. **Use in NativeWind components** with `Image` or as 9-slice backgrounds.

---

## Licensing & Attribution

### CC0 1.0 Universal (Public Domain)

All assets from these sources are CC0 licensed:

| Source | Website | Assets Used |
|--------|---------|-------------|
| **Kenney** | https://kenney.nl | 3D models, UI, Audio |
| **AmbientCG** | https://ambientcg.com | PBR textures |
| **Quaternius** | https://quaternius.com | 3D models |

**Attribution is not required** but appreciated:
- Kenney: "Assets by Kenney (www.kenney.nl)"
- AmbientCG: "Textures from ambientCG.com"
- Quaternius: "Models by Quaternius"

### Meshy AI (Custom License)

Player otter models generated via Meshy AI have custom licensing terms per their TOS.

---

## Inventory Summary

| Category | Available | In Use | Unused |
|----------|-----------|--------|--------|
| 3D Models (Kenney) | ~500+ | ~60 | ~440+ |
| PBR Textures (AmbientCG) | 1947 | ~15 | ~1932 |
| Audio Files (Kenney) | ~900 | 6 (procedural) | ~894 |
| UI Assets (Kenney) | ~300+ | 0 | ~300+ |

---

## Recommendations

### Immediate Value (Low Effort)

1. **Add Watercraft Obstacles**: Copy 2-3 boat GLBs for obstacle variety
2. **Add More UI Sounds**: Copy interface sounds for richer feedback
3. **Add Impact Sounds**: Use wood/soft impacts for collisions

### Medium Value (Medium Effort)

4. **Implement 9-Slice Panels**: Use Fantasy UI Borders for menus
5. **Add Mobile Touch Controls**: Use Onscreen Controls sprites
6. **Add More Biome Textures**: Sand for tropical, Moss for forest

### Future Value (Higher Effort)

7. **Quaternius High-Poly Mode**: Option for desktop users
8. **Additional Music Tracks**: Per-biome music variations
9. **Seasonal Themes**: Holiday Kit assets for events
