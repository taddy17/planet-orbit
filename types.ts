
export type GameState = 'login' | 'start' | 'playing' | 'gameOver';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type MoonSkin = 'default' | 'crater' | 'tech' | 'smooth';

export interface PlayerSettings {
  planetColor: string;
  moonColor: string;
  trailColor: string; // New
  moonSkin: MoonSkin; // New
  difficulty: Difficulty;
  displayName?: string;
  highScore: number;
  hasSeenTutorial?: boolean;
}

export interface LeaderboardEntry {
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
