
export type GameState = 'login' | 'start' | 'playing' | 'gameOver';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface PlayerSettings {
  planetColor: string;
  moonColor: string;
  difficulty: Difficulty;
}

export interface Asteroid {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  color: string;
  stroke: string;
}

export interface LeaderboardEntry {
  userId: string;
  score: number;
  createdAt: any; 
}
