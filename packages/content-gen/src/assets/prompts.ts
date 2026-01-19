/**
 * Asset Generation Prompts
 *
 * Pre-defined prompts for generating Otter River Rush game assets.
 * Each prompt is crafted for optimal Meshy text-to-3D results.
 */

export interface AssetPrompt {
  id: string;
  category: 'player' | 'obstacle' | 'collectible' | 'decoration';
  prompt: string;
  negativePrompt?: string;
  artStyle: 'pbr' | 'realistic' | 'sculpture';
  targetPolycount: number;
}

// ============================================================================
// PLAYER ASSETS
// ============================================================================

export const PLAYER_PROMPTS: AssetPrompt[] = [
  {
    id: 'otter-player',
    category: 'player',
    prompt: 'Cute stylized river otter swimming, brown fur, white belly, webbed feet, happy expression, game character, low poly style, chibi proportions, cartoon look',
    negativePrompt: 'scary, dark, detailed fur texture, hyper realistic',
    artStyle: 'sculpture',
    targetPolycount: 5000,
  },
  {
    id: 'otter-silver',
    category: 'player',
    prompt: 'Cute stylized river otter swimming pose, sleek silver-gray fur coat, fluffy round body, small ears, whiskers, flat paddle tail, webbed feet, wise calm expression, night theme, game character, chibi proportions, low poly cartoon style',
    negativePrompt: 'realistic fur texture, scary, dark, detailed, hyper realistic, human features',
    artStyle: 'sculpture',
    targetPolycount: 5000,
  },
  {
    id: 'otter-golden',
    category: 'player',
    prompt: 'Cute stylized river otter swimming pose, brilliant shimmering golden fur coat, fluffy round body, small ears, whiskers, flat paddle tail, webbed feet, majestic regal expression, sparkle effect, game character, chibi proportions, low poly cartoon style',
    negativePrompt: 'realistic fur texture, scary, dark, detailed, hyper realistic, human features, tarnished',
    artStyle: 'sculpture',
    targetPolycount: 5000,
  },
  {
    id: 'otter-arctic',
    category: 'player',
    prompt: 'Cute stylized arctic river otter swimming pose, extra fluffy pure white fur, round body, small rounded ears, whiskers, flat paddle tail, webbed feet, playful friendly expression, winter theme, game character, chibi proportions, low poly cartoon style',
    negativePrompt: 'realistic fur texture, scary, dark, detailed, hyper realistic, human features, dirty',
    artStyle: 'sculpture',
    targetPolycount: 5000,
  },
];

// ============================================================================
// OBSTACLE ASSETS
// ============================================================================

export const OBSTACLE_PROMPTS: AssetPrompt[] = [
  {
    id: 'rock-large',
    category: 'obstacle',
    prompt: 'Large gray river rock, smooth rounded boulder, moss patches, game obstacle, stylized look, low poly',
    negativePrompt: 'sharp edges, crystal, gem',
    artStyle: 'sculpture',
    targetPolycount: 2000,
  },
  {
    id: 'rock-medium',
    category: 'obstacle',
    prompt: 'Medium sized river rock, rounded stone, wet appearance, stylized game asset, low poly',
    negativePrompt: 'sharp edges, detailed texture',
    artStyle: 'sculpture',
    targetPolycount: 1500,
  },
  {
    id: 'rock-small',
    category: 'obstacle',
    prompt: 'Small river pebble rock, smooth oval stone, stylized game asset, simple design',
    artStyle: 'sculpture',
    targetPolycount: 1000,
  },
  {
    id: 'log-floating',
    category: 'obstacle',
    prompt: 'Floating wooden log in river, brown bark texture, stylized, game obstacle, horizontal orientation',
    negativePrompt: 'detailed bark, realistic wood grain',
    artStyle: 'sculpture',
    targetPolycount: 2000,
  },
  {
    id: 'branch-floating',
    category: 'obstacle',
    prompt: 'Floating tree branch in water, simple stylized wood, small twigs, game asset',
    artStyle: 'sculpture',
    targetPolycount: 1500,
  },
];

// ============================================================================
// COLLECTIBLE ASSETS
// ============================================================================

export const COLLECTIBLE_PROMPTS: AssetPrompt[] = [
  {
    id: 'coin-gold',
    category: 'collectible',
    prompt: 'Shiny gold coin, stylized, simple round coin with fish symbol, game collectible, glowing effect',
    negativePrompt: 'realistic currency, text, numbers',
    artStyle: 'pbr',
    targetPolycount: 500,
  },
  {
    id: 'gem-blue',
    category: 'collectible',
    prompt: 'Blue crystal gem, stylized diamond shape, glowing, magical, game collectible, simple facets',
    negativePrompt: 'complex geometry',
    artStyle: 'pbr',
    targetPolycount: 800,
  },
  {
    id: 'gem-green',
    category: 'collectible',
    prompt: 'Green emerald gem, stylized, hexagonal crystal, glowing center, game collectible',
    artStyle: 'pbr',
    targetPolycount: 800,
  },
  {
    id: 'gem-purple',
    category: 'collectible',
    prompt: 'Purple amethyst gem, stylized crystal cluster, magical glow, game collectible',
    artStyle: 'pbr',
    targetPolycount: 800,
  },
  {
    id: 'fish-small',
    category: 'collectible',
    prompt: 'Small stylized fish, orange and white colors, cute expression, game collectible, simple design',
    negativePrompt: 'realistic scales, detailed fins',
    artStyle: 'sculpture',
    targetPolycount: 1000,
  },
  {
    id: 'fish-golden',
    category: 'collectible',
    prompt: 'Golden stylized fish, shiny scales, happy expression, rare game collectible, magical sparkle',
    artStyle: 'pbr',
    targetPolycount: 1200,
  },
];

// ============================================================================
// DECORATION ASSETS
// ============================================================================

export const DECORATION_PROMPTS: AssetPrompt[] = [
  {
    id: 'lily-pad',
    category: 'decoration',
    prompt: 'Green lily pad floating on water, stylized, round leaf with small flower, simple game decoration',
    artStyle: 'sculpture',
    targetPolycount: 500,
  },
  {
    id: 'cattail',
    category: 'decoration',
    prompt: 'Cattail plant, brown fuzzy top, green stem and leaves, stylized wetland plant, game decoration',
    artStyle: 'sculpture',
    targetPolycount: 800,
  },
  {
    id: 'duck-rubber',
    category: 'decoration',
    prompt: 'Yellow rubber duck toy, floating, stylized, orange beak, simple cute design',
    artStyle: 'sculpture',
    targetPolycount: 1000,
  },
  {
    id: 'reed-cluster',
    category: 'decoration',
    prompt: 'Cluster of river reeds, tall green grass, stylized, swaying plants, game decoration',
    artStyle: 'sculpture',
    targetPolycount: 600,
  },
];

// ============================================================================
// ALL PROMPTS
// ============================================================================

export const ALL_PROMPTS: AssetPrompt[] = [
  ...PLAYER_PROMPTS,
  ...OBSTACLE_PROMPTS,
  ...COLLECTIBLE_PROMPTS,
  ...DECORATION_PROMPTS,
];

export function getPromptById(id: string): AssetPrompt | undefined {
  return ALL_PROMPTS.find(p => p.id === id);
}

export function getPromptsByCategory(category: AssetPrompt['category']): AssetPrompt[] {
  return ALL_PROMPTS.filter(p => p.category === category);
}
