
import React from 'react';
import { Button } from './Button';

interface StartScreenProps {
  onStart: () => void;
  onShowCustomize: () => void;
  onShowHighScore: () => void;
  onShowLeaderboard: () => void;
  onShowStore: () => void;
  highScore: number;
  credits?: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({ 
  onStart, 
  onShowCustomize, 
  onShowHighScore, 
  onShowLeaderboard, 
  onShowStore,
  highScore,
  credits = 0 
}) => {
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
      
      {/* Credits Badge */}
      <div 
        className="absolute top-6 left-6 flex items-center gap-2 z-30"
        style={{
          marginTop: 'env(safe-area-inset-top)',
          marginLeft: 'env(safe-area-inset-left)'
        }}
      >
         <div className="bg-slate-900/60 border border-amber-500/30 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg backdrop-blur-md">
             <span className="text-amber-400 text-lg">🪙</span>
             <span className="text-white font-bold text-lg">{credits.toLocaleString()}</span>
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

        <Button 
            onClick={onShowStore} 
            variant="secondary" 
            className="w-full py-3 bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-500 backdrop-blur-sm rounded-xl transition-all text-slate-200 font-bold flex items-center justify-center gap-2"
        >
             {/* Marketplace Icon */}
             <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
             </svg>
             Supply Depot
        </Button>

        <Button 
          onClick={onShowLeaderboard} 
          variant="secondary" 
          className="w-full py-3 bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-500 backdrop-blur-sm rounded-xl transition-all text-slate-200 font-bold flex items-center justify-center gap-2"
        >
          {/* Bar Chart Icon */}
          <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Leaderboard
        </Button>

        <Button 
            onClick={onShowCustomize} 
            variant="secondary" 
            className="w-full py-3 bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-500 backdrop-blur-sm rounded-xl transition-all text-slate-200 font-bold flex items-center justify-center gap-2"
        >
             <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
             Settings
        </Button>
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
