
import type { Difficulty, StoreItem } from './types';

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

export const STORE_ITEMS: StoreItem[] = [
    // --- SKINS ---
    {
        id: 'skin_default',
        category: 'skin',
        name: 'Classic Moon',
        description: 'Standard issue lunarlander hull.',
        price: 0,
        value: 'default',
        settingKey: 'moonSkin'
    },
    {
        id: 'skin_smooth',
        category: 'skin',
        name: 'Polished Orb',
        description: 'Aerodynamic and shiny.',
        price: 200,
        value: 'smooth',
        settingKey: 'moonSkin'
    },
    {
        id: 'skin_crater',
        category: 'skin',
        name: 'Battle Worn',
        description: 'Takes a beating and keeps orbiting.',
        price: 500,
        value: 'crater',
        settingKey: 'moonSkin'
    },
    {
        id: 'skin_ice',
        category: 'skin',
        name: 'Cryo Sphere',
        description: 'Frozen solid. Chillingly cool.',
        price: 1500,
        value: 'ice',
        settingKey: 'moonSkin'
    },
    {
        id: 'skin_tech',
        category: 'skin',
        name: 'Cyber Core',
        description: 'High-tech geometric shielding.',
        price: 2500,
        value: 'tech',
        settingKey: 'moonSkin'
    },
    {
        id: 'skin_camo',
        category: 'skin',
        name: 'Space Camo',
        description: 'Tactical stealth plating.',
        price: 5000,
        value: 'camo',
        settingKey: 'moonSkin'
    },
    {
        id: 'skin_golden',
        category: 'skin',
        name: 'Golden Eclipse',
        description: 'The ultimate status symbol. Pure 24k gold.',
        price: 100000,
        value: 'golden',
        settingKey: 'moonSkin'
    },

    // --- PLANETS ---
    {
        id: 'planet_default',
        category: 'planet',
        name: 'Terra Blue',
        description: 'A habitable home world.',
        price: 0,
        value: '#0ea5e9',
        settingKey: 'planetColor'
    },
    {
        id: 'planet_mars',
        category: 'planet',
        name: 'Red Giant',
        description: 'Hot, dusty, and red.',
        price: 300,
        value: '#ef4444',
        settingKey: 'planetColor'
    },
    {
        id: 'planet_toxic',
        category: 'planet',
        name: 'Toxic Waste',
        description: 'Radioactive green glow.',
        price: 450,
        value: '#22c55e',
        settingKey: 'planetColor'
    },
    {
        id: 'planet_void',
        category: 'planet',
        name: 'Void Heart',
        description: 'Dark matter concentration.',
        price: 800,
        value: '#6b21a8',
        settingKey: 'planetColor'
    },
    {
        id: 'planet_ice_giant',
        category: 'planet',
        name: 'Ice Giant',
        description: 'Sub-zero temperatures.',
        price: 2000,
        value: '#cffafe',
        settingKey: 'planetColor'
    },
    {
        id: 'planet_sun',
        category: 'planet',
        name: 'Solar Flare',
        description: 'Blindingly bright star.',
        price: 5000,
        value: '#fb923c',
        settingKey: 'planetColor'
    },
    {
        id: 'planet_neon',
        category: 'planet',
        name: 'Cyber Neon',
        description: 'Synthetic vaporwave aesthetics.',
        price: 10000,
        value: '#f0abfc',
        settingKey: 'planetColor'
    },
    {
        id: 'planet_gold',
        category: 'planet',
        name: 'Midas Touch',
        description: 'Solid gold planet core.',
        price: 50000,
        value: '#fbbf24',
        settingKey: 'planetColor'
    },

    // --- TRAILS ---
    {
        id: 'trail_default',
        category: 'trail',
        name: 'Ion Blue',
        description: 'Standard propulsion.',
        price: 0,
        value: '#38bdf8',
        settingKey: 'trailColor'
    },
    {
        id: 'trail_dust',
        category: 'trail',
        name: 'Stardust',
        description: 'Leave a trail of cosmic dust.',
        price: 200,
        value: 'dust',
        settingKey: 'trailColor'
    },
    {
        id: 'trail_flame',
        category: 'trail',
        name: 'Solar Flare',
        description: 'Burning hot exhaust particles.',
        price: 500,
        value: 'flame',
        settingKey: 'trailColor'
    },
    {
        id: 'trail_ice',
        category: 'trail',
        name: 'Ice Shards',
        description: 'Crystallized frozen vapor.',
        price: 1200,
        value: 'ice',
        settingKey: 'trailColor'
    },
    {
        id: 'trail_laser',
        category: 'trail',
        name: 'Quantum Laser',
        description: 'A solid beam of pure energy.',
        price: 3000,
        value: 'laser',
        settingKey: 'trailColor'
    },
    {
        id: 'trail_rainbow',
        category: 'trail',
        name: 'Rainbow Road',
        description: 'RGB Gamer propulsion.',
        price: 25000,
        value: 'rainbow',
        settingKey: 'trailColor'
    },

    // --- BACKGROUNDS ---
    {
        id: 'bg_deep',
        category: 'background',
        name: 'Deep Space',
        description: 'Sparse stars, dark void.',
        price: 0,
        value: 'deep_space',
        settingKey: 'background'
    },
    {
        id: 'bg_starfield',
        category: 'background',
        name: 'Star Field',
        description: 'A dense cluster of stars.',
        price: 400,
        value: 'star_field',
        settingKey: 'background'
    },
    {
        id: 'bg_nebula',
        category: 'background',
        name: 'Nebula Storm',
        description: 'Colorful clouds of gas.',
        price: 1200,
        value: 'nebula_storm',
        settingKey: 'background'
    },
    {
        id: 'bg_void',
        category: 'background',
        name: 'The Void',
        description: 'Pitch black. Minimal distractions.',
        price: 2500,
        value: 'void',
        settingKey: 'background'
    },
    {
        id: 'bg_grid',
        category: 'background',
        name: 'Cyber Grid',
        description: 'Retro-futuristic simulation.',
        price: 15000,
        value: 'cyber_grid',
        settingKey: 'background'
    }
];
