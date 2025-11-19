import React from 'react';

interface LevelDisplayProps {
  level: number;
}

export const LevelDisplay: React.FC<LevelDisplayProps> = ({ level }) => {
  return (
    <div className="absolute top-4 right-4 sm:top-8 sm:right-8 text-2xl sm:text-4xl font-bold text-white z-10" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
      Level: <span>{level}</span>
    </div>
  );
};
