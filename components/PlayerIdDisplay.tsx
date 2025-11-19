import React from 'react';

interface PlayerIdDisplayProps {
  userId: string | undefined;
  displayName?: string;
}

export const PlayerIdDisplay: React.FC<PlayerIdDisplayProps> = ({ userId, displayName }) => {
  const displayId = userId ? `...${userId.slice(-6)}` : '...';
  return (
    <div className="absolute bottom-4 left-4 text-xs text-slate-500 z-10">
        <div className="font-bold text-slate-400 text-sm">{displayName || 'Pilot'}</div>
        <div>ID: <span>{displayId}</span></div>
    </div>
  );
};