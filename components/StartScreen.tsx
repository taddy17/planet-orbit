
import React from 'react';
import { Button } from './Button';

interface StartScreenProps {
  onStart: () => void;
  onShowCustomize: () => void;
  onShowSettings: () => void;
  onShowHighScore: () => void;
  highScore: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowCustomize, onShowSettings, onShowHighScore, highScore }) => {
  const title = "Planet Orbit";

  return (
    <div 
      className="absolute inset-0 flex flex-col justify-center items-center p-4 text-center z-20 overflow-hidden"
      style={{
        paddingTop: `calc(1rem + env(safe-area-inset-top))`,
        paddingBottom: `calc(1rem + env(safe-area-inset-bottom))`,
        paddingLeft: `calc(1rem + env(safe-area-inset-left))`,
        paddingRight: `calc(1rem + env(safe-area-inset-right))`,
        background: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.15) 0%, rgba(2, 6, 23, 0.85) 100%)',
        backdropFilter: 'blur(2px)'
      }}
    >
      {/* High Score Badge */}
      <div 
        onClick={onShowHighScore}
        className="absolute top-6 right-6 flex items-center gap-3 bg-slate-900/50 border border-slate-700/50 rounded-full pl-1 pr-4 py-1 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:bg-slate-800/80 hover:scale-105 transition-all cursor-pointer group z-30 backdrop-blur-md"
        style={{
          marginTop: 'env(safe-area-inset-top)',
          marginRight: 'env(safe-area-inset-right)'
        }}
      >
         <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:rotate-12 transition-transform">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.699-3.184a1 1 0 011.758 1.06l-1.699 3.185 1.983.792a1 1 0 01.547 1.286l-.41 1.214a1 1 0 01-1.245.663H15.9l-1.62 6.48a1 1 0 01-1.94-.484l.99-3.96H6.67l.99 3.96a1 1 0 01-1.94.485L4.1 10.92h-1.71a1 1 0 01-1.246-.663l-.41-1.214a1 1 0 01.548-1.286l1.982-.792-1.699-3.185a1 1 0 011.758-1.06l1.699 3.184L9 4.323V3a1 1 0 011-1zm-5 8.5a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v.5a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-.5z" clipRule="evenodd" />
            </svg>
         </div>
         <div className="flex flex-col items-start">
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">High Score</span>
            <span className="text-white font-black text-lg leading-none tabular-nums tracking-wide">
               {highScore.toLocaleString()}
            </span>
         </div>
      </div>

      {/* Title */}
      <h1 className="text-5xl sm:text-7xl font-black mb-4 tracking-tight select-none animate-float-in">
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-sm">
          {title}
        </span>
      </h1>

      <p 
        className="text-lg sm:text-xl mb-10 max-w-md font-medium text-slate-300/90 leading-relaxed animate-fade-in select-none"
        style={{ animationDelay: '200ms' }}
      >
        Master gravity. Dodge asteroids. <br/>
        <span className="text-sky-400 font-bold">Survive the void.</span>
      </p>
      
      <div 
        className="flex flex-col items-center w-full max-w-md gap-4 animate-slide-up"
        style={{ animationDelay: '400ms' }}
      >
        <Button 
            onClick={onStart} 
            className="w-full text-2xl py-5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 border-t border-sky-400/50 shadow-[0_0_30px_rgba(14,165,233,0.4)] transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-xl group relative overflow-hidden"
        >
            <span className="relative z-10 flex items-center justify-center gap-3 font-black tracking-wide uppercase text-white">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               Launch Mission
            </span>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
        </Button>

        <div className="flex gap-4 w-full">
          <Button onClick={onShowCustomize} variant="secondary" className="flex-1 py-3 bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-500 backdrop-blur-sm rounded-xl transition-all text-slate-200 font-bold">
             Customize
          </Button>
          <Button onClick={onShowSettings} variant="secondary" className="flex-1 py-3 bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-500 backdrop-blur-sm rounded-xl transition-all text-slate-200 font-bold">
             Settings
          </Button>
        </div>
      </div>
      
      <style>
        {`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
};
