
import React, { useRef, useEffect, useCallback, memo } from 'react';
import type { GameState, PlayerSettings, Asteroid, Crater, Point, Particle, LevelUpAnimation, Star, Nebula, ShootingStar, PowerUp, PowerUpType, ActivePowerUps } from '../types';
import { DIFFICULTY_SETTINGS, LEVELS } from '../constants';
import { playCollisionSound, playLevelUpSound, playPowerUpCollectSound, playBombSound, playShieldBlockSound } from '../services/sound';

interface GameCanvasProps {
  gameState: GameState;
  settings: PlayerSettings;
  onGameOver: (score: number) => void;
  setScore: (score: number) => void;
  setLevel: (level: number) => void;
  isPressing: boolean;
  isTutorialActive?: boolean;
  isPaused?: boolean;
  isHolidayMode?: boolean;
  startPowerUp?: PowerUpType; // New Prop
}

// Utility functions
const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Difficulty-based Palettes
const ASTEROID_PALETTES = {
    easy: ['#cbd5e1', '#94a3b8', '#64748b', '#e2e8f0', '#818cf8'], // Light, bluish-grey tones
    normal: ['#a1a1aa', '#84828F', '#71717a', '#78716c', '#57534e'], // Standard rocky greys
    hard: ['#451a03', '#7f1d1d', '#3f3f46', '#1c1917', '#78350f'] // Dark, aggressive reds and browns
};

const ASTEROID_STROKES_PALETTES = {
    easy: ['#e2e8f0', '#cbd5e1', '#94a3b8', '#f8fafc', '#a5b4fc'],
    normal: ['#d4d4d8', '#A9A9A9', '#a1a1aa', '#a8a29e', '#78716c'],
    hard: ['#b45309', '#b91c1c', '#52525b', '#44403c', '#9a3412']
};

const darkenColor = (hex: string, percent: number): string => {
    if (!hex || !hex.startsWith('#')) return '#000000';
    const factor = 1 - percent / 100;
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r = Math.floor(r * factor);
    g = Math.floor(g * factor);
    b = Math.floor(b * factor);

    const toHex = (c: number) => ('00' + (isNaN(c) ? 0 : c).toString(16)).slice(-2);

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const lightenColor = (hex: string, percent: number): string => {
    if (!hex || !hex.startsWith('#')) return '#ffffff';
    const factor = 1 + percent / 100;
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r = Math.min(255, Math.floor(r * factor));
    g = Math.min(255, Math.floor(g * factor));
    b = Math.min(255, Math.floor(b * factor));
    
    const toHex = (c: number) => ('00' + (isNaN(c) ? 255 : c).toString(16)).slice(-2);

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToRgb = (hex: string) => {
  if (!hex || !hex.startsWith('#')) return { r: 255, g: 255, b: 255 };
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
};

const drawPowerUp = (ctx: CanvasRenderingContext2D, powerUp: PowerUp) => {
    ctx.save();
    ctx.translate(powerUp.x, powerUp.y);
    ctx.rotate(powerUp.rotation);

    const alpha = Math.min(1, powerUp.life / (powerUp.initialLife * 0.5));
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.arc(0, 0, powerUp.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * alpha})`;
    ctx.fill();

    ctx.lineWidth = 3;

    switch (powerUp.type) {
        case 'shield':
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`; // blue-500
            ctx.beginPath();
            // Simple shield icon (circle with cross)
            ctx.arc(0, 0, powerUp.radius * 0.7, 0, Math.PI * 2);
            ctx.moveTo(0, -powerUp.radius * 0.5);
            ctx.lineTo(0, powerUp.radius * 0.5);
            ctx.moveTo(-powerUp.radius * 0.5, 0);
            ctx.lineTo(powerUp.radius * 0.5, 0);
            ctx.stroke();
            break;
        case 'speedBoost':
            ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`; // amber-400
            ctx.beginPath();
            // Lightning bolt
            ctx.moveTo(powerUp.radius * -0.2, -powerUp.radius * 0.7);
            ctx.lineTo(powerUp.radius * 0.5, 0);
            ctx.lineTo(powerUp.radius * 0.2, powerUp.radius * 0.1);
            ctx.lineTo(powerUp.radius * 0.2, powerUp.radius * 0.7);
            ctx.lineTo(-powerUp.radius * 0.5, 0);
            ctx.lineTo(-powerUp.radius * 0.2, -powerUp.radius * 0.1);
            ctx.closePath();
            ctx.stroke();
            break;
        case 'bomb':
            ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`; // red-500
            ctx.beginPath();
            // Bomb/explosion icon
            ctx.arc(0, 0, powerUp.radius * 0.5, 0, Math.PI * 2);
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                ctx.moveTo(Math.cos(angle) * powerUp.radius * 0.6, Math.sin(angle) * powerUp.radius * 0.6);
                ctx.lineTo(Math.cos(angle) * powerUp.radius * 0.9, Math.sin(angle) * powerUp.radius * 0.9);
            }
            ctx.stroke();
            break;
    }
    ctx.restore();
};

export const GameCanvas = memo<GameCanvasProps>(({ gameState, settings, onGameOver, setScore, setLevel, isPressing, isTutorialActive, isPaused = false, isHolidayMode = false, startPowerUp }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  
  // Use refs for props that change frequently to avoid recreating the animation loop
  const isPressingRef = useRef(isPressing);
  const isTutorialActiveRef = useRef(isTutorialActive);
  const isPausedRef = useRef(isPaused);
  const settingsRef = useRef(settings);
  const isHolidayModeRef = useRef(isHolidayMode);
  const startPowerUpRef = useRef(startPowerUp);

  // Sync refs with props
  useEffect(() => { isPressingRef.current = isPressing; }, [isPressing]);
  useEffect(() => { isTutorialActiveRef.current = isTutorialActive; }, [isTutorialActive]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { isHolidayModeRef.current = isHolidayMode; }, [isHolidayMode]);
  useEffect(() => { startPowerUpRef.current = startPowerUp; }, [startPowerUp]);
  
  const planet = useRef({ x: 0, y: 0, radius: 30, atmosphereRotation: 0 });
  // Store irregular shape points for "Protoplanet" and "Ice Giant"
  const planetShapeRef = useRef<Point[]>([]); 
  const iceShapeRef = useRef<Point[]>([]);
  const gasCloudsRef = useRef<{x: number, y: number, r: number}[]>([]);

  const moon = useRef({ angle: 0, orbitRadius: 100, speed: 0.02, radius: 8, rotation: 0 });
  const asteroids = useRef<Asteroid[]>([]);
  const particles = useRef<Particle[]>([]);
  const stars = useRef<Star[]>([]);
  const nebulae = useRef<Nebula[]>([]);
  const shootingStars = useRef<ShootingStar[]>([]);
  const powerUps = useRef<PowerUp[]>([]);
  const activePowerUps = useRef<ActivePowerUps>({ shield: { active: false, endTime: 0 }, speedBoost: { active: false, endTime: 0 } });
  
  const isColliding = useRef(false);
  const screenFlash = useRef({ alpha: 0 });
  const levelUpAnimation = useRef<LevelUpAnimation>({ alpha: 0, scale: 0.5 });
  const currentLevel = useRef(1);
  const gridOffset = useRef(0); // For cyber_grid

  const gameTime = useRef({ start: 0, asteroidSpawnTimer: 0, asteroidSpawnInterval: 100, powerUpSpawnTimer: 0 });
  const orbitBounds = useRef({ min: 50, max: 300 });

  // Rendering Caches to improve performance
  const planetGradientRef = useRef<CanvasGradient | null>(null);
  const planetCacheProps = useRef({ color: '', radius: 0 });

  const POWER_UP_SPAWN_INTERVAL = 900; // ~15 seconds at 60fps

  // Handle Pause Duration Logic to prevent score jumps
  useEffect(() => {
    if (isPaused) {
        pauseStartTimeRef.current = Date.now();
    } else {
        // Resume
        lastTimeRef.current = performance.now(); // Reset physics timer

        if (pauseStartTimeRef.current > 0) {
            const pauseDuration = Date.now() - pauseStartTimeRef.current;
            
            // Shift game start time so score doesn't jump
            gameTime.current.start += pauseDuration;
            
            // Extend active powerups
            if (activePowerUps.current.shield.active) {
                activePowerUps.current.shield.endTime += pauseDuration;
            }
            if (activePowerUps.current.speedBoost.active) {
                activePowerUps.current.speedBoost.endTime += pauseDuration;
            }
            
            pauseStartTimeRef.current = 0;
        }
    }
  }, [isPaused]);

  const initBackground = useCallback((canvas: HTMLCanvasElement) => {
    stars.current = [];
    nebulae.current = [];

    const bgType = settingsRef.current.background;
    const isHoliday = isHolidayModeRef.current;

    // --- Star/Snow Generation ---
    let starCount = 80;
    if (bgType === 'star_field') starCount = 200;
    if (bgType === 'void' || bgType === 'cyber_grid') starCount = 30;
    if (bgType === 'nebula_storm') starCount = 60;
    if (isHoliday) starCount = 150; // More snow

    // Adjust for screen size
    starCount = Math.min(starCount, Math.floor((canvas.width * canvas.height) / 5000));

    for (let i = 0; i < starCount; i++) {
        stars.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * (isHoliday ? 3 : (bgType === 'star_field' ? 1.5 : 1.2)) + 0.5,
            alpha: Math.random() * 0.5 + 0.5,
            speed: Math.random() * (isHoliday ? 2.0 : (bgType === 'star_field' ? 0.8 : 0.3)) + 0.1,
        });
    }

    // --- Nebula Generation based on background type ---
    if (bgType !== 'void' && bgType !== 'deep_space' && bgType !== 'cyber_grid' && !isHoliday) {
        let nebulaCount = randomInt(2, 3);
        let nebulaColors = ['rgba(8, 79, 138, 0.1)', 'rgba(107, 33, 168, 0.1)', 'rgba(7, 89, 133, 0.15)'];
        
        if (bgType === 'nebula_storm') {
            nebulaCount = randomInt(4, 6);
            nebulaColors = ['rgba(200, 50, 50, 0.15)', 'rgba(100, 0, 150, 0.15)', 'rgba(255, 100, 0, 0.1)'];
        }

        for (let i = 0; i < nebulaCount; i++) {
            nebulae.current.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: randomInt(canvas.width / 4, canvas.width / 2),
                color: nebulaColors[randomInt(0, nebulaColors.length - 1)],
                dx: (Math.random() - 0.5) * 0.05,
                dy: (Math.random() - 0.5) * 0.05,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.002 + Math.random() * 0.005
            });
        }
    }
  }, []); // Remove settingsRef from dependency to avoid loop, we read current ref inside

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    planet.current.x = canvas.width / 2;
    planet.current.y = canvas.height / 2;
    planet.current.radius = Math.max(25, Math.min(canvas.width, canvas.height) * 0.08);
    moon.current.radius = Math.max(6, planet.current.radius * 0.25);
    
    orbitBounds.current.min = planet.current.radius + moon.current.radius + 15;
    orbitBounds.current.max = Math.min(canvas.width, canvas.height) / 2 - 20;

    // Generate irregular planet shape points if using Protoplanet
    planetShapeRef.current = [];
    const numPoints = 12;
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        // Variation in radius
        const r = planet.current.radius * (1 + (Math.random() - 0.5) * 0.25); 
        planetShapeRef.current.push({
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r
        });
    }

    // Generate Ice Giant Spikes
    iceShapeRef.current = [];
    const icePoints = 16;
    for (let i = 0; i < icePoints; i++) {
        const angle = (i / icePoints) * Math.PI * 2;
        const r = planet.current.radius * (1 + (Math.random() * 0.4)); // Large spikes
        iceShapeRef.current.push({
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r
        });
    }
    
    // Generate Gas Giant Clouds (blobs)
    gasCloudsRef.current = [];
    for(let i=0; i<6; i++) {
        gasCloudsRef.current.push({
            x: (Math.random() - 0.5) * planet.current.radius * 0.8,
            y: (Math.random() - 0.5) * planet.current.radius * 0.8,
            r: planet.current.radius * (0.6 + Math.random() * 0.4)
        });
    }
    
    // Invalidate gradient cache on resize
    planetGradientRef.current = null;
    
    // Only force moon position when not in gameplay/gameover state to prevent visual jumps
    if (gameState === 'login' || gameState === 'start') {
        moon.current.orbitRadius = (orbitBounds.current.min + orbitBounds.current.max) / 2;
    }
  }, [gameState]);

  // Creates an asteroid with difficulty-specific skins and movement variance
  const spawnAsteroid = (canvasWidth: number, canvasHeight: number, isAmbient: boolean = false) => {
    const difficulty = settingsRef.current.difficulty;
    
    let x, y;
    const radius = randomInt(10, 25);
    
    // Ambient asteroids spawn anywhere offscreen
    if (Math.random() < 0.5) {
        x = Math.random() * canvasWidth;
        y = Math.random() < 0.5 ? 0 - radius : canvasHeight + radius;
    } else {
        x = Math.random() < 0.5 ? 0 - radius : canvasWidth + radius;
        y = Math.random() * canvasHeight;
    }

    // Calculate Target with Variance
    let targetX = planet.current.x;
    let targetY = planet.current.y;
    let curveRate = 0;

    if (!isAmbient) {
        // Target Randomization: Aim slightly off-center to create secant paths across orbit
        const devFactor = difficulty === 'hard' ? 0.8 : (difficulty === 'normal' ? 0.4 : 0);
        const deviation = moon.current.orbitRadius * devFactor;
        
        targetX += (Math.random() - 0.5) * 2 * deviation;
        targetY += (Math.random() - 0.5) * 2 * deviation;
        
        // Curve Calculation: Asteroids curve their path
        if (difficulty !== 'easy') {
            const curveStrength = difficulty === 'hard' ? 0.008 : 0.003;
            curveRate = (Math.random() - 0.5) * 2 * curveStrength;
        }
        
        // No sound played here as per request
    }

    const angleToTarget = Math.atan2(targetY - y, targetX - x);
    
    // Speed based on difficulty and level
    const levelConfig = LEVELS[Math.min(currentLevel.current - 1, LEVELS.length - 1)];
    const difficultySetting = DIFFICULTY_SETTINGS[difficulty];
    let speed = (difficultySetting.baseSpeed * levelConfig.speedMultiplier) * (Math.random() * 0.5 + 0.8);
    
    if (isAmbient) speed *= 0.3; // Slower ambient asteroids

    // Color Palettes
    const palette = ASTEROID_PALETTES[difficulty];
    const strokePalette = ASTEROID_STROKES_PALETTES[difficulty];
    const color = palette[randomInt(0, palette.length - 1)];
    const stroke = strokePalette[randomInt(0, strokePalette.length - 1)];

    // Shape Generation - Harder = Spikier
    const shape: Point[] = [];
    const numPoints = randomInt(7, 12);
    let irregularity = 0.2; // Easy/Normal
    let spikiness = 0.1;   // Easy/Normal

    if (difficulty === 'hard') {
        irregularity = 0.4;
        spikiness = 0.3;
    }

    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const r = radius * (1 + (Math.random() - 0.5) * irregularity + (i % 2 === 0 ? spikiness : -spikiness));
        shape.push({
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r
        });
    }

    // Craters
    const craters: Crater[] = [];
    const numCraters = randomInt(1, 3);
    for(let i=0; i<numCraters; i++) {
        craters.push({
            x: (Math.random() - 0.5) * radius * 0.8,
            y: (Math.random() - 0.5) * radius * 0.8,
            radius: randomInt(2, radius / 4),
            color: 'rgba(0,0,0,0.1)'
        });
    }
    
    const rotationSpeed = (Math.random() - 0.5) * 0.05;

    return {
        x, y, radius,
        dx: Math.cos(angleToTarget) * speed,
        dy: Math.sin(angleToTarget) * speed,
        color, stroke, craters, shape,
        nearMissPlayed: false,
        curveRate,
        rotation: 0,
        rotationSpeed
    };
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: we don't need transparency for the back buffer
    if (!ctx) return;
    
    // Access current settings via ref to prevent re-creation of draw callback
    const currentSettings = settingsRef.current;
    const isHoliday = isHolidayModeRef.current;

    // Background Color
    if (currentSettings.background === 'void') {
        ctx.fillStyle = '#000000';
    } else if (currentSettings.background === 'nebula_storm') {
        ctx.fillStyle = '#1a0510';
    } else if (currentSettings.background === 'cyber_grid') {
        ctx.fillStyle = '#0a0a0f';
    } else {
        ctx.fillStyle = '#020617';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // CYBER GRID RENDERER
    if (currentSettings.background === 'cyber_grid' && !isHoliday) {
        ctx.save();
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        const offset = Math.floor(gridOffset.current) % gridSize;
        
        // Vertical lines
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        // Horizontal lines (scrolling)
        for (let y = offset; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Horizon glow
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, 'rgba(14, 165, 233, 0.1)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.restore();
    }

    // Draw Nebulae
    // Optimized: Only draw if onscreen, and remove expensive globalCompositeOperation 'lighter' if possible or keep minimal
    if (currentSettings.background !== 'cyber_grid' && !isHoliday) {
        ctx.globalCompositeOperation = 'lighter';
        nebulae.current.forEach(nebula => {
            const pulseScale = 1 + 0.1 * Math.sin(nebula.pulsePhase);
            const pulseRadius = nebula.radius * pulseScale;
            
            if (nebula.x + pulseRadius < 0 || nebula.x - pulseRadius > canvas.width || 
                nebula.y + pulseRadius < 0 || nebula.y - pulseRadius > canvas.height) return;

            const gradient = ctx.createRadialGradient(nebula.x, nebula.y, pulseRadius * 0.1, nebula.x, nebula.y, pulseRadius);
            const transparentColor = nebula.color.replace(/, ?\d*\.?\d*\)/, ', 0)');
            gradient.addColorStop(0, nebula.color);
            gradient.addColorStop(1, transparentColor);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(nebula.x, nebula.y, pulseRadius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';
    }

    // Draw Stars (or Snow)
    ctx.fillStyle = '#FFFFFF';
    stars.current.forEach(star => {
        ctx.globalAlpha = star.alpha;
        if (isHoliday) {
            // Draw snow as circles
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
             // Optimization: Draw stars as rects, simpler than arc
             ctx.fillRect(star.x, star.y, star.radius * 1.5, star.radius * 1.5);
        }
    });
    ctx.globalAlpha = 1.0;

    // Draw Shooting Stars (disabled in holiday mode)
    if (!isHoliday) {
        shootingStars.current.forEach(s => {
            ctx.save();
            ctx.beginPath();
            const trailLength = s.length;
            const angle = Math.atan2(s.vy, s.vx);
            
            const startX = s.x;
            const startY = s.y;
            const endX = s.x - Math.cos(angle) * trailLength;
            const endY = s.y - Math.sin(angle) * trailLength;
            
            // Use simpler stroke for shooting stars
            ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`;
            ctx.lineWidth = 2;
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.restore();
        });
    }

    // --- PLANET RENDERING ---
    ctx.save();
    const planetColor = currentSettings.planetColor || '#0ea5e9'; // Fallback
    const px = planet.current.x;
    const py = planet.current.y;
    const pr = planet.current.radius;
    const rot = planet.current.atmosphereRotation;

    if (isHoliday) {
        // --- HOLIDAY SNOWBALL PLANET ---
        const g = ctx.createRadialGradient(px - pr * 0.2, py - pr * 0.2, 0, px, py, pr);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.5, '#e0f2fe'); // Light blue tint
        g.addColorStop(1, '#93c5fd');   // Blue shadow
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2); ctx.fill();

        // Atmosphere Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#60a5fa';
        ctx.strokeStyle = '#bfdbfe';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2); ctx.stroke();
        ctx.shadowBlur = 0;

        // Texture (Light patches)
        ctx.fillStyle = 'rgba(186, 230, 253, 0.5)';
        ctx.beginPath(); ctx.arc(px - pr*0.4, py - pr*0.3, pr*0.2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + pr*0.3, py + pr*0.4, pr*0.15, 0, Math.PI*2); ctx.fill();

    } else if (planetColor === 'gas_giant') {
        // --- NEBULA GAS CLOUD PLANET (Not round) ---
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rot * 0.2);
        
        // Draw multiple blurry circles to form a cloud
        ctx.globalCompositeOperation = 'screen';
        const colors = ['#a855f7', '#d8b4fe', '#7e22ce'];
        
        gasCloudsRef.current.forEach((cloud, i) => {
            const g = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.r);
            g.addColorStop(0, colors[i % 3]);
            g.addColorStop(1, 'transparent');
            
            ctx.fillStyle = g;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI*2);
            ctx.fill();
        });
        
        // Central Core
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#581c87';
        ctx.beginPath(); ctx.arc(0, 0, pr * 0.5, 0, Math.PI*2); ctx.fill();
        
        ctx.restore();

    } else if (planetColor === 'ice_giant') {
        // --- ANIMATED ICE PLANET (Jagged Crystal) ---
        ctx.save();
        ctx.translate(px, py);
        // Pulse scale
        const pulse = 1 + Math.sin(Date.now() * 0.002) * 0.05;
        ctx.scale(pulse, pulse);
        
        // Draw jagged shape
        ctx.beginPath();
        if (iceShapeRef.current.length > 0) {
            ctx.moveTo(iceShapeRef.current[0].x, iceShapeRef.current[0].y);
            for(let i=1; i<iceShapeRef.current.length; i++) {
                ctx.lineTo(iceShapeRef.current[i].x, iceShapeRef.current[i].y);
            }
        }
        ctx.closePath();
        
        // Ice Gradient
        const g = ctx.createLinearGradient(-pr, -pr, pr, pr);
        g.addColorStop(0, '#cffafe'); // cyan-100
        g.addColorStop(0.5, '#22d3ee'); // cyan-400
        g.addColorStop(1, '#155e75'); // cyan-800
        ctx.fillStyle = g;
        ctx.fill();
        
        ctx.strokeStyle = '#ecfeff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Animated Glint
        ctx.clip(); // Clip to the jagged shape
        const glintPos = (Date.now() * 0.1) % (pr * 4) - (pr * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(glintPos, -pr * 2);
        ctx.lineTo(glintPos + 20, -pr * 2);
        ctx.lineTo(glintPos - 20, pr * 2);
        ctx.lineTo(glintPos - 40, pr * 2);
        ctx.fill();

        ctx.restore();

    } else if (planetColor === 'turkey') {
        // --- TURKEY PLANET ---
        ctx.save();
        ctx.translate(px, py);
        
        // Tail Feathers (Fan)
        const fanColors = ['#b91c1c', '#ea580c', '#d97706', '#65a30d', '#ea580c'];
        const numFeathers = 7;
        for (let i = 0; i < numFeathers; i++) {
             ctx.save();
             const angle = (i - (numFeathers-1)/2) * (Math.PI / 6);
             ctx.rotate(angle);
             ctx.fillStyle = fanColors[i % fanColors.length];
             ctx.beginPath();
             ctx.ellipse(0, -pr * 1.4, pr * 0.4, pr * 0.8, 0, 0, Math.PI * 2);
             ctx.fill();
             ctx.restore();
        }

        // Body
        ctx.fillStyle = '#78350f'; // Brown
        ctx.beginPath(); ctx.arc(0, pr * 0.2, pr, 0, Math.PI*2); ctx.fill();
        
        // Head
        ctx.fillStyle = '#92400e'; // Lighter Brown
        ctx.beginPath(); ctx.arc(0, -pr * 0.5, pr * 0.5, 0, Math.PI*2); ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(-pr*0.15, -pr*0.6, pr*0.12, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(pr*0.15, -pr*0.6, pr*0.12, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.arc(-pr*0.15, -pr*0.6, pr*0.05, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(pr*0.15, -pr*0.6, pr*0.05, 0, Math.PI*2); ctx.fill();

        // Beak
        ctx.fillStyle = '#facc15'; // Yellow
        ctx.beginPath();
        ctx.moveTo(-pr*0.1, -pr*0.45);
        ctx.lineTo(pr*0.1, -pr*0.45);
        ctx.lineTo(0, -pr*0.3);
        ctx.fill();

        // Wattle (Red thing)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.ellipse(pr*0.1, -pr*0.3, pr*0.08, pr*0.15, 0.2, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    } else if (planetColor === 'cat') {
        // --- CAT PLANET ---
        ctx.save();
        ctx.translate(px, py);
        
        // Ears
        ctx.fillStyle = '#374151'; // Dark Grey
        ctx.beginPath();
        // Left Ear
        ctx.moveTo(-pr * 0.8, -pr * 0.5);
        ctx.lineTo(-pr * 0.9, -pr * 1.3);
        ctx.lineTo(-pr * 0.3, -pr * 0.8);
        ctx.fill();
        // Right Ear
        ctx.moveTo(pr * 0.8, -pr * 0.5);
        ctx.lineTo(pr * 0.9, -pr * 1.3);
        ctx.lineTo(pr * 0.3, -pr * 0.8);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#4b5563'; // Grey
        ctx.beginPath(); ctx.arc(0, 0, pr, 0, Math.PI*2); ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#bef264'; // Lime Green
        ctx.beginPath(); ctx.ellipse(-pr*0.3, -pr*0.1, pr*0.2, pr*0.15, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(pr*0.3, -pr*0.1, pr*0.2, pr*0.15, 0, 0, Math.PI*2); ctx.fill();
        
        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.ellipse(-pr*0.3, -pr*0.1, pr*0.05, pr*0.12, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(pr*0.3, -pr*0.1, pr*0.05, pr*0.12, 0, 0, Math.PI*2); ctx.fill();
        
        // Nose
        ctx.fillStyle = '#f472b6'; // Pink
        ctx.beginPath();
        ctx.moveTo(-pr*0.1, pr*0.2);
        ctx.lineTo(pr*0.1, pr*0.2);
        ctx.lineTo(0, pr*0.3);
        ctx.fill();
        
        // Whiskers
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pr*0.2, pr*0.3); ctx.lineTo(pr*0.8, pr*0.25);
        ctx.moveTo(pr*0.2, pr*0.35); ctx.lineTo(pr*0.8, pr*0.4);
        ctx.moveTo(-pr*0.2, pr*0.3); ctx.lineTo(-pr*0.8, pr*0.25);
        ctx.moveTo(-pr*0.2, pr*0.35); ctx.lineTo(-pr*0.8, pr*0.4);
        ctx.stroke();

        ctx.restore();

    } else if (planetColor === 'mars') {
        // --- MARS (Textured, dusty, red) ---
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rot);

        // Base
        const g = ctx.createRadialGradient(0, 0, pr * 0.3, 0, 0, pr);
        g.addColorStop(0, '#ef4444'); // Red-500
        g.addColorStop(1, '#7f1d1d'); // Red-900
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, pr, 0, Math.PI*2); ctx.fill();

        // Textures (Patches)
        ctx.fillStyle = 'rgba(69, 10, 10, 0.4)'; // Dark spots
        ctx.beginPath(); ctx.arc(-pr*0.4, -pr*0.3, pr*0.25, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(pr*0.5, pr*0.2, pr*0.4, pr*0.2, 0.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(-pr*0.2, pr*0.5, pr*0.3, pr*0.15, -0.2, 0, Math.PI*2); ctx.fill();

        // Atmosphere Glow
        ctx.strokeStyle = 'rgba(254, 202, 202, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, pr, 0, Math.PI*2); ctx.stroke();
        
        ctx.restore();

    } else if (planetColor === 'protoplanet') {
        // --- PROTOPLANET (Irregular/Jagged) ---
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rot * 0.5); // Slow rotation
        
        // Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#57534e';
        
        ctx.fillStyle = '#44403c';
        ctx.strokeStyle = '#a8a29e';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        if (planetShapeRef.current.length > 0) {
            ctx.moveTo(planetShapeRef.current[0].x, planetShapeRef.current[0].y);
            for (let i = 1; i < planetShapeRef.current.length; i++) {
                ctx.lineTo(planetShapeRef.current[i].x, planetShapeRef.current[i].y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Cracks
            ctx.strokeStyle = '#0c0a09';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(planetShapeRef.current[0].x * 0.7, planetShapeRef.current[0].y * 0.7);
            ctx.moveTo(0, 0);
            ctx.lineTo(planetShapeRef.current[4].x * 0.5, planetShapeRef.current[4].y * 0.5);
            ctx.stroke();
        }
        ctx.restore();

    } else if (planetColor === 'sector_seven') {
        // --- SECTOR 7 (Billiard style / Industrial) ---
        ctx.save();
        
        // Base - Dark Industrial Green/Black
        const g = ctx.createRadialGradient(px, py, pr * 0.2, px, py, pr);
        g.addColorStop(0, '#064e3b'); // emerald-900
        g.addColorStop(1, '#022c22'); // emerald-950
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2); ctx.fill();
        
        // White Circle Background
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath(); ctx.arc(px, py, pr * 0.5, 0, Math.PI*2); ctx.fill();

        // The "7"
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${pr * 0.6}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Slight offset for visual balance
        ctx.fillText('7', px, py + pr * 0.05);
        
        // Metallic Rim
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2); ctx.stroke();

        ctx.restore();

    } else {
        // --- DEFAULT ROUND PLANET RENDERER ---
        
        // Glow
        ctx.fillStyle = planetColor;
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(px, py, pr * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Draw Planet Body
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        
        // CACHED GRADIENT
        let planetGradient = planetGradientRef.current;
        if (!planetGradient || 
            planetCacheProps.current.color !== planetColor || 
            planetCacheProps.current.radius !== pr) {
            
            planetGradient = ctx.createRadialGradient(
                px - pr * 0.3,
                py - pr * 0.3,
                pr * 0.1,
                px,
                py,
                pr
            );
            const baseColor = planetColor;
            const lightColor = lightenColor(baseColor, 20);
            const darkColor = darkenColor(baseColor, 40);
            planetGradient.addColorStop(0, lightColor);
            planetGradient.addColorStop(0.5, baseColor);
            planetGradient.addColorStop(1, darkColor);
            
            planetGradientRef.current = planetGradient;
            planetCacheProps.current = { color: planetColor, radius: pr };
        }

        ctx.fillStyle = planetGradient;
        ctx.fill();

        // Add atmospheric bands for texture (Rotating)
        const time = Date.now() * 0.0002;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(
                px,
                py,
                pr * (0.6 + i * 0.08),
                Math.PI * (0.1 + i * 0.4) + time * (i % 2 === 0 ? 1 : -0.5) + planet.current.atmosphereRotation,
                Math.PI * (1 + 0.1 * i * 0.6) + time * (i % 2 === 0 ? 1 : -0.5) + planet.current.atmosphereRotation
            );
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + Math.random() * 0.05})`;
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.stroke();
        }
    }
    ctx.restore();


    // Draw Moon Orbit Path
    ctx.beginPath();
    ctx.arc(planet.current.x, planet.current.y, moon.current.orbitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw Asteroids
    asteroids.current.forEach(ast => {
      ctx.save();
      ctx.translate(ast.x, ast.y);
      ctx.rotate(ast.rotation);

      // Hard mode visual: thicker stroke instead of expensive shadow
      if (currentSettings.difficulty === 'hard') {
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#ef4444';
      } else {
          ctx.lineWidth = 2;
          ctx.strokeStyle = ast.stroke;
      }

      ctx.beginPath();
      ctx.moveTo(ast.shape[0].x, ast.shape[0].y);
      for (let i = 1; i < ast.shape.length; i++) {
          ctx.lineTo(ast.shape[i].x, ast.shape[i].y);
      }
      ctx.closePath();
      
      ctx.fillStyle = ast.color;
      ctx.fill();
      ctx.stroke();
      
      // OPTIMIZATION: Draw craters as simple rects instead of arcs to save performance
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ast.craters.forEach(crater => {
          ctx.fillStyle = crater.color;
          // Use fillRect instead of arc/stroke for performance on mobile
          ctx.fillRect(crater.x - crater.radius, crater.y - crater.radius, crater.radius * 2, crater.radius * 2);
      });
      
      ctx.restore();
    });

    // Draw PowerUps
    powerUps.current.forEach(p => drawPowerUp(ctx, p));

    // Draw Moon
    if (!isColliding.current) {
        const moonX = planet.current.x + Math.cos(moon.current.angle) * moon.current.orbitRadius;
        const moonY = planet.current.y + Math.sin(moon.current.angle) * moon.current.orbitRadius;

        // Draw Speed Boost / Movement Trail
        let moonColor = currentSettings.moonColor || '#e5e7eb'; // Fallback
        const trailColor = currentSettings.trailColor || '#38bdf8'; // Fallback
        
        let r = 255, g = 255, b = 255;
        if (trailColor !== 'rainbow' && trailColor !== 'flame' && trailColor !== 'ice' && trailColor !== 'dust' && trailColor !== 'laser') {
             const rgb = hexToRgb(trailColor);
             r = rgb.r; g = rgb.g; b = rgb.b;
        }

        // OPTIMIZATION: Reduce trail length and draw frequency
        // Adjusted visual prominence (toned down slightly)
        const trailLength = activePowerUps.current.speedBoost.active ? 30 : 20; 
        const currentSpeed = activePowerUps.current.speedBoost.active ? moon.current.speed * 2 : moon.current.speed;
        
        // --- CUSTOM TRAIL RENDERING ---
        if (trailColor === 'laser') {
            // Laser Trail: Continuous Beam
            ctx.beginPath();
            ctx.strokeStyle = activePowerUps.current.speedBoost.active ? '#fca5a5' : '#ef4444';
            ctx.lineWidth = activePowerUps.current.speedBoost.active ? 6 : 3; // Reduced width from 8/4
            ctx.lineCap = 'round';
            // Simulate glow with shadow (expensive but okay for single line)
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ef4444';
            
            ctx.moveTo(moonX, moonY);
            // Draw smooth curve logic
            for (let i = 1; i <= trailLength; i++) {
                const pastAngle = moon.current.angle - currentSpeed * i;
                const pastX = planet.current.x + Math.cos(pastAngle) * moon.current.orbitRadius;
                const pastY = planet.current.y + Math.sin(pastAngle) * moon.current.orbitRadius;
                ctx.lineTo(pastX, pastY);
            }
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset
        } else {
            // Particle/Shape Trails
            for (let i = 1; i <= trailLength; i++) { 
                const pastAngle = moon.current.angle - currentSpeed * i * 1.3;
                const pastX = planet.current.x + Math.cos(pastAngle) * moon.current.orbitRadius;
                const pastY = planet.current.y + Math.sin(pastAngle) * moon.current.orbitRadius;
                const ratio = i / trailLength;
                // Slightly smaller trail size
                const trailSize = moon.current.radius * (0.9 - ratio * 0.7);

                if (trailColor === 'rainbow') {
                    const hue = ((Date.now() / 5) + (i * 20)) % 360;
                    ctx.fillStyle = `hsla(${hue}, 90%, 60%, ${0.6 * (1 - ratio)})`; // Reduced opacity from 0.8
                    ctx.fillRect(pastX - trailSize, pastY - trailSize, trailSize * 2, trailSize * 2);
                
                } else if (trailColor === 'flame') {
                    // Flame: Jittering Orange/Red particles
                    const jitterX = (Math.random() - 0.5) * 6;
                    const jitterY = (Math.random() - 0.5) * 6;
                    const red = 255;
                    const green = Math.floor(180 * (1 - ratio)); // Fade to red
                    ctx.fillStyle = `rgba(${red}, ${green}, 0, ${0.6 * (1 - ratio)})`; // Reduced opacity
                    // Draw as slightly rotated rect or just rect with jitter
                    ctx.fillRect(pastX + jitterX - trailSize, pastY + jitterY - trailSize, trailSize * 2, trailSize * 2);

                } else if (trailColor === 'ice') {
                    // Ice: Rotating Diamonds
                    ctx.save();
                    ctx.translate(pastX, pastY);
                    ctx.rotate(Date.now() * 0.005 + i);
                    ctx.fillStyle = `rgba(165, 243, 252, ${0.5 * (1 - ratio)})`; // cyan-200, reduced opacity
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = '#67e8f9';
                    ctx.fillRect(-trailSize * 0.8, -trailSize * 0.8, trailSize * 1.6, trailSize * 1.6);
                    ctx.shadowBlur = 0;
                    ctx.restore();

                } else if (trailColor === 'dust') {
                    // Dust: Soft Circles
                    const jitterX = (Math.random() - 0.5) * 3;
                    const jitterY = (Math.random() - 0.5) * 3;
                    ctx.beginPath();
                    ctx.arc(pastX + jitterX, pastY + jitterY, trailSize * 1.1, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(156, 163, 175, ${0.4 * (1 - ratio)})`; // gray-400, reduced opacity
                    ctx.fill();

                } else {
                    // Standard Hex Color
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.4 * (1 - ratio)})`; // Standard opacity 0.4
                    ctx.fillRect(pastX - trailSize, pastY - trailSize, trailSize * 2, trailSize * 2);
                }
            }
        }
        
        ctx.save();
        ctx.translate(moonX, moonY);
        // Rotate the moon so the "top" points away from the planet (or whatever orientation desired)
        // For sleigh, we want it to face forward. Tangent + 90deg?
        // Standard moon rotation logic:
        ctx.rotate(moon.current.angle + (currentSettings.moonSkin === 'tech' ? moon.current.rotation : 0));
        
        if (isHoliday) {
            // --- HOLIDAY SLEIGH MOON ---
            // Rotate to face travel direction for the sleigh
            ctx.rotate(Math.PI / 2); 
            
            const sleighScale = moon.current.radius * 0.15;
            ctx.scale(sleighScale, sleighScale);

            // Runners (Gold)
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-15, 10);
            ctx.lineTo(15, 10);
            ctx.quadraticCurveTo(20, 10, 22, 5); // Curved front
            ctx.stroke();
            
            // Supports
            ctx.beginPath();
            ctx.moveTo(-10, 10);
            ctx.lineTo(-10, 5);
            ctx.moveTo(10, 10);
            ctx.lineTo(10, 5);
            ctx.stroke();

            // Sleigh Body (Red)
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(-15, 5);
            ctx.lineTo(15, 5);
            ctx.quadraticCurveTo(18, 5, 18, 0); // Front lip
            ctx.lineTo(18, -2);
            ctx.lineTo(10, -5); // Top edge
            ctx.lineTo(-15, -5); // Back top
            ctx.quadraticCurveTo(-18, -5, -18, 5); // Back curve
            ctx.closePath();
            ctx.fill();
            
            // Sack of Toys (Green)
            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.arc(-5, -8, 6, 0, Math.PI*2);
            ctx.fill();

        } else {
            // Manual Moon Glow
            ctx.beginPath();
            const glowRadius = activePowerUps.current.speedBoost.active ? moon.current.radius * 2.5 : moon.current.radius * 1.8;
            let glowColor = activePowerUps.current.speedBoost.active ? '#fbb_f24' : moonColor;
            
            // Custom Glow for Skins
            if (currentSettings.moonSkin === 'golden') glowColor = '#fcd34d';
            if (currentSettings.moonSkin === 'ice') glowColor = '#a5f3fc';

            ctx.fillStyle = glowColor;
            ctx.globalAlpha = 0.2;
            ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // MOON SKINS RENDERING
            if (currentSettings.moonSkin === 'tech') {
                // Tech Skin: Geometric, rotating
                ctx.fillStyle = moonColor;
                ctx.beginPath();
                ctx.rect(-moon.current.radius * 0.6, -moon.current.radius * 0.6, moon.current.radius * 1.2, moon.current.radius * 1.2);
                ctx.fill();
                
                ctx.strokeStyle = darkenColor(moonColor, 30);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -moon.current.radius);
                ctx.lineTo(0, moon.current.radius);
                ctx.moveTo(-moon.current.radius, 0);
                ctx.lineTo(moon.current.radius, 0);
                ctx.stroke();
                
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.strokeRect(-moon.current.radius * 0.3, -moon.current.radius * 0.3, moon.current.radius * 0.6, moon.current.radius * 0.6);

            } else if (currentSettings.moonSkin === 'smooth') {
                // Smooth Skin: Gradient, clean
                const grad = ctx.createRadialGradient(-2, -2, 0, 0, 0, moon.current.radius);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(1, moonColor);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, moon.current.radius, 0, Math.PI * 2);
                ctx.fill();

            } else if (currentSettings.moonSkin === 'crater') {
                // Crater Skin: Heavy craters
                ctx.fillStyle = moonColor;
                ctx.beginPath();
                ctx.arc(0, 0, moon.current.radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = darkenColor(moonColor, 20);
                ctx.beginPath();
                ctx.arc(-2, -2, 3, 0, Math.PI*2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(3, 3, 2, 0, Math.PI*2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(3, -3, 1.5, 0, Math.PI*2);
                ctx.fill();

            } else if (currentSettings.moonSkin === 'ice') {
                // Ice Skin
                const grad = ctx.createLinearGradient(-5, -5, 5, 5);
                grad.addColorStop(0, '#cffafe');
                grad.addColorStop(1, '#06b6d4');
                ctx.fillStyle = grad;
                
                // Jagged shape
                ctx.beginPath();
                for(let i=0; i<6; i++) {
                    const angle = (i/6)*Math.PI*2;
                    const r = i%2===0 ? moon.current.radius : moon.current.radius * 0.8;
                    ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
                }
                ctx.closePath();
                ctx.fill();
                
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();

            } else if (currentSettings.moonSkin === 'camo') {
                ctx.beginPath();
                ctx.arc(0, 0, moon.current.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#57534e';
                ctx.fill();
                
                // Patches
                ctx.fillStyle = '#65a30d';
                ctx.beginPath(); ctx.arc(-2, -2, 4, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#3f6212';
                ctx.beginPath(); ctx.arc(3, 3, 3, 0, Math.PI*2); ctx.fill();

            } else if (currentSettings.moonSkin === 'golden') {
                // Golden Skin
                const grad = ctx.createRadialGradient(-3, -3, 1, 0, 0, moon.current.radius);
                grad.addColorStop(0, '#fef08a');
                grad.addColorStop(0.5, '#eab308');
                grad.addColorStop(1, '#854d0e');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, moon.current.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Shine
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.beginPath();
                ctx.arc(-3, -3, 2, 0, Math.PI*2);
                ctx.fill();

            } else if (currentSettings.moonSkin === 'basketball') {
                // Basketball Skin
                ctx.save();
                ctx.rotate(moon.current.rotation);
                
                // Base Orange
                ctx.fillStyle = '#f97316';
                ctx.beginPath();
                ctx.arc(0, 0, moon.current.radius, 0, Math.PI * 2);
                ctx.fill();

                // Lines
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#431407'; // Dark brown
                
                // Horizontal
                ctx.beginPath();
                ctx.moveTo(-moon.current.radius, 0);
                ctx.lineTo(moon.current.radius, 0);
                ctx.stroke();

                // Vertical/Curve
                ctx.beginPath();
                ctx.ellipse(0, 0, moon.current.radius * 0.6, moon.current.radius, 0, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.restore();

            } else if (currentSettings.moonSkin === 'beachball') {
                // Beachball Skin
                ctx.save();
                ctx.rotate(moon.current.rotation);
                const r = moon.current.radius;
                
                // Draw 6 Segments
                const colors = ['#ef4444', '#ffffff', '#3b82f6', '#eab308', '#22c55e', '#f97316'];
                for(let i=0; i<6; i++) {
                    ctx.beginPath();
                    ctx.moveTo(0,0);
                    ctx.arc(0, 0, r, i * (Math.PI/3), (i+1) * (Math.PI/3));
                    ctx.fillStyle = colors[i];
                    ctx.fill();
                }
                
                // White cap
                ctx.beginPath();
                ctx.arc(0,0, r*0.2, 0, Math.PI*2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();

                ctx.restore();

            } else if (currentSettings.moonSkin === 'tennis') {
                // Tennis Ball Skin
                ctx.save();
                ctx.rotate(moon.current.rotation);
                
                // Base Green
                ctx.fillStyle = '#bef264';
                ctx.beginPath();
                ctx.arc(0, 0, moon.current.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Seams
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#ffffff';
                ctx.beginPath();
                // Simple sine wave approximation
                ctx.moveTo(-moon.current.radius, 0);
                ctx.bezierCurveTo(-moon.current.radius/2, -moon.current.radius, moon.current.radius/2, moon.current.radius, moon.current.radius, 0);
                ctx.stroke();

                ctx.restore();

            } else if (currentSettings.moonSkin === 'apple') {
                // Apple Skin
                ctx.save();
                // No rotation for apple so stem stays up relative to orbit? 
                // Actually rotation looks funnier.
                ctx.rotate(moon.current.rotation);
                
                // Base Red
                const grad = ctx.createRadialGradient(-3, -3, 1, 0, 0, moon.current.radius);
                grad.addColorStop(0, '#fca5a5');
                grad.addColorStop(0.5, '#ef4444');
                grad.addColorStop(1, '#991b1b');
                ctx.fillStyle = grad;
                
                // Shape (slightly wider top)
                ctx.beginPath();
                ctx.arc(0, 0, moon.current.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Stem
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#78350f';
                ctx.beginPath();
                ctx.moveTo(0, -moon.current.radius * 0.8);
                ctx.lineTo(2, -moon.current.radius * 1.5);
                ctx.stroke();
                
                // Leaf
                ctx.fillStyle = '#4d7c0f';
                ctx.beginPath();
                ctx.ellipse(4, -moon.current.radius * 1.3, 3, 1.5, -Math.PI/4, 0, Math.PI*2);
                ctx.fill();
                
                // Shine
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.beginPath();
                ctx.arc(-3, -3, 2, 0, Math.PI*2);
                ctx.fill();

                ctx.restore();

            } else {
                // Default Skin
                ctx.beginPath();
                ctx.arc(0, 0, moon.current.radius, 0, Math.PI * 2);
                ctx.fillStyle = moonColor;
                ctx.fill();

                // Standard faint craters
                ctx.fillStyle = darkenColor(moonColor, 15);
                ctx.strokeStyle = darkenColor(moonColor, 30);
                ctx.lineWidth = 0.5;
                for (let i = 0; i < 3; i++) {
                    const craterAngle = (i * 1.8);
                    const craterDist = (i / 3) * (moon.current.radius * 0.6);
                    const craterRadius = 1.5;
                    ctx.beginPath();
                    ctx.arc(
                        Math.cos(craterAngle) * craterDist,
                        Math.sin(craterAngle) * craterDist,
                        craterRadius,
                        0,
                        Math.PI * 2
                    );
                    ctx.globalAlpha = 0.8;
                    ctx.fill();
                }
            }
        }
        
        ctx.restore();

        // Draw Shield
        if (activePowerUps.current.shield.active) {
            ctx.save();
            const shieldPulse = Math.sin(Date.now() / 200) * 0.1 + 0.9;
            const shieldRadius = moon.current.radius + 8;
            ctx.beginPath();
            ctx.arc(moonX, moonY, shieldRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(147, 197, 253, ${0.8 * shieldPulse})`; // blue-300
            ctx.lineWidth = 4 * shieldPulse;
            ctx.stroke();
            ctx.restore();
        }
    }

    // Particles (Optimized: fillRect instead of arc)
    particles.current.forEach(p => {
        ctx.globalAlpha = p.life / p.initialLife;
        ctx.fillStyle = p.color;
        // Draw as squares for performance
        ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
    });
    ctx.globalAlpha = 1.0;

    if (screenFlash.current.alpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${screenFlash.current.alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (levelUpAnimation.current.alpha > 0) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${60 * levelUpAnimation.current.scale}px sans-serif`;
        ctx.fillStyle = `rgba(255, 255, 100, ${levelUpAnimation.current.alpha})`;
        // Remove shadow blur for performance, use text stroke instead
        ctx.strokeStyle = `rgba(0, 0, 0, ${levelUpAnimation.current.alpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.strokeText(`Level Up!`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Level Up!`, canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
  }, []);

  const animationLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- DELTA TIME LOGIC for Smooth Physics ---
    const now = performance.now();
    if (!lastTimeRef.current) lastTimeRef.current = now;
    const dt = Math.min(now - lastTimeRef.current, 64); // Cap at ~15 FPS to prevent huge jumps (tunneling)
    lastTimeRef.current = now;
    
    // Normalize to 60 FPS (16.67ms per frame).
    const timeScale = dt / 16.67;
    const isHoliday = isHolidayModeRef.current;

    // --- Always animate background elements ---
    stars.current.forEach(star => {
      if (isHoliday) {
          // Snow movement: Fall down + drift X
          star.y += star.speed * timeScale;
          star.x += Math.sin(star.y * 0.01) * 0.5 * timeScale;
      } else {
          // Regular space dust movement
          star.y += star.speed * timeScale;
      }

      if (star.y > canvas.height) {
        star.y = -5; // Reset just above screen
        star.x = Math.random() * canvas.width;
      }
    });

    // Update Nebulae (Disabled in Holiday Mode)
    if (!isHoliday) {
        nebulae.current.forEach(nebula => {
            nebula.x += nebula.dx * timeScale;
            nebula.y += nebula.dy * timeScale;
            nebula.pulsePhase += nebula.pulseSpeed * timeScale;
            
            if (nebula.x - nebula.radius > canvas.width || nebula.x + nebula.radius < 0 ||
                nebula.y - nebula.radius > canvas.height || nebula.y + nebula.radius < 0) {
                nebula.x = Math.random() * canvas.width;
                nebula.y = -nebula.radius;
            }
        });
    }

    // Update Grid Offset
    gridOffset.current += 1 * timeScale;

    // Spawn Shooting Stars (Rarely)
    if (!isHoliday && Math.random() < 0.005) {
        shootingStars.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.6, // Top 60% of screen
            vx: 15 + Math.random() * 10,
            vy: 2 + Math.random() * 3,
            length: 50 + Math.random() * 80,
            opacity: 1
        });
    }

    // Update Shooting Stars
    for (let i = shootingStars.current.length - 1; i >= 0; i--) {
        const s = shootingStars.current[i];
        s.x += s.vx * timeScale;
        s.y += s.vy * timeScale;
        s.opacity -= 0.015 * timeScale;
        if (s.opacity <= 0 || s.x > canvas.width + 100 || s.y > canvas.height + 100) {
            shootingStars.current.splice(i, 1);
        }
    }
    
    // Rotate planet atmosphere
    planet.current.atmosphereRotation += 0.0005 * timeScale;

    // --- Logic splits based on state ---
    
    if (gameState === 'playing' && !isPausedRef.current) {
      // Prevent multiple game over triggers if rendering loop continues before state update
      if (isColliding.current) return; 

      // === PLAYING LOGIC ===

      if (!isTutorialActiveRef.current) {
          const currentTime = Date.now();
          if (activePowerUps.current.shield.active && currentTime > activePowerUps.current.shield.endTime) {
              activePowerUps.current.shield.active = false;
          }
          if (activePowerUps.current.speedBoost.active && currentTime > activePowerUps.current.speedBoost.endTime) {
              activePowerUps.current.speedBoost.active = false;
          }

          const currentScore = Math.floor((currentTime - gameTime.current.start) / 100);
          setScore(currentScore);

          const nextLevelIndex = currentLevel.current;
          if (nextLevelIndex < LEVELS.length && currentScore >= LEVELS[nextLevelIndex].threshold) {
              currentLevel.current++;
              setLevel(currentLevel.current);
              playLevelUpSound();
              levelUpAnimation.current = { alpha: 1, scale: 0.5 };
          }

          const levelConfig = LEVELS[Math.min(currentLevel.current - 1, LEVELS.length - 1)];
          const difficultySetting = DIFFICULTY_SETTINGS[settingsRef.current.difficulty];
          
          // Spawn Power Ups
          gameTime.current.powerUpSpawnTimer += timeScale;
          if (gameTime.current.powerUpSpawnTimer > POWER_UP_SPAWN_INTERVAL) {
              gameTime.current.powerUpSpawnTimer = 0;
              const powerUpTypes: PowerUpType[] = ['shield', 'speedBoost', 'bomb'];
              const type = powerUpTypes[randomInt(0, powerUpTypes.length - 1)];
              const radius = 18;
              let x, y;
              if (Math.random() < 0.5) {
                  x = Math.random() * canvas.width;
                  y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
              } else {
                  x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
                  y = Math.random() * canvas.height;
              }
              
              const angle = Math.atan2(planet.current.y - y, planet.current.x - x);
              const speed = 1;
              const life = 600; 

              powerUps.current.push({
                  x, y, radius, type,
                  dx: Math.cos(angle) * speed,
                  dy: Math.sin(angle) * speed,
                  life: life,
                  initialLife: life,
                  rotation: 0,
                  rotationSpeed: (Math.random() - 0.5) * 0.04,
              });
          }

          // Spawn Asteroids
          gameTime.current.asteroidSpawnTimer += timeScale;
          if (gameTime.current.asteroidSpawnTimer >= gameTime.current.asteroidSpawnInterval) {
            gameTime.current.asteroidSpawnTimer = 0;
            const minInterval = difficultySetting.minSpawnInterval * levelConfig.spawnMultiplier;
            if (gameTime.current.asteroidSpawnInterval > minInterval) {
                gameTime.current.asteroidSpawnInterval -= 0.5;
            }
            
            asteroids.current.push(spawnAsteroid(canvas.width, canvas.height));
          }
      } else {
          gameTime.current.start = Date.now();
      }

      // Moon Logic
      // Use ref current value instead of dependency prop to avoid re-renders
      const targetRadius = isPressingRef.current ? orbitBounds.current.max : orbitBounds.current.min;
      const lerpSpeed = 0.06 * timeScale; 
      moon.current.orbitRadius += (targetRadius - moon.current.orbitRadius) * lerpSpeed;
      
      // Calculate current level multiplier for moon speed
      const currentLevelIndex = Math.min(currentLevel.current - 1, LEVELS.length - 1);
      const levelMultiplier = LEVELS[currentLevelIndex].speedMultiplier;
      
      let angularSpeed = moon.current.speed * levelMultiplier;

      if (activePowerUps.current.speedBoost.active) {
          angularSpeed *= 1.5;
      }
      moon.current.angle += angularSpeed * timeScale;
      moon.current.rotation += 0.05 * timeScale;
      
        // Update power-ups (only when not paused)
        for (let i = powerUps.current.length - 1; i >= 0; i--) {
            const p = powerUps.current[i];
            p.x += p.dx * timeScale;
            p.y += p.dy * timeScale;
            p.rotation += p.rotationSpeed * timeScale;
            p.life -= timeScale;
            if (p.life <= 0) {
                powerUps.current.splice(i, 1);
            }
        }

        // Move Asteroids
        for (let i = asteroids.current.length - 1; i >= 0; i--) {
          const ast = asteroids.current[i];
          
          // Apply curve logic
          if (ast.curveRate) {
             const curveAngle = ast.curveRate * timeScale;
             const cos = Math.cos(curveAngle);
             const sin = Math.sin(curveAngle);
             const oldDx = ast.dx;
             ast.dx = oldDx * cos - ast.dy * sin;
             ast.dy = oldDx * sin + ast.dy * cos;
          }
          
          ast.x += ast.dx * timeScale;
          ast.y += ast.dy * timeScale;
          ast.rotation += ast.rotationSpeed * timeScale;

          // Bounds check
          if (ast.x < -100 || ast.x > canvas.width + 100 || ast.y < -100 || ast.y > canvas.height + 100) {
              asteroids.current.splice(i, 1);
              continue;
          }

          // Collision Detection - Planet
          const distToPlanet = getDistance(ast.x, ast.y, planet.current.x, planet.current.y);
          if (distToPlanet < planet.current.radius + ast.radius) {
             for(let j=0; j<6; j++) {
                particles.current.push({
                    x: ast.x,
                    y: ast.y,
                    dx: (Math.random() - 0.5) * 3,
                    dy: (Math.random() - 0.5) * 3,
                    radius: Math.random() * 3,
                    color: ast.color,
                    life: 25,
                    initialLife: 25
                });
             }
             asteroids.current.splice(i, 1);
             continue; 
          }

          // Moon Collision
          const moonX = planet.current.x + Math.cos(moon.current.angle) * moon.current.orbitRadius;
          const moonY = planet.current.y + Math.sin(moon.current.angle) * moon.current.orbitRadius;
          const shieldRadius = moon.current.radius + 8;
          const distToMoon = getDistance(ast.x, ast.y, moonX, moonY);

          if (!activePowerUps.current.shield.active) { 
              if (distToMoon < moon.current.radius + ast.radius) {
                  playCollisionSound();
                  isColliding.current = true;
                  screenFlash.current.alpha = 1;
                  const finalScore = Math.floor((Date.now() - gameTime.current.start) / 100);
                  onGameOver(finalScore);
                  return;
              }
          } else {
              if (distToMoon < shieldRadius + ast.radius) {
                  playShieldBlockSound();
                  for(let j=0; j<5; j++) {
                      particles.current.push({
                          x: ast.x, y: ast.y,
                          dx: (Math.random() - 0.5) * 4,
                          dy: (Math.random() - 0.5) * 4,
                          radius: Math.random() * 3,
                          color: ast.color,
                          life: 30,
                          initialLife: 30
                      });
                  }
                  asteroids.current.splice(i, 1);
                  continue;
              }
          }
        }
        
        // Check PowerUp Collection
        const moonX = planet.current.x + Math.cos(moon.current.angle) * moon.current.orbitRadius;
        const moonY = planet.current.y + Math.sin(moon.current.angle) * moon.current.orbitRadius;

        for (let i = powerUps.current.length - 1; i >= 0; i--) {
             const p = powerUps.current[i];
             const dist = getDistance(moonX, moonY, p.x, p.y);
             if (dist < moon.current.radius + p.radius) {
                 if (p.type === 'shield') {
                     activePowerUps.current.shield = { active: true, endTime: Date.now() + 10000 };
                 } else if (p.type === 'speedBoost') {
                     activePowerUps.current.speedBoost = { active: true, endTime: Date.now() + 5000 };
                 } else if (p.type === 'bomb') {
                     playBombSound();
                     screenFlash.current.alpha = 0.8;
                     asteroids.current = [];
                 }
                 
                 if (p.type !== 'bomb') playPowerUpCollectSound();
                 powerUps.current.splice(i, 1);
             }
        }
    }

      // Particles always update (or should they freeze? Let's freeze them on pause for effect)
      if (!isPausedRef.current) {
          for (let i = particles.current.length - 1; i >= 0; i--) {
              const p = particles.current[i];
              p.x += p.dx * timeScale;
              p.y += p.dy * timeScale;
              p.dx *= 0.98;
              p.dy *= 0.98;
              p.life -= timeScale;
              if (p.life <= 0) {
                  particles.current.splice(i, 1);
              }
          }
          // Safety Cap for particles to prevent memory issues/lag
          if (particles.current.length > 50) {
              particles.current = particles.current.slice(-50);
          }
      }
      
      if (screenFlash.current.alpha > 0) {
          screenFlash.current.alpha = Math.max(0, screenFlash.current.alpha - 0.05 * timeScale);
      }
      
      if (levelUpAnimation.current.alpha > 0) {
          levelUpAnimation.current.alpha -= 0.02 * timeScale;
          levelUpAnimation.current.scale += 0.01 * timeScale;
      } else {
          levelUpAnimation.current.alpha = 0;
      }

      if (isColliding.current) {
        // Physics pause on collision
      } 
    
    draw();
    animationFrameId.current = requestAnimationFrame(animationLoop);

  }, [gameState, draw, onGameOver, setScore, setLevel]); 

  // Initial Setup & Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
        resizeCanvas();
        // Check if ref is set to avoid initial null access errors
        if (settingsRef.current) initBackground(canvas);
    }
    
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas, initBackground]);

  // Re-init background if background setting changes
  useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas && settings.background) {
          initBackground(canvas);
      }
  }, [settings.background, initBackground, isHolidayMode]);

  // Reset logic when gameState changes
  useEffect(() => {
      if (gameState === 'playing') {
          asteroids.current = [];
          powerUps.current = [];
          particles.current = [];
          isColliding.current = false;
          gameTime.current.start = Date.now();
          gameTime.current.asteroidSpawnTimer = 0;
          gameTime.current.powerUpSpawnTimer = 0;
          currentLevel.current = 1;
          activePowerUps.current = { shield: { active: false, endTime: 0 }, speedBoost: { active: false, endTime: 0 } };
          
          gameTime.current.asteroidSpawnInterval = DIFFICULTY_SETTINGS[settingsRef.current.difficulty].initialSpawnInterval;
          
          moon.current.angle = 0;
          moon.current.orbitRadius = orbitBounds.current.min;
          
          // Reset Delta Time tracker to avoid huge jumps
          lastTimeRef.current = performance.now();
          pauseStartTimeRef.current = 0;

          // Apply Start Power Up
          if (startPowerUpRef.current === 'shield') {
              activePowerUps.current.shield = { active: true, endTime: Date.now() + 10000 };
          } else if (startPowerUpRef.current === 'speedBoost') {
              activePowerUps.current.speedBoost = { active: true, endTime: Date.now() + 5000 };
          }
      }
  }, [gameState]);

  // Animation Loop Manager
  useEffect(() => {
      const loop = () => {
          animationLoop();
      }
      animationFrameId.current = requestAnimationFrame(loop);
      return () => {
          if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      }
  }, [animationLoop]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
});
