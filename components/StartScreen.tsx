
import React from 'react';
import { Button } from './Button';

interface StartScreenProps {
  onStart: () => void;
  onShowCustomize: () => void;
  onShowSettings: () => void;
  onShowHighScore: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowCustomize, onShowSettings, onShowHighScore }) => {
  const title = "Planet Orbit";

  return (
    <div 
      className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex flex-col justify-center items-center p-4 text-center z-20"
      style={{
        paddingTop: `calc(1rem + env(safe-area-inset-top))`,
        paddingBottom: `calc(1rem + env(safe-area-inset-bottom))`,
        paddingLeft: `calc(1rem + env(safe-area-inset-left))`,
        paddingRight: `calc(1rem + env(safe-area-inset-right))`,
      }}
    >
      <h1 className="text-4xl sm:text-6xl font-bold mb-8 animate-glow-pulse flex" aria-label={title}>
        {title.split('').map((char, index) => (
          <span
            key={index}
            className="animate-float-in"
            style={{ animationDelay: `${index * 50}ms`, display: 'inline-block' }}
            aria-hidden="true"
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>

      <p 
        className="text-lg sm:text-2xl mb-8 max-w-md animate-fade-in font-medium text-white"
        style={{ 
          animationDelay: `${title.length * 50 + 200}ms`,
          textShadow: '0 2px 4px rgba(0,0,0,0.8)' 
        }}
      >
        Use the slider to change your orbit and dodge the asteroids. Collect power-ups for an advantage!
      </p>
      
      <div 
        className="flex flex-col items-center animate-slide-up w-full"
        style={{ animationDelay: `${title.length * 50 + 400}ms` }}
      >
        <Button onClick={onStart} className="w-64 mb-4 text-2xl py-4">
          Start Game
        </Button>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-lg mb-4">
          <Button onClick={onShowCustomize} variant="secondary" className="w-full sm:w-auto flex-1">Customize</Button>
          <Button onClick={onShowSettings} variant="secondary" className="w-full sm:w-auto flex-1">Settings</Button>
        </div>
        <div className="w-full max-w-xs sm:max-w-lg">
            <Button onClick={onShowHighScore} variant="secondary" className="w-full">My High Score</Button>
        </div>
      </div>
    </div>
  );
};