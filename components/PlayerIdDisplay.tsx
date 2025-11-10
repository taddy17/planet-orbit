
import React from 'react';

interface PlayerIdDisplayProps {
  userId: string;
}

export const PlayerIdDisplay: React.FC<PlayerIdDisplayProps> = ({ userId }) => {
  return (
    <div className="absolute bottom-4 left-4 text-xs text-slate-500 z-10">
      Player ID: <span>{userId}</span>
    </div>
  );
};
