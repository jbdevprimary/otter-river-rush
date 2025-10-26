export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  LANE_COUNT: 3,
  LANE_WIDTH: 200,
  LANE_OFFSET: 100,
  SCROLL_SPEED: 500, // Much faster - racing down river!
  MIN_SCROLL_SPEED: 500,
  MAX_SCROLL_SPEED: 1200, // Can get VERY fast
  DIFFICULTY_INCREASE_RATE: 0.05,
  DIFFICULTY_INCREASE_INTERVAL: 10000,
};

export const OTTER_CONFIG = {
  WIDTH: 100, // Much bigger and more visible!
  HEIGHT: 100,
  MOVE_SPEED: 800, // Super fast lane changes for swipe feel
  START_LANE: 1,
};

export const ROCK_CONFIG = {
  WIDTH: 50,
  HEIGHT: 50,
  MIN_SPAWN_DISTANCE: 400,
  MAX_SPAWN_DISTANCE: 800,
};

export const PARTICLE_CONFIG = {
  LIFETIME: 1000,
  COUNT: 10,
  SPEED: 100,
};

export const POWERUP_CONFIG = {
  WIDTH: 40,
  HEIGHT: 40,
  SPAWN_CHANCE: 0.15,
  DURATION: 5000,
};

export enum PowerUpType {
  SHIELD = 'shield',
  CONTROL_BOOST = 'control_boost', // Formerly SPEED_BOOST
  SCORE_MULTIPLIER = 'score_multiplier',
  MAGNET = 'magnet',
  GHOST = 'ghost',
  SLOW_MOTION = 'slow_motion',
}

export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
}

export enum GameMode {
  CLASSIC = 'classic',
  TIME_TRIAL = 'time_trial',
  ZEN = 'zen',
  DAILY_CHALLENGE = 'daily_challenge',
}

export const COIN_CONFIG = {
  WIDTH: 30,
  HEIGHT: 30,
  SPAWN_CHANCE: 0.4, // Higher chance than powerups
  BRONZE_CHANCE: 0.7,
  SILVER_CHANCE: 0.25,
  GOLD_CHANCE: 0.05,
};

export const GEM_CONFIG = {
  WIDTH: 35,
  HEIGHT: 35,
  SPAWN_CHANCE: 0.1, // Rarer than coins
  BLUE_CHANCE: 0.7,
  RED_CHANCE: 0.25,
  RAINBOW_CHANCE: 0.05,
};

export const MAGNET_CONFIG = {
  RADIUS: 150, // Collection radius when active
  DURATION: 8000, // 8 seconds
};

export const GHOST_CONFIG = {
  DURATION: 5000, // 5 seconds
  ALPHA: 0.5, // Transparency when ghosted
};

export const SLOW_MOTION_CONFIG = {
  DURATION: 6000, // 6 seconds
  SPEED_MULTIPLIER: 0.3, // 70% slower
};
