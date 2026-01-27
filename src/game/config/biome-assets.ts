/**
 * Biome Asset Configuration
 * Maps 3D models and PBR textures to each game biome
 * Assets sourced from Kenney Nature Kit and AmbientCG
 */

import type { BiomeType } from '../types';

// Base paths for assets
const MODEL_BASE = '/assets/models/environment';
const TEXTURE_BASE = '/assets/textures/pbr';

/**
 * 3D Model definition with path and scale
 */
export interface ModelAsset {
  path: string;
  scale: number;
  /** Rotation offset in radians [x, y, z] */
  rotation?: [number, number, number];
}

/**
 * PBR Texture set with all map types
 */
export interface PBRTexture {
  color: string;
  normal: string;
  roughness: string;
  displacement?: string;
}

/**
 * Biome-specific asset configuration
 */
export interface BiomeAssets {
  /** Trees and large vegetation for riverbanks */
  trees: ModelAsset[];
  /** Rocks and obstacles */
  rocks: ModelAsset[];
  /** Small plants and ground cover */
  plants: ModelAsset[];
  /** Decorative elements */
  decorations: ModelAsset[];
  /** PBR textures for terrain */
  terrainTextures: PBRTexture[];
  /** PBR textures for riverbanks */
  riverbankTextures: PBRTexture[];
  /** Ambient color for fog/atmosphere */
  fogColor: string;
  /** Water color tint */
  waterColor: string;
  /** Sky gradient colors [top, bottom] */
  skyColors: [string, string];
}

/**
 * Forest Biome - Lush green trees, mossy rocks, ferns
 */
const FOREST_ASSETS: BiomeAssets = {
  trees: [
    { path: `${MODEL_BASE}/forest/tree_default.glb`, scale: 1.5 },
    { path: `${MODEL_BASE}/forest/tree_tall.glb`, scale: 1.2 },
    { path: `${MODEL_BASE}/forest/tree_small.glb`, scale: 1.0 },
    { path: `${MODEL_BASE}/forest/tree_pineDefaultA.glb`, scale: 1.3 },
    { path: `${MODEL_BASE}/forest/tree_pineRoundA.glb`, scale: 1.4 },
  ],
  rocks: [
    { path: `${MODEL_BASE}/shared/rock_smallC.glb`, scale: 0.8 },
    { path: `${MODEL_BASE}/shared/rock_smallD.glb`, scale: 0.9 },
    { path: `${MODEL_BASE}/shared/rock_smallE.glb`, scale: 0.7 },
  ],
  plants: [
    { path: `${MODEL_BASE}/forest/grass.glb`, scale: 0.6 },
    { path: `${MODEL_BASE}/forest/grass_large.glb`, scale: 0.8 },
    { path: `${MODEL_BASE}/forest/mushroom_red.glb`, scale: 0.5 },
    { path: `${MODEL_BASE}/forest/mushroom_tan.glb`, scale: 0.5 },
    { path: `${MODEL_BASE}/forest/flower_purpleA.glb`, scale: 0.4 },
    { path: `${MODEL_BASE}/forest/flower_yellowA.glb`, scale: 0.4 },
  ],
  decorations: [
    { path: `${MODEL_BASE}/forest/log.glb`, scale: 1.0 },
    { path: `${MODEL_BASE}/forest/log_large.glb`, scale: 1.2 },
    { path: `${MODEL_BASE}/shared/stump_round.glb`, scale: 0.8 },
    { path: `${MODEL_BASE}/shared/stump_old.glb`, scale: 0.9 },
    { path: `${MODEL_BASE}/shared/lily_small.glb`, scale: 0.6 },
    { path: `${MODEL_BASE}/shared/lily_large.glb`, scale: 0.8 },
  ],
  terrainTextures: [
    {
      color: `${TEXTURE_BASE}/grass/Grass001/Grass001_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/grass/Grass001/Grass001_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/grass/Grass001/Grass001_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/grass/Grass001/Grass001_1K-JPG_Displacement.jpg`,
    },
    {
      color: `${TEXTURE_BASE}/grass/Grass004/Grass004_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/grass/Grass004/Grass004_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/grass/Grass004/Grass004_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/grass/Grass004/Grass004_1K-JPG_Displacement.jpg`,
    },
  ],
  riverbankTextures: [
    {
      color: `${TEXTURE_BASE}/ground/Ground037/Ground037_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/ground/Ground037/Ground037_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/ground/Ground037/Ground037_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/ground/Ground037/Ground037_1K-JPG_Displacement.jpg`,
    },
  ],
  fogColor: '#8fbc8f',
  waterColor: '#4a9079',
  skyColors: ['#87ceeb', '#e0f7fa'],
};

/**
 * Canyon Biome - Red/orange rocks, desert plants, sandy terrain
 */
const CANYON_ASSETS: BiomeAssets = {
  trees: [
    { path: `${MODEL_BASE}/canyon/cactus_tall.glb`, scale: 1.5 },
    { path: `${MODEL_BASE}/canyon/cactus_short.glb`, scale: 1.0 },
  ],
  rocks: [
    { path: `${MODEL_BASE}/canyon/rock_largeA.glb`, scale: 1.5 },
    { path: `${MODEL_BASE}/canyon/rock_largeB.glb`, scale: 1.4 },
    { path: `${MODEL_BASE}/canyon/rock_tallA.glb`, scale: 1.8 },
    { path: `${MODEL_BASE}/canyon/rock_tallB.glb`, scale: 1.6 },
    { path: `${MODEL_BASE}/canyon/stone_largeA.glb`, scale: 1.3 },
    { path: `${MODEL_BASE}/canyon/stone_tallA.glb`, scale: 1.5 },
  ],
  plants: [],
  decorations: [
    { path: `${MODEL_BASE}/canyon/cliff_block_rock.glb`, scale: 2.0 },
    { path: `${MODEL_BASE}/shared/rock_smallC.glb`, scale: 0.6 },
  ],
  terrainTextures: [
    {
      color: `${TEXTURE_BASE}/rock/Rock005/Rock005_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/rock/Rock005/Rock005_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/rock/Rock005/Rock005_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/rock/Rock005/Rock005_1K-JPG_Displacement.jpg`,
    },
    {
      color: `${TEXTURE_BASE}/rock/Rock020/Rock020_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/rock/Rock020/Rock020_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/rock/Rock020/Rock020_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/rock/Rock020/Rock020_1K-JPG_Displacement.jpg`,
    },
  ],
  riverbankTextures: [
    {
      color: `${TEXTURE_BASE}/gravel/Gravel022/Gravel022_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/gravel/Gravel022/Gravel022_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/gravel/Gravel022/Gravel022_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/gravel/Gravel022/Gravel022_1K-JPG_Displacement.jpg`,
    },
  ],
  fogColor: '#d2691e',
  waterColor: '#8b7355',
  skyColors: ['#ff7f50', '#ffd700'],
};

/**
 * Arctic Biome - Snow, ice, frozen elements
 */
const ARCTIC_ASSETS: BiomeAssets = {
  trees: [
    { path: `${MODEL_BASE}/arctic/tree_pineSmallA.glb`, scale: 1.2 },
    { path: `${MODEL_BASE}/arctic/tree_pineSmallB.glb`, scale: 1.0 },
    { path: `${MODEL_BASE}/arctic/tree_cone.glb`, scale: 1.5 },
  ],
  rocks: [
    { path: `${MODEL_BASE}/arctic/rock_smallA.glb`, scale: 1.0 },
    { path: `${MODEL_BASE}/arctic/rock_smallB.glb`, scale: 0.9 },
    { path: `${MODEL_BASE}/arctic/stone_smallA.glb`, scale: 0.8 },
  ],
  plants: [],
  decorations: [
    { path: `${MODEL_BASE}/shared/rock_smallC.glb`, scale: 0.5 },
    { path: `${MODEL_BASE}/shared/rock_smallD.glb`, scale: 0.6 },
  ],
  terrainTextures: [
    {
      color: `${TEXTURE_BASE}/snow/Snow001/Snow001_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/snow/Snow001/Snow001_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/snow/Snow001/Snow001_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/snow/Snow001/Snow001_1K-JPG_Displacement.jpg`,
    },
    {
      color: `${TEXTURE_BASE}/snow/Snow006/Snow006_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/snow/Snow006/Snow006_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/snow/Snow006/Snow006_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/snow/Snow006/Snow006_1K-JPG_Displacement.jpg`,
    },
  ],
  riverbankTextures: [
    {
      color: `${TEXTURE_BASE}/ice/Ice001/Ice001_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/ice/Ice001/Ice001_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/ice/Ice001/Ice001_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/ice/Ice001/Ice001_1K-JPG_Displacement.jpg`,
    },
    {
      color: `${TEXTURE_BASE}/ice/Ice002/Ice002_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/ice/Ice002/Ice002_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/ice/Ice002/Ice002_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/ice/Ice002/Ice002_1K-JPG_Displacement.jpg`,
    },
  ],
  fogColor: '#b0e0e6',
  waterColor: '#4682b4',
  skyColors: ['#e6f3ff', '#b0c4de'],
};

/**
 * Tropical Biome - Palm trees, vibrant colors, beach elements
 */
const TROPICAL_ASSETS: BiomeAssets = {
  trees: [
    { path: `${MODEL_BASE}/tropical/tree_palm.glb`, scale: 1.5 },
    { path: `${MODEL_BASE}/tropical/tree_palmBend.glb`, scale: 1.4 },
    { path: `${MODEL_BASE}/tropical/tree_palmTall.glb`, scale: 1.8 },
    { path: `${MODEL_BASE}/tropical/tree_palmDetailedShort.glb`, scale: 1.2 },
    { path: `${MODEL_BASE}/tropical/tree_palmDetailedTall.glb`, scale: 1.6 },
  ],
  rocks: [
    { path: `${MODEL_BASE}/shared/rock_smallC.glb`, scale: 0.7 },
    { path: `${MODEL_BASE}/shared/rock_smallD.glb`, scale: 0.8 },
  ],
  plants: [
    { path: `${MODEL_BASE}/tropical/flower_redA.glb`, scale: 0.5 },
    { path: `${MODEL_BASE}/tropical/plant_bushLarge.glb`, scale: 0.8 },
  ],
  decorations: [
    { path: `${MODEL_BASE}/shared/lily_small.glb`, scale: 0.7 },
    { path: `${MODEL_BASE}/shared/lily_large.glb`, scale: 0.9 },
  ],
  terrainTextures: [
    {
      color: `${TEXTURE_BASE}/grass/Grass004/Grass004_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/grass/Grass004/Grass004_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/grass/Grass004/Grass004_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/grass/Grass004/Grass004_1K-JPG_Displacement.jpg`,
    },
  ],
  riverbankTextures: [
    {
      color: `${TEXTURE_BASE}/ground/Ground054/Ground054_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/ground/Ground054/Ground054_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/ground/Ground054/Ground054_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/ground/Ground054/Ground054_1K-JPG_Displacement.jpg`,
    },
  ],
  fogColor: '#98fb98',
  waterColor: '#40e0d0',
  skyColors: ['#00bfff', '#7fffd4'],
};

/**
 * Volcanic Biome - Lava, dark rocks, fire elements
 */
const VOLCANIC_ASSETS: BiomeAssets = {
  trees: [],
  rocks: [
    { path: `${MODEL_BASE}/volcanic/rock_largeC.glb`, scale: 1.6 },
    { path: `${MODEL_BASE}/volcanic/rock_largeD.glb`, scale: 1.5 },
    { path: `${MODEL_BASE}/volcanic/rock_tallC.glb`, scale: 1.8 },
    { path: `${MODEL_BASE}/volcanic/stone_largeB.glb`, scale: 1.4 },
  ],
  plants: [],
  decorations: [
    { path: `${MODEL_BASE}/volcanic/cliff_block_stone.glb`, scale: 2.0 },
    { path: `${MODEL_BASE}/shared/rock_smallE.glb`, scale: 0.7 },
  ],
  terrainTextures: [
    {
      color: `${TEXTURE_BASE}/rock/Rock001/Rock001_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/rock/Rock001/Rock001_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/rock/Rock001/Rock001_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/rock/Rock001/Rock001_1K-JPG_Displacement.jpg`,
    },
  ],
  riverbankTextures: [
    {
      color: `${TEXTURE_BASE}/lava/Lava001/Lava001_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/lava/Lava001/Lava001_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/lava/Lava001/Lava001_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/lava/Lava001/Lava001_1K-JPG_Displacement.jpg`,
    },
    {
      color: `${TEXTURE_BASE}/lava/Lava004/Lava004_1K-JPG_Color.jpg`,
      normal: `${TEXTURE_BASE}/lava/Lava004/Lava004_1K-JPG_NormalGL.jpg`,
      roughness: `${TEXTURE_BASE}/lava/Lava004/Lava004_1K-JPG_Roughness.jpg`,
      displacement: `${TEXTURE_BASE}/lava/Lava004/Lava004_1K-JPG_Displacement.jpg`,
    },
  ],
  fogColor: '#8b0000',
  waterColor: '#ff4500',
  skyColors: ['#2f1010', '#8b0000'],
};

/**
 * Map of biome to asset configuration
 */
export const BIOME_ASSETS: Record<BiomeType, BiomeAssets> = {
  forest: FOREST_ASSETS,
  canyon: CANYON_ASSETS,
  arctic: ARCTIC_ASSETS,
  tropical: TROPICAL_ASSETS,
  volcanic: VOLCANIC_ASSETS,
};

/**
 * Get asset configuration for a specific biome
 */
export function getBiomeAssets(biome: BiomeType): BiomeAssets {
  return BIOME_ASSETS[biome];
}

/**
 * Get a random tree model for a biome
 */
export function getRandomTree(biome: BiomeType): ModelAsset | null {
  const assets = BIOME_ASSETS[biome];
  if (assets.trees.length === 0) return null;
  return assets.trees[Math.floor(Math.random() * assets.trees.length)];
}

/**
 * Get a random rock model for a biome
 */
export function getRandomRock(biome: BiomeType): ModelAsset | null {
  const assets = BIOME_ASSETS[biome];
  if (assets.rocks.length === 0) return null;
  return assets.rocks[Math.floor(Math.random() * assets.rocks.length)];
}

/**
 * Get a random plant model for a biome
 */
export function getRandomPlant(biome: BiomeType): ModelAsset | null {
  const assets = BIOME_ASSETS[biome];
  if (assets.plants.length === 0) return null;
  return assets.plants[Math.floor(Math.random() * assets.plants.length)];
}

/**
 * Get a random decoration model for a biome
 */
export function getRandomDecoration(biome: BiomeType): ModelAsset | null {
  const assets = BIOME_ASSETS[biome];
  if (assets.decorations.length === 0) return null;
  return assets.decorations[Math.floor(Math.random() * assets.decorations.length)];
}

/**
 * Get all model paths for preloading
 */
export function getAllModelPaths(): string[] {
  const paths = new Set<string>();

  for (const biome of Object.values(BIOME_ASSETS)) {
    for (const tree of biome.trees) paths.add(tree.path);
    for (const rock of biome.rocks) paths.add(rock.path);
    for (const plant of biome.plants) paths.add(plant.path);
    for (const decoration of biome.decorations) paths.add(decoration.path);
  }

  return Array.from(paths);
}

/**
 * Get all texture paths for preloading
 */
export function getAllTexturePaths(): string[] {
  const paths = new Set<string>();

  for (const biome of Object.values(BIOME_ASSETS)) {
    for (const tex of biome.terrainTextures) {
      paths.add(tex.color);
      paths.add(tex.normal);
      paths.add(tex.roughness);
      if (tex.displacement) paths.add(tex.displacement);
    }
    for (const tex of biome.riverbankTextures) {
      paths.add(tex.color);
      paths.add(tex.normal);
      paths.add(tex.roughness);
      if (tex.displacement) paths.add(tex.displacement);
    }
  }

  return Array.from(paths);
}
