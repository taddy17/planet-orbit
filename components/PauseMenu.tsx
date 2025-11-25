
import React from 'react';
import { Button } from './Button';

interface PauseMenuProps {
  onResume: () => void;
  onExit: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onExit }) => {
  return (
    <div 
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col justify-center items-center p-4 text-center z-50 animate-fade-in"
      style={{
        paddingTop: `calc(1rem + env(safe-area-inset-top))`,
        paddingBottom: `calc(1rem + env(safe-area-inset-bottom))`,
      }}
    >
      <h1 className="text-5xl font-black mb-8 text-white tracking-widest uppercase" style={{ textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
        Paused
      </h1>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button onClick={onResume} className="w-full text-xl py-4 bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-500/20 border border-sky-400/50">
          Resume Mission
        </Button>
        
        <Button onClick={onExit} variant="secondary" className="w-full text-lg py-3 bg-slate-800 border-slate-700">
          Abort Mission
        </Button>
      </div>
    </div>
  );
};
