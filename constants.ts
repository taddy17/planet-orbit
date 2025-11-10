
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
