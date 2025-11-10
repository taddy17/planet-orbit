import React, { useRef, useEffect, useCallback } from 'react';
import type { GameState, PlayerSettings, Asteroid } from '../types';
import { DIFFICULTY_SETTINGS } from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  settings: PlayerSettings;
  onGameOver: (score: number) => void;
  setScore: (score: number) => void;
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

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, settings, onGameOver, setScore }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fix: The `useRef` hook requires an initial value. Pass `undefined` to satisfy the type.
  const animationFrameId = useRef<number | undefined>(undefined);
  
  // Use refs for game objects to avoid re-renders every frame
  const planet = useRef({ x: 0, y: 0, radius: 30 });
  const moon = useRef({ angle: 0, orbitRadius: 100, speed: 0.02, radius: 8 });
  const asteroids = useRef<Asteroid[]>([]);
  const isDragging = useRef(false);
  const gameTime = useRef({ start: 0, asteroidSpawnTimer: 0, asteroidSpawnInterval: 100 });
  const orbitBounds = useRef({ min: 50, max: 300 });

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
    
    moon.current.orbitRadius = Math.max(
      orbitBounds.current.min,
      Math.min(orbitBounds.current.max, moon.current.orbitRadius)
    );
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Planet
    ctx.shadowBlur = 40;
    ctx.shadowColor = settings.planetColor.substring(0, 7) + "4D";
    ctx.beginPath();
    ctx.arc(planet.current.x, planet.current.y, planet.current.radius, 0, Math.PI * 2);
    ctx.fillStyle = settings.planetColor;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Moon Orbit Path
    ctx.beginPath();
    ctx.arc(planet.current.x, planet.current.y, moon.current.orbitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw Asteroids
    asteroids.current.forEach(ast => {
      ctx.beginPath();
      ctx.arc(ast.x, ast.y, ast.radius, 0, Math.PI * 2);
      ctx.fillStyle = ast.color;
      ctx.strokeStyle = ast.stroke;
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });

    // Draw Moon
    const moonX = planet.current.x + Math.cos(moon.current.angle) * moon.current.orbitRadius;
    const moonY = planet.current.y + Math.sin(moon.current.angle) * moon.current.orbitRadius;
    ctx.shadowBlur = 20;
    ctx.shadowColor = settings.moonColor.substring(0, 7) + "80";
    ctx.beginPath();
    ctx.arc(moonX, moonY, moon.current.radius, 0, Math.PI * 2);
    ctx.fillStyle = settings.moonColor;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [settings.moonColor, settings.planetColor]);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const currentScore = Math.floor((Date.now() - gameTime.current.start) / 100);
    setScore(currentScore);

    // Spawn asteroids
    const difficultySetting = DIFFICULTY_SETTINGS[settings.difficulty];
    gameTime.current.asteroidSpawnTimer++;
    if (gameTime.current.asteroidSpawnTimer >= gameTime.current.asteroidSpawnInterval) {
      gameTime.current.asteroidSpawnTimer = 0;
      if (gameTime.current.asteroidSpawnInterval > difficultySetting.minSpawnInterval) {
          gameTime.current.asteroidSpawnInterval -= 0.5;
      }
      
      const canvas = canvasRef.current;
      if (canvas) {
        const radius = randomInt(8, 25);
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        } else {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }

        const targetX = planet.current.x + randomInt(-planet.current.radius, planet.current.radius);
        const targetY = planet.current.y + randomInt(-planet.current.radius, planet.current.radius);
        const angle = Math.atan2(targetY - y, targetX - x);
        const baseSpeed = difficultySetting.baseSpeed + (currentScore / difficultySetting.scoreDivider);
        const speed = randomInt(baseSpeed * 100, baseSpeed * 1.5 * 100) / 100;

        asteroids.current.push({
            x, y, radius, color: '#94a3b8', stroke: '#e2e8f0',
            dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed
        });
      }
    }
    
    // Update moon
    moon.current.angle += moon.current.speed;

    // Update asteroids and check for collisions
    const moonX = planet.current.x + Math.cos(moon.current.angle) * moon.current.orbitRadius;
    const moonY = planet.current.y + Math.sin(moon.current.angle) * moon.current.orbitRadius;

    for (let i = asteroids.current.length - 1; i >= 0; i--) {
        const ast = asteroids.current[i];
        ast.x += ast.dx;
        ast.y += ast.dy;
        
        if (getDistance(moonX, moonY, ast.x, ast.y) < moon.current.radius + ast.radius) {
            onGameOver(currentScore);
            return;
        }
        
        const canvas = canvasRef.current;
        if (canvas && (ast.x < -100 || ast.x > canvas.width + 100 || ast.y < -100 || ast.y > canvas.height + 100)) {
            asteroids.current.splice(i, 1);
        }
    }

    draw();
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [gameState, onGameOver, setScore, settings.difficulty, draw]);
  
  useEffect(() => {
    resizeCanvas();
    draw(); // Initial draw for start/gameover screens
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas, draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleInput = (x: number, y: number) => {
        if (!isDragging.current || gameState !== 'playing') return;
        const distFromPlanet = getDistance(planet.current.x, planet.current.y, x, y);
        moon.current.orbitRadius = Math.max(orbitBounds.current.min, Math.min(orbitBounds.current.max, distFromPlanet));
    };

    const onMouseDown = (e: MouseEvent) => { isDragging.current = true; handleInput(e.clientX, e.clientY); };
    const onMouseUp = () => { isDragging.current = false; };
    const onMouseMove = (e: MouseEvent) => handleInput(e.clientX, e.clientY);
    
    const onTouchStart = (e: TouchEvent) => { isDragging.current = true; handleInput(e.touches[0].clientX, e.touches[0].clientY); };
    const onTouchEnd = () => { isDragging.current = false; };
    const onTouchMove = (e: TouchEvent) => handleInput(e.touches[0].clientX, e.touches[0].clientY);

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);
    canvas.addEventListener('touchmove', onTouchMove);

    return () => {
        canvas.removeEventListener('mousedown', onMouseDown);
        canvas.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('mouseleave', onMouseUp);
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchend', onTouchEnd);
        canvas.removeEventListener('touchcancel', onTouchEnd);
        canvas.removeEventListener('touchmove', onTouchMove);
    }
  }, [gameState]);
  
  useEffect(() => {
    if (gameState === 'playing') {
      asteroids.current = [];
      gameTime.current.start = Date.now();
      gameTime.current.asteroidSpawnTimer = 0;
      gameTime.current.asteroidSpawnInterval = DIFFICULTY_SETTINGS[settings.difficulty].initialSpawnInterval;
      moon.current.angle = 0;
      moon.current.orbitRadius = (orbitBounds.current.min + orbitBounds.current.max) / 3;
      
      animationFrameId.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      draw(); // Draw static scene for non-playing states
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, settings.difficulty]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};
