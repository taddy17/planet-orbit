
import React, { useRef, useEffect, useCallback } from 'react';
import type { GameState, PlayerSettings, Asteroid, Crater, Point, Particle, LevelUpAnimation, Star, Nebula, ShootingStar, PowerUp, PowerUpType, ActivePowerUps } from '../types';
import { DIFFICULTY_SETTINGS, LEVELS } from '../constants';
import { initAudio, playSpawnSound, playNearMissSound, playGameOverSound, playCollisionSound, playLevelUpSound, playPowerUpCollectSound, playBombSound, playShieldBlockSound } from '../services/sound';

interface GameCanvasProps {
  gameState: GameState;
  settings: PlayerSettings;
  onGameOver: (score: number) => void;
  setScore: (score: number) => void;
  setLevel: (level: number) => void;
  orbitRadius: number;
  onBoundsChange: (bounds: { min: number; max: number }) => void;
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
    const factor = 1 - percent / 100;
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r = Math.floor(r * factor);
    g = Math.floor(g * factor);
    b = Math.floor(b * factor);

    const toHex = (c: number) => ('00' + c.toString(16)).slice(-2);

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const lightenColor = (hex: string, percent: number): string => {
    const factor = 1 + percent / 100;
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r = Math.min(255, Math.floor(r * factor));
    g = Math.min(255, Math.floor(g * factor));
    b = Math.min(255, Math.floor(b * factor));
    
    const toHex = (c: number) => ('00' + c.toString(16)).slice(-2);

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, settings, onGameOver, setScore, setLevel, orbitRadius, onBoundsChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);
  
  const planet = useRef({ x: 0, y: 0, radius: 30, atmosphereRotation: 0 });
  const moon = useRef({ angle: 0, orbitRadius: 100, speed: 0.02, radius: 8 });
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

  const gameTime = useRef({ start: 0, asteroidSpawnTimer: 0, asteroidSpawnInterval: 100, powerUpSpawnTimer: 0 });
  const orbitBounds = useRef({ min: 50, max: 300 });

  const POWER_UP_SPAWN_INTERVAL = 900; // ~15 seconds at 60fps

  const initBackground = useCallback((canvas: HTMLCanvasElement) => {
    stars.current = [];
    const starCount = Math.floor((canvas.width * canvas.height) / 4000);
    for (let i = 0; i < starCount; i++) {
        stars.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.2 + 0.5,
            alpha: Math.random() * 0.5 + 0.5,
            speed: Math.random() * 0.3 + 0.1,
        });
    }

    nebulae.current = [];
    const nebulaCount = randomInt(4, 6);
    const nebulaColors = ['rgba(8, 79, 138, 0.1)', 'rgba(107, 33, 168, 0.1)', 'rgba(7, 89, 133, 0.15)'];
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
  }, []);

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
    
    initBackground(canvas);
    onBoundsChange({ min: orbitBounds.current.min, max: orbitBounds.current.max });

  }, [onBoundsChange, initBackground]);

  useEffect(() => {
    moon.current.orbitRadius = orbitRadius;
  }, [orbitRadius]);

  // Creates an asteroid with difficulty-specific skins
  const spawnAsteroid = (canvasWidth: number, canvasHeight: number, isAmbient: boolean = false) => {
    const difficulty = settings.difficulty;
    
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

    const angleToPlanet = Math.atan2(planet.current.y - y, planet.current.x - x);
    
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

    return {
        x, y, radius,
        dx: Math.cos(angleToPlanet) * speed,
        dy: Math.sin(angleToPlanet) * speed,
        color, stroke, craters, shape,
        nearMissPlayed: false
    };
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Nebulae
    ctx.globalCompositeOperation = 'lighter';
    nebulae.current.forEach(nebula => {
        // Pulsing effect
        const pulseScale = 1 + 0.1 * Math.sin(nebula.pulsePhase);
        const pulseRadius = nebula.radius * pulseScale;
        
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

    // Draw Stars
    stars.current.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
    });

    // Draw Shooting Stars
    shootingStars.current.forEach(s => {
        ctx.save();
        ctx.beginPath();
        const trailLength = s.length;
        const angle = Math.atan2(s.vy, s.vx);
        
        const startX = s.x;
        const startY = s.y;
        const endX = s.x - Math.cos(angle) * trailLength;
        const endY = s.y - Math.sin(angle) * trailLength;
        
        const grad = ctx.createLinearGradient(startX, startY, endX, endY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
        grad.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();
    });


    // Draw Planet
    ctx.save();
    ctx.beginPath();
    ctx.arc(planet.current.x, planet.current.y, planet.current.radius, 0, Math.PI * 2);
    ctx.shadowBlur = 40;
    ctx.shadowColor = settings.planetColor.substring(0, 7) + "4D";

    const planetGradient = ctx.createRadialGradient(
        planet.current.x - planet.current.radius * 0.3,
        planet.current.y - planet.current.radius * 0.3,
        planet.current.radius * 0.1,
        planet.current.x,
        planet.current.y,
        planet.current.radius
    );
    const baseColor = settings.planetColor;
    const lightColor = lightenColor(baseColor, 20);
    const darkColor = darkenColor(baseColor, 40);
    planetGradient.addColorStop(0, lightColor);
    planetGradient.addColorStop(0.5, baseColor);
    planetGradient.addColorStop(1, darkColor);

    ctx.fillStyle = planetGradient;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Add atmospheric bands for texture (Rotating)
    const time = Date.now() * 0.0002;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(
            planet.current.x,
            planet.current.y,
            planet.current.radius * (0.6 + i * 0.08),
            Math.PI * (0.1 + i * 0.4) + time * (i % 2 === 0 ? 1 : -0.5) + planet.current.atmosphereRotation,
            Math.PI * (1 + 0.1 * i * 0.6) + time * (i % 2 === 0 ? 1 : -0.5) + planet.current.atmosphereRotation
        );
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + Math.random() * 0.05})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.stroke();
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

      // Visual Feedback: Hard difficulty glow effect
      if (settings.difficulty === 'hard') {
          ctx.shadowColor = '#ef4444'; // Red glow
          ctx.shadowBlur = 12;
      }

      ctx.beginPath();
      ctx.moveTo(ast.shape[0].x, ast.shape[0].y);
      for (let i = 1; i < ast.shape.length; i++) {
          ctx.lineTo(ast.shape[i].x, ast.shape[i].y);
      }
      ctx.closePath();
      
      ctx.fillStyle = ast.color;
      ctx.strokeStyle = ast.stroke;
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      
      // Reset shadow for inner details
      if (settings.difficulty === 'hard') {
          ctx.shadowBlur = 0;
      }

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      ast.craters.forEach(crater => {
          ctx.beginPath();
          ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
          ctx.fillStyle = crater.color;
          ctx.fill();
          ctx.stroke();
      });
      
      ctx.restore();
    });

    // Draw PowerUps
    powerUps.current.forEach(p => drawPowerUp(ctx, p));

    // Draw Moon (if not colliding or if in ambient mode)
    if (!isColliding.current) {
        const moonX = planet.current.x + Math.cos(moon.current.angle) * moon.current.orbitRadius;
        const moonY = planet.current.y + Math.sin(moon.current.angle) * moon.current.orbitRadius;

        // Draw Speed Boost Trail
        if (activePowerUps.current.speedBoost.active) {
            const trailLength = 20;
            const currentSpeed = activePowerUps.current.speedBoost.active ? moon.current.speed * 2 : moon.current.speed;
            for (let i = 1; i <= trailLength; i++) {
                const pastAngle = moon.current.angle - currentSpeed * i * 2;
                const pastX = planet.current.x + Math.cos(pastAngle) * moon.current.orbitRadius;
                const pastY = planet.current.y + Math.sin(pastAngle) * moon.current.orbitRadius;
                ctx.beginPath();
                ctx.arc(pastX, pastY, moon.current.radius * (1 - i / (trailLength * 1.5)), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(251, 191, 36, ${0.3 * (1 - i / trailLength)})`; // amber-400
                ctx.fill();
            }
        }
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(moonX, moonY, moon.current.radius, 0, Math.PI * 2);

        if (activePowerUps.current.speedBoost.active) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#fbb_f24'; // amber-400
        } else {
            ctx.shadowBlur = 20;
            ctx.shadowColor = settings.moonColor.substring(0, 7) + "80";
        }

        ctx.fillStyle = settings.moonColor;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Add craters to the moon for texture
        ctx.fillStyle = darkenColor(settings.moonColor, 15);
        ctx.strokeStyle = darkenColor(settings.moonColor, 30);
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 5; i++) {
            const craterAngle = (i * 1.3) + (moon.current.angle * 0.2); // Make craters rotate slightly with moon
            const craterDist = (i / 5) * (moon.current.radius * 0.7);
            const craterRadius = (i % 2 === 0 ? 1.5 : 2.5) * (moon.current.radius / 8);
            ctx.beginPath();
            ctx.arc(
                moonX + Math.cos(craterAngle) * craterDist,
                moonY + Math.sin(craterAngle) * craterDist,
                craterRadius,
                0,
                Math.PI * 2
            );
            ctx.globalAlpha = 0.8;
            ctx.fill();
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

    particles.current.forEach(p => {
        ctx.beginPath();
        ctx.globalAlpha = p.life / p.initialLife;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });

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
        ctx.shadowColor = 'rgba(255, 255, 100, 0.7)';
        ctx.shadowBlur = 20;
        ctx.fillText(`Level Up!`, canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
  }, [settings]);

  const animationLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Always animate background elements ---
    stars.current.forEach(star => {
      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }
    });

    // Update Nebulae
    nebulae.current.forEach(nebula => {
      nebula.x += nebula.dx;
      nebula.y += nebula.dy;
      nebula.pulsePhase += nebula.pulseSpeed;
      
      if (nebula.x - nebula.radius > canvas.width || nebula.x + nebula.radius < 0 ||
          nebula.y - nebula.radius > canvas.height || nebula.y + nebula.radius < 0) {
          nebula.x = Math.random() * canvas.width;
          nebula.y = -nebula.radius;
      }
    });

    // Spawn Shooting Stars (Rarely)
    if (Math.random() < 0.005) {
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
        s.x += s.vx;
        s.y += s.vy;
        s.opacity -= 0.015;
        if (s.opacity <= 0 || s.x > canvas.width + 100 || s.y > canvas.height + 100) {
            shootingStars.current.splice(i, 1);
        }
    }
    
    // Rotate planet atmosphere
    planet.current.atmosphereRotation += 0.0005;

    // --- Logic splits based on state ---
    
    if (gameState === 'playing') {
      // === PLAYING LOGIC ===
      const now = Date.now();
      if (activePowerUps.current.shield.active && now > activePowerUps.current.shield.endTime) {
          activePowerUps.current.shield.active = false;
      }
      if (activePowerUps.current.speedBoost.active && now > activePowerUps.current.speedBoost.endTime) {
          activePowerUps.current.speedBoost.active = false;
      }

      for (let i = particles.current.length - 1; i >= 0; i--) {
          const p = particles.current[i];
          p.x += p.dx;
          p.y += p.dy;
          p.dx *= 0.98;
          p.dy *= 0.98;
          p.life--;
          if (p.life <= 0) {
              particles.current.splice(i, 1);
          }
      }
      
      if (screenFlash.current.alpha > 0) {
          screenFlash.current.alpha = Math.max(0, screenFlash.current.alpha - 0.05);
      }
      
      if (levelUpAnimation.current.alpha > 0) {
          levelUpAnimation.current.alpha -= 0.02;
          levelUpAnimation.current.scale += 0.01;
      } else {
          levelUpAnimation.current.alpha = 0;
      }

      if (isColliding.current) {
        // Physics pause on collision
      } else {
        const currentScore = Math.floor((Date.now() - gameTime.current.start) / 100);
        setScore(currentScore);

        const nextLevelIndex = currentLevel.current;
        if (nextLevelIndex < LEVELS.length && currentScore >= LEVELS[nextLevelIndex].threshold) {
            currentLevel.current++;
            setLevel(currentLevel.current);
            playLevelUpSound();
            levelUpAnimation.current = { alpha: 1, scale: 0.5 };
        }

        const levelConfig = LEVELS[Math.min(currentLevel.current - 1, LEVELS.length - 1)];
        const difficultySetting = DIFFICULTY_SETTINGS[settings.difficulty];
        
        // Spawn Power Ups
        gameTime.current.powerUpSpawnTimer++;
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

        // Update power-ups
        for (let i = powerUps.current.length - 1; i >= 0; i--) {
            const p = powerUps.current[i];
            p.x += p.dx;
            p.y += p.dy;
            p.rotation += p.rotationSpeed;
            p.life--;
            if (p.life <= 0) {
                powerUps.current.splice(i, 1);
            }
        }

        // Spawn Asteroids
        gameTime.current.asteroidSpawnTimer++;
        if (gameTime.current.asteroidSpawnTimer >= gameTime.current.asteroidSpawnInterval) {
          gameTime.current.asteroidSpawnTimer = 0;
          const minInterval = difficultySetting.minSpawnInterval * levelConfig.spawnMultiplier;
          if (gameTime.current.asteroidSpawnInterval > minInterval) {
              gameTime.current.asteroidSpawnInterval -= 0.5;
          }
          
          asteroids.current.push(spawnAsteroid(canvas.width, canvas.height));
          
          // Play sound
          const lastAsteroid = asteroids.current[asteroids.current.length - 1];
          playSpawnSound(lastAsteroid.x, canvas.width, settings.difficulty);
        }

        // Move Asteroids
        for (let i = asteroids.current.length - 1; i >= 0; i--) {
          const ast = asteroids.current[i];
          ast.x += ast.dx;
          ast.y += ast.dy;

          // Collision with Planet (Remove)
          const distToPlanet = getDistance(ast.x, ast.y, planet.current.x, planet.current.y);
          if (distToPlanet < planet.current.radius + ast.radius) {
            asteroids.current.splice(i, 1);
            continue;
          }

          // Collision with Shield
           if (activePowerUps.current.shield.active) {
                const distToMoon = getDistance(ast.x, ast.y, 
                    planet.current.x + Math.cos(moon.current.angle) * moon.current.orbitRadius,
                    planet.current.y + Math.sin(moon.current.angle) * moon.current.orbitRadius
                );
                if (distToMoon < moon.current.radius + ast.radius + 8) { // +8 is shield gap
                    playShieldBlockSound();
                    // Create particles
                    for (let j = 0; j < 5; j++) {
                        particles.current.push({
                            x: ast.x,
                            y: ast.y,
                            dx: (Math.random() - 0.5) * 3,
                            dy: (Math.random() - 0.5) * 3,
                            radius: Math.random() * 2 + 1,
                            color: '#93c5fd',
                            life: 30,
                            initialLife: 30
                        });
                    }
                    asteroids.current.splice(i, 1);
                    continue;
                }
           }

          // Collision with Moon
          if (!activePowerUps.current.shield.active) {
              const moonX = planet.current.x + Math.cos(moon.current.angle) * moon.current.orbitRadius;
              const moonY = planet.current.y + Math.sin(moon.current.angle) * moon.current.orbitRadius;
              const distToMoon = getDistance(ast.x, ast.y, moonX, moonY);

              if (distToMoon < moon.current.radius + ast.radius) {
                playCollisionSound();
                isColliding.current = true;
                
                // Explosion particles
                for(let j=0; j<15; j++) {
                    particles.current.push({
                        x: moonX,
                        y: moonY,
                        dx: (Math.random() - 0.5) * 5,
                        dy: (Math.random() - 0.5) * 5,
                        radius: Math.random() * 3 + 1,
                        color: settings.moonColor,
                        life: 40,
                        initialLife: 40
                    });
                }
                for(let j=0; j<10; j++) {
                    particles.current.push({
                        x: ast.x,
                        y: ast.y,
                        dx: (Math.random() - 0.5) * 5,
                        dy: (Math.random() - 0.5) * 5,
                        radius: Math.random() * 3 + 1,
                        color: ast.color,
                        life: 40,
                        initialLife: 40
                    });
                }
                screenFlash.current.alpha = 0.8;

                setTimeout(() => {
                    playGameOverSound();
                    onGameOver(Math.floor((Date.now() - gameTime.current.start) / 100));
                }, 500);
                asteroids.current.splice(i, 1);
                continue;
              }
              
              // Near miss sound
              if (!ast.nearMissPlayed && distToMoon < moon.current.radius + ast.radius + 60) {
                  playNearMissSound(ast.x, canvas.width, settings.difficulty);
                  ast.nearMissPlayed = true;
              }
          }
        }
        
        // Check PowerUp Collection
        const moonX = planet.current.x + Math.cos(moon.current.angle) * moon.current.orbitRadius;
        const moonY = planet.current.y + Math.sin(moon.current.angle) * moon.current.orbitRadius;
        
        for (let i = powerUps.current.length - 1; i >= 0; i--) {
            const p = powerUps.current[i];
            const dist = getDistance(p.x, p.y, moonX, moonY);
            if (dist < moon.current.radius + p.radius) {
                playPowerUpCollectSound();
                
                if (p.type === 'shield') {
                    activePowerUps.current.shield = { active: true, endTime: Date.now() + 10000 };
                } else if (p.type === 'speedBoost') {
                    activePowerUps.current.speedBoost = { active: true, endTime: Date.now() + 5000 };
                } else if (p.type === 'bomb') {
                    playBombSound();
                    screenFlash.current.alpha = 0.6;
                    // Destroy all asteroids
                    asteroids.current = [];
                }

                powerUps.current.splice(i, 1);
            }
        }
      }

      if (!isColliding.current) {
         // Moon Movement
         // Direction is controlled by clicking on left/right side of screen (not implemented here)
         // Orbit control is via slider (react state -> orbitRadius)
         
         // Just advance angle for now
         const baseSpeed = 0.02;
         const boostMultiplier = activePowerUps.current.speedBoost.active ? 2 : 1;
         moon.current.angle += baseSpeed * boostMultiplier;
      }
      
    } else if (gameState === 'start' || gameState === 'login' || gameState === 'gameOver') {
        // === AMBIENT MODE LOGIC ===
        // Auto-rotate moon
        moon.current.angle += 0.01;
        
        // Spawn ambient asteroids rarely
        if (Math.random() < 0.05) { 
            asteroids.current.push(spawnAsteroid(canvas.width, canvas.height, true));
        }

        // Move ambient asteroids
        for (let i = asteroids.current.length - 1; i >= 0; i--) {
            const ast = asteroids.current[i];
            ast.x += ast.dx;
            ast.y += ast.dy;
            ast.dx *= 0.999; // Slight drag
            ast.dy *= 0.999;

            // Remove if far off screen
            if (ast.x < -100 || ast.x > canvas.width + 100 || ast.y < -100 || ast.y > canvas.height + 100) {
                asteroids.current.splice(i, 1);
            }
            // Remove if hits planet
             const distToPlanet = getDistance(ast.x, ast.y, planet.current.x, planet.current.y);
             if (distToPlanet < planet.current.radius + ast.radius) {
                asteroids.current.splice(i, 1);
             }
        }
        
        // Clear particles in ambient mode so they don't freeze
        particles.current = [];
        powerUps.current = [];
    }

    draw();
    animationFrameId.current = requestAnimationFrame(animationLoop);
  }, [gameState, settings, onGameOver, draw, setScore, setLevel]);

  // Game Reset / Init
  useEffect(() => {
    if (gameState === 'playing') {
      isColliding.current = false;
      asteroids.current = [];
      particles.current = [];
      powerUps.current = [];
      activePowerUps.current = { shield: { active: false, endTime: 0 }, speedBoost: { active: false, endTime: 0 } };
      moon.current.angle = 0;
      gameTime.current.start = Date.now();
      gameTime.current.asteroidSpawnTimer = 0;
      gameTime.current.asteroidSpawnInterval = DIFFICULTY_SETTINGS[settings.difficulty].initialSpawnInterval;
      currentLevel.current = 1;
      initAudio();
    }
  }, [gameState, settings.difficulty]);

  useEffect(() => {
    const handleResize = () => {
      resizeCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    resizeCanvas();
    
    animationFrameId.current = requestAnimationFrame(animationLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [resizeCanvas, animationLoop]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};
