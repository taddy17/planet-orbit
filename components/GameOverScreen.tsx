
import React from 'react';
import { Button } from './Button';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
  onShowLeaderboard: () => void;
  onShowCustomize: () => void;
  onShowSettings: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart, onShowLeaderboard, onShowCustomize, onShowSettings }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-md flex flex-col justify-center items-center p-4 text-center z-20">
      <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-red-500" style={{ textShadow: '0 0 20px #dc2626' }}>
        Game Over
      </h1>
      <p className="text-xl sm:text-3xl mb-2">Final Score:</p>
      <p className="text-5xl sm:text-7xl font-bold mb-8 text-white">{score}</p>
      <Button onClick={onRestart} className="w-64 mb-4 text-2xl py-4">
        Restart
      </Button>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md">
        <Button onClick={onShowLeaderboard} variant="secondary" className="w-full sm:w-auto flex-1">Leaderboard</Button>
        <Button onClick={onShowCustomize} variant="secondary" className="w-full sm:w-auto flex-1">Customize</Button>
        <Button onClick={onShowSettings} variant="secondary" className="w-full sm:w-auto flex-1">Settings</Button>
      </div>
    </div>
  );
};
