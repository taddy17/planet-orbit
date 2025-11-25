
export type GameState = 'login' | 'start' | 'playing' | 'gameOver';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type MoonSkin = 'default' | 'crater' | 'tech' | 'smooth' | 'ice' | 'camo' | 'golden' | 'basketball' | 'beachball' | 'tennis' | 'apple';

export type BackgroundType = 'deep_space' | 'nebula_storm' | 'star_field' | 'void' | 'cyber_grid';

export interface PlayerSettings {
  planetColor: string;
  moonColor: string;
  trailColor: string; 
  moonSkin: MoonSkin;
  background: BackgroundType;
  difficulty: Difficulty;
  displayName?: string;
  highScore: number; // Legacy/Global max
  highScores: Record<Difficulty, number>; // New: Score per difficulty
  hasSeenTutorial?: boolean;
  credits: number;
  unlockedItems: string[];
  // New fields for consumables
  inventory: Record<string, number>; // item.id -> quantity
  equippedConsumable?: string; // item.id of the currently equipped powerup
}

export type StoreCategory = 'skin' | 'planet' | 'trail' | 'background' | 'consumable';

export interface StoreItem {
  id: string;
  category: StoreCategory;
  name: string;
  description: string;
  price: number;
  // The actual value to apply to settings when equipped
  value: any; 
  // Specifically for planet/trail which are colors, or skin/bg which are enums
  settingKey: keyof PlayerSettings; 
}

export interface LeaderboardEntry {
  userId?: string;
  displayName?: string;
  score: number;
  createdAt: any;
}

export interface Point {
  x: number;
  y: number;
}

export interface Crater {
  x: number; // offset from asteroid center
  y: number; // offset from asteroid center
  radius: number;
  color: string;
}

export interface Asteroid {
  x: number;
  y: number;
  radius: number; // For collision detection
  dx: number;
  dy: number;
  color: string;
  stroke: string;
  craters: Crater[];
  shape: Point[];
  nearMissPlayed?: boolean;
  curveRate?: number;
  rotation: number;
  rotationSpeed: number;
}

export interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  color: string;
  life: number; // decreases to 0
  initialLife: number;
}

export interface LevelUpAnimation {
    alpha: number;
    scale: number;
}

export interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
}

export interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  dx: number;
  dy: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
}

export type PowerUpType = 'shield' | 'speedBoost' | 'bomb';

export interface PowerUp {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  type: PowerUpType;
  life: number;
  initialLife: number;
  rotation: number;
  rotationSpeed: number;
}

export interface ActivePowerUps {
  shield: {
    active: boolean;
    endTime: number;
  };
  speedBoost: {
    active: boolean;
    endTime: number;
  };
}