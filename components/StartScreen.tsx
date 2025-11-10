
import React from 'react';
import { Button } from './Button';

interface StartScreenProps {
  onStart: () => void;
  onShowLeaderboard: () => void;
  onShowCustomize: () => void;
  onShowSettings: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowLeaderboard, onShowCustomize, onShowSettings }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-md flex flex-col justify-center items-center p-4 text-center z-20">
      <h1 className="text-4xl sm:text-6xl font-bold mb-4" style={{ textShadow: '0 0 20px #0ea5e9' }}>
        Planet Orbit
      </h1>
      <p className="text-lg sm:text-2xl mb-8 max-w-md">
        Drag to change your orbit and dodge the asteroids.
      </p>
      <Button onClick={onStart} className="w-64 mb-4 text-2xl py-4">
        Start Game
      </Button>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md">
        <Button onClick={onShowLeaderboard} variant="secondary" className="w-full sm:w-auto flex-1">Leaderboard</Button>
        <Button onClick={onShowCustomize} variant="secondary" className="w-full sm:w-auto flex-1">Customize</Button>
        <Button onClick={onShowSettings} variant="secondary" className="w-full sm:w-auto flex-1">Settings</Button>
      </div>
    </div>
  );
};
