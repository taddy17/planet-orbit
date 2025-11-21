import React from 'react';

interface ScoreDisplayProps {
  score: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  return (
    <div className="absolute top-14 left-4 sm:top-14 sm:left-8 text-2xl sm:text-4xl font-bold text-white z-10" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
      Score: <span>{score}</span>
    </div>
  );
};