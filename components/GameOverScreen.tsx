
import React from 'react';
import { Button } from './Button';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  onExit: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestart, onExit }) => {
  // highScore prop already contains the *updated* high score from App.tsx if it was beaten.
  const isNewRecord = score > 0 && score >= highScore;

  return (
    <div 
      className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex flex-col justify-center items-center p-4 text-center z-20"
      style={{
        paddingTop: `calc(1rem + env(safe-area-inset-top))`,
        paddingBottom: `calc(1rem + env(safe-area-inset-bottom))`,
        paddingLeft: `calc(1rem + env(safe-area-inset-left))`,
        paddingRight: `calc(1rem + env(safe-area-inset-right))`,
      }}
    >
      <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-red-500" style={{ textShadow: '0 0 20px #dc2626' }}>
        Game Over
      </h1>
      
      {isNewRecord && (
          <div className="mb-4 animate-bounce bg-amber-500/20 px-6 py-2 rounded-lg border border-amber-500/50">
            <span className="text-yellow-400 font-bold text-xl sm:text-2xl" style={{ textShadow: '0 0 15px #fbbf24' }}>
                🏆 NEW HIGH SCORE! 🏆
            </span>
          </div>
      )}

      <p className="text-xl sm:text-3xl mb-2 text-slate-300">Final Score</p>
      <p className="text-5xl sm:text-7xl font-bold mb-8 text-white">{score}</p>
      
      <div className="flex flex-col gap-4 w-full max-w-xs items-center">
        <Button onClick={onRestart} className="w-full text-2xl py-4">
          Try Again
        </Button>
        
        <Button onClick={onExit} variant="secondary" className="w-full text-xl py-3">
          Exit
        </Button>
      </div>
    </div>
  );
};
