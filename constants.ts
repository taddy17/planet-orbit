
import type { Difficulty } from './types';

export const DIFFICULTY_SETTINGS: Record<Difficulty, {
    initialSpawnInterval: number;
    minSpawnInterval: number;
    baseSpeed: number;
    scoreDivider: number;
}> = {
    easy: {
        initialSpawnInterval: 120, // Slower spawn
        minSpawnInterval: 50,
        baseSpeed: 1.2, // Slower asteroids
        scoreDivider: 2500
    },
    normal: {
        initialSpawnInterval: 100,
        minSpawnInterval: 30,
        baseSpeed: 1.5,
        scoreDivider: 2000
    },
    hard: {
        initialSpawnInterval: 80, // Faster spawn
        minSpawnInterval: 20,
        baseSpeed: 1.8, // Faster asteroids
        scoreDivider: 1500
    }
};

export const LEVELS = [
    // Level 1: Very easy start
    { threshold: 0, speedMultiplier: 1.0, spawnMultiplier: 2.0 },
    // Level 2
    { threshold: 150, speedMultiplier: 1.05, spawnMultiplier: 1.5 },
    // Level 3
    { threshold: 450, speedMultiplier: 1.1, spawnMultiplier: 1.2 },
    // Level 4: Reaches original difficulty
    { threshold: 900, speedMultiplier: 1.15, spawnMultiplier: 1.0 },
    // Level 5
    { threshold: 1500, speedMultiplier: 1.2, spawnMultiplier: 0.9 },
    // Level 6
    { threshold: 2300, speedMultiplier: 1.25, spawnMultiplier: 0.8 },
    // Level 7
    { threshold: 3300, speedMultiplier: 1.3, spawnMultiplier: 0.75 },
    // Level 8
    { threshold: 4500, speedMultiplier: 1.35, spawnMultiplier: 0.7 },
    // Level 9
    { threshold: 6000, speedMultiplier: 1.4, spawnMultiplier: 0.65 },
     // Level 10
    { threshold: 7800, speedMultiplier: 1.45, spawnMultiplier: 0.6 },
];