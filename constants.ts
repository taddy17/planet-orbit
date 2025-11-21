
import type { Difficulty } from './types';

export const DIFFICULTY_SETTINGS: Record<Difficulty, {
    initialSpawnInterval: number;
    minSpawnInterval: number;
    baseSpeed: number;
    scoreDivider: number;
}> = {
    easy: {
        initialSpawnInterval: 90, 
        minSpawnInterval: 40,     
        baseSpeed: 2.0,           
        scoreDivider: 2500
    },
    normal: {
        initialSpawnInterval: 60, 
        minSpawnInterval: 25,     
        baseSpeed: 3.0,           
        scoreDivider: 2000
    },
    hard: {
        initialSpawnInterval: 45, 
        minSpawnInterval: 15,     
        baseSpeed: 4.0,           
        scoreDivider: 1500
    }
};

export const LEVELS = [
    // Level 1: Start
    { threshold: 0, speedMultiplier: 1.0, spawnMultiplier: 1.0 },
    // Level 2: Ramps up quicker
    { threshold: 100, speedMultiplier: 1.1, spawnMultiplier: 1.0 }, 
    // Level 3
    { threshold: 300, speedMultiplier: 1.2, spawnMultiplier: 0.9 },
    // Level 4
    { threshold: 600, speedMultiplier: 1.3, spawnMultiplier: 0.85 },
    // Level 5
    { threshold: 1000, speedMultiplier: 1.4, spawnMultiplier: 0.8 },
    // Level 6
    { threshold: 1500, speedMultiplier: 1.5, spawnMultiplier: 0.75 },
    // Level 7
    { threshold: 2200, speedMultiplier: 1.6, spawnMultiplier: 0.7 },
    // Level 8
    { threshold: 3000, speedMultiplier: 1.7, spawnMultiplier: 0.65 },
    // Level 9
    { threshold: 4000, speedMultiplier: 1.8, spawnMultiplier: 0.6 },
     // Level 10
    { threshold: 5500, speedMultiplier: 2.0, spawnMultiplier: 0.5 },
];