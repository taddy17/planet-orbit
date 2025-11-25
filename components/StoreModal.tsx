
import React, { useState, useMemo } from 'react';
import type { PlayerSettings, StoreCategory, StoreItem } from '../types';
import { STORE_ITEMS } from '../constants';
import { Modal } from './Modal';
import { Button } from './Button';

interface StoreModalProps {
  settings: PlayerSettings;
  onPurchase: (item: StoreItem) => void;
  onEquip: (item: StoreItem) => void;
  onClose: () => void;
}

const CATEGORIES: { id: StoreCategory; label: string }[] = [
    { id: 'consumable', label: 'Power-ups' },
    { id: 'skin', label: 'Skins' },
    { id: 'planet', label: 'Planets' },
    { id: 'trail', label: 'Trails' },
    { id: 'background', label: 'Space' },
];

const ItemPreview: React.FC<{ item: StoreItem }> = ({ item }) => {
    switch (item.category) {
        case 'consumable':
            let content = null;
            if (item.value === 'shield') {
                content = (
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500 bg-blue-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                );
            } else if (item.value === 'speedBoost') {
                content = (
                    <div className="w-16 h-16 rounded-full border-4 border-yellow-500 bg-yellow-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                        <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                    </div>
                );
            }
            return (
                <div className="w-full h-32 rounded-t-xl bg-slate-900 flex items-center justify-center relative overflow-hidden border-b border-slate-700/50">
                     <div className="absolute inset-0 opacity-10" 
                          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                     />
                     {content}
                </div>
            );
        case 'planet':
            let planetContent = null;
            let containerStyle: React.CSSProperties = {};
            // Default circular shape
            let baseClasses = "w-20 h-20 rounded-full relative overflow-hidden shadow-2xl transition-transform duration-700 hover:rotate-12 hover:scale-110";
            
            if (item.id === 'planet_sun') {
                containerStyle = { background: 'radial-gradient(circle at 30% 30%, #fb923c, #ef4444, #7f1d1d)' };
                planetContent = (
                    <>
                        <div className="absolute inset-0 bg-orange-500/30 animate-pulse rounded-full blur-md"></div>
                        <div className="absolute -inset-1 bg-orange-500/20 blur-xl animate-[pulse_2s_infinite]"></div>
                    </>
                );
            } else if (item.id === 'planet_mars') {
                // Mars (Textured Red)
                containerStyle = { background: 'radial-gradient(circle at 40% 40%, #ef4444, #b91c1c, #7f1d1d)' };
                planetContent = (
                    <>
                        <div className="absolute top-3 left-2 w-8 h-5 bg-red-950/40 rounded-full blur-[1px] rotate-12"></div>
                        <div className="absolute bottom-4 right-3 w-10 h-8 bg-red-950/40 rounded-full blur-[2px] -rotate-6"></div>
                        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-red-900/30 rounded-full blur-[1px]"></div>
                        <div className="absolute inset-0 border border-red-300/10 rounded-full"></div>
                    </>
                );
            } else if (item.id === 'planet_gas') {
                // Gas Giant (Cloudy blobs)
                baseClasses = "w-24 h-24 relative transition-transform duration-700 hover:rotate-6 hover:scale-110";
                containerStyle = { background: 'transparent' };
                planetContent = (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute w-16 h-16 bg-purple-500/60 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute w-14 h-14 bg-fuchsia-600/50 rounded-full blur-lg translate-x-2 -translate-y-2"></div>
                        <div className="absolute w-12 h-12 bg-indigo-500/50 rounded-full blur-lg -translate-x-2 translate-y-2"></div>
                        <div className="absolute w-8 h-8 bg-purple-900/40 rounded-full blur-md"></div>
                    </div>
                );
            } else if (item.id === 'planet_proto') {
                // Protoplanet (Jagged)
                baseClasses = "w-20 h-20 relative shadow-2xl transition-transform duration-700 hover:rotate-12 hover:scale-110";
                containerStyle = { 
                    backgroundColor: '#44403c', 
                    clipPath: 'polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)'
                };
                planetContent = (
                    <>
                       <div className="absolute top-0 left-0 w-full h-full border-4 border-stone-600 opacity-50"></div>
                       <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-stone-900/30 blur-sm"></div>
                    </>
                );
            } else if (item.id === 'planet_seven') {
                // Sector 7 (Billiard Style)
                containerStyle = { background: 'radial-gradient(circle at 30% 30%, #065f46, #022c22)' };
                planetContent = (
                    <>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shadow-inner">
                            <span className="text-black font-black text-xl font-sans pt-0.5">7</span>
                        </div>
                        <div className="absolute inset-0 border-4 border-slate-400/50 rounded-full"></div>
                    </>
                );
            } else if (item.id === 'planet_ice_giant') {
                // Ice Giant (Jagged Crystal)
                baseClasses = "w-20 h-20 relative shadow-2xl transition-transform duration-700 hover:scale-110";
                containerStyle = { 
                    background: 'linear-gradient(135deg, #cffafe, #06b6d4)',
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', // Star/Spike shape
                };
                planetContent = (
                    <>
                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-2 border-white/50"></div>
                    </>
                );
            } else if (item.id === 'planet_turkey') {
                // Turkey Planet
                baseClasses = "w-24 h-24 relative transition-transform duration-700 hover:scale-110";
                containerStyle = { background: 'transparent' };
                planetContent = (
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Tail */}
                        <div className="absolute -top-4 w-20 h-12 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-t-full"></div>
                        {/* Body */}
                        <div className="absolute w-12 h-12 bg-amber-900 rounded-full shadow-lg"></div>
                        {/* Head */}
                        <div className="absolute -top-3 w-8 h-8 bg-amber-800 rounded-full border border-amber-900"></div>
                        {/* Beak */}
                        <div className="absolute -top-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[8px] border-t-yellow-400"></div>
                        {/* Wattle */}
                        <div className="absolute top-0 left-4 w-2 h-4 bg-red-600 rounded-full rotate-12"></div>
                    </div>
                );
            } else if (item.id === 'planet_cat') {
                // Cat Planet
                baseClasses = "w-20 h-20 relative transition-transform duration-700 hover:scale-110";
                containerStyle = { background: 'transparent' };
                planetContent = (
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Ears */}
                        <div className="absolute -top-2 -left-1 w-8 h-8 bg-gray-600 rotate-[-15deg] skew-x-12"></div>
                        <div className="absolute -top-2 -right-1 w-8 h-8 bg-gray-600 rotate-[15deg] -skew-x-12"></div>
                        {/* Head */}
                        <div className="absolute w-16 h-14 bg-gray-500 rounded-[40%] shadow-lg"></div>
                        {/* Eyes */}
                        <div className="absolute top-4 left-3 w-3 h-2 bg-green-400 rounded-full border border-black/20"></div>
                        <div className="absolute top-4 right-3 w-3 h-2 bg-green-400 rounded-full border border-black/20"></div>
                        {/* Nose */}
                        <div className="absolute top-7 w-2 h-1.5 bg-pink-400 rounded-full"></div>
                        {/* Whiskers */}
                        <div className="absolute top-7 -left-2 w-6 h-[1px] bg-gray-300 rotate-12"></div>
                        <div className="absolute top-8 -left-2 w-6 h-[1px] bg-gray-300"></div>
                        <div className="absolute top-7 -right-2 w-6 h-[1px] bg-gray-300 -rotate-12"></div>
                        <div className="absolute top-8 -right-2 w-6 h-[1px] bg-gray-300"></div>
                    </div>
                );
            } else if (item.id === 'planet_void') {
                 containerStyle = { background: '#09090b', boxShadow: 'inset 0 0 20px #6b21a8' };
                 planetContent = (
                     <>
                        <div className="absolute inset-0 border-4 border-purple-900/50 rounded-full"></div>
                        <div className="absolute inset-0 bg-purple-500/10 animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black rounded-full shadow-[0_0_15px_#a855f7]"></div>
                     </>
                 );
            } else if (item.id === 'planet_neon') {
                 containerStyle = { background: 'linear-gradient(135deg, #f0abfc, #d946ef)' };
                 planetContent = (
                     <>
                         <div className="absolute inset-0 border-2 border-fuchsia-300 opacity-50 rounded-full" 
                              style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .5) 25%, rgba(255, 255, 255, .5) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .5) 75%, rgba(255, 255, 255, .5) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .5) 25%, rgba(255, 255, 255, .5) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .5) 75%, rgba(255, 255, 255, .5) 76%, transparent 77%, transparent)', backgroundSize: '16px 16px' }}
                         ></div>
                         <div className="absolute inset-0 bg-fuchsia-500/20 animate-pulse rounded-full"></div>
                     </>
                 );
            } else if (item.id === 'planet_gold') {
                 containerStyle = { background: 'radial-gradient(circle at 30% 30%, #fef08a, #fbbf24, #b45309)' };
                 planetContent = (
                     <>
                        <div className="absolute top-2 left-4 w-8 h-8 bg-white/40 blur-md rounded-full"></div>
                        <div className="absolute inset-0 bg-yellow-200/10 animate-pulse rounded-full"></div>
                        <div className="absolute -inset-1 bg-yellow-400/20 blur-lg rounded-full"></div>
                     </>
                 );
            } else {
                // Default / Terra Blue
                containerStyle = { background: 'radial-gradient(circle at 30% 30%, #7dd3fc, #0ea5e9, #0369a1)' };
                planetContent = (
                    <>
                        <div className="absolute top-4 right-2 w-10 h-6 bg-white/10 rounded-full blur-[2px]"></div>
                        <div className="absolute bottom-4 left-4 w-12 h-8 bg-white/5 rounded-full blur-[1px]"></div>
                        <div className="absolute top-0 w-full h-full bg-blue-400/10 rounded-full"></div>
                    </>
                );
            }

            return (
                <div className="w-full h-32 rounded-t-xl bg-slate-900 flex items-center justify-center relative overflow-hidden border-b border-slate-700/50 group-hover:bg-slate-800 transition-colors">
                     {/* Background Grid Hint */}
                     <div className="absolute inset-0 opacity-10" 
                          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                     />
                     {/* Planet */}
                     <div 
                        className={baseClasses}
                        style={containerStyle}
                     >
                        {planetContent}
                     </div>
                </div>
            );
        case 'trail':
            let trailContent = null;
            if (item.value === 'rainbow') {
                trailContent = (
                    <>
                        <div className="w-3 h-3 rounded-full opacity-30 blur-[1px] bg-red-500"></div>
                        <div className="w-4 h-4 rounded-full opacity-50 blur-[0.5px] bg-green-500"></div>
                        <div className="w-6 h-6 rounded-full opacity-80 bg-blue-500"></div>
                    </>
                );
            } else if (item.value === 'flame') {
                trailContent = (
                    <>
                        <div className="w-3 h-3 rounded bg-orange-500 opacity-60 animate-[pulse_0.5s_infinite]"></div>
                        <div className="w-4 h-4 rounded bg-red-500 opacity-80 rotate-45"></div>
                        <div className="w-6 h-6 rounded bg-yellow-500 opacity-90 blur-[1px]"></div>
                    </>
                );
            } else if (item.value === 'ice') {
                 trailContent = (
                    <>
                        <div className="w-3 h-3 rotate-45 bg-cyan-200 opacity-40"></div>
                        <div className="w-4 h-4 rotate-12 bg-cyan-300 opacity-60"></div>
                        <div className="w-6 h-6 rotate-45 bg-cyan-400 opacity-80 border border-white/50"></div>
                    </>
                );
            } else if (item.value === 'laser') {
                 trailContent = (
                    <div className="relative w-16 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]">
                        <div className="absolute inset-x-0 top-1/2 h-[2px] bg-white -translate-y-1/2"></div>
                    </div>
                 );
            } else if (item.value === 'dust') {
                 trailContent = (
                    <>
                        <div className="w-3 h-3 rounded-full bg-slate-400 opacity-30"></div>
                        <div className="w-4 h-4 rounded-full bg-slate-400 opacity-40"></div>
                        <div className="w-5 h-5 rounded-full bg-slate-300 opacity-50"></div>
                    </>
                 );
            } else {
                 trailContent = (
                    <>
                        <div className="w-3 h-3 rounded-full opacity-20 blur-[1px]" style={{ backgroundColor: item.value }}></div>
                        <div className="w-4 h-4 rounded-full opacity-40 blur-[0.5px]" style={{ backgroundColor: item.value }}></div>
                        <div className="w-6 h-6 rounded-full opacity-70" style={{ backgroundColor: item.value }}></div>
                    </>
                 );
            }

             return (
                <div className="w-full h-32 rounded-t-xl bg-slate-900 flex items-center justify-center relative overflow-hidden border-b border-slate-700/50">
                     <div className="absolute inset-0 opacity-10" 
                          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                     />
                     {/* Trail Effect */}
                     <div className={`flex items-center gap-1 relative ${item.value === 'laser' ? '' : 'transform rotate-12'}`}>
                         {trailContent}
                         {/* Moon (unless laser covers it, but we show moon at end) */}
                         <div className="w-8 h-8 rounded-full bg-slate-200 shadow-md relative z-10 border-2 border-slate-800 ml-1"></div>
                     </div>
                </div>
            );
        case 'skin':
             let skinStyle: React.CSSProperties = {};
             let inner = null;
             
             if (item.value === 'smooth') {
                 skinStyle = { background: 'radial-gradient(circle at 30% 30%, #ffffff, #94a3b8)' };
             } else if (item.value === 'crater') {
                 skinStyle = { backgroundColor: '#94a3b8' };
                 inner = (
                     <>
                        <div className="absolute top-2 left-3 w-3 h-3 bg-slate-600/40 rounded-full shadow-inner"></div>
                        <div className="absolute bottom-3 right-5 w-4 h-4 bg-slate-600/40 rounded-full shadow-inner"></div>
                        <div className="absolute top-6 right-3 w-2 h-2 bg-slate-600/40 rounded-full shadow-inner"></div>
                     </>
                 )
             } else if (item.value === 'tech') {
                  skinStyle = { 
                      backgroundColor: '#334155',
                      border: '2px solid #0ea5e9',
                      boxShadow: '0 0 10px #0ea5e980'
                  };
                  inner = (
                    <>
                        <div className="w-4 h-4 border border-sky-400/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute inset-0 border border-sky-400/20 rounded-full"></div>
                    </>
                  );
             } else if (item.value === 'ice') {
                 skinStyle = {
                     background: 'linear-gradient(135deg, #cffafe 0%, #06b6d4 100%)',
                     boxShadow: '0 0 10px #22d3ee'
                 };
                 inner = <div className="absolute inset-0 border-2 border-white/50 rounded-full opacity-50"></div>;
             } else if (item.value === 'camo') {
                 skinStyle = { backgroundColor: '#57534e' };
                 inner = (
                     <>
                        <div className="absolute top-2 left-2 w-4 h-3 bg-green-700 rounded-full"></div>
                        <div className="absolute bottom-2 right-2 w-5 h-4 bg-green-900 rounded-full"></div>
                     </>
                 );
             } else if (item.value === 'golden') {
                 skinStyle = {
                     background: 'radial-gradient(circle at 30% 30%, #fef08a, #ca8a04)',
                     boxShadow: '0 0 20px #eab308'
                 };
                 inner = <div className="absolute top-3 left-3 w-2 h-2 bg-white/80 rounded-full blur-[1px]"></div>;
             } else if (item.value === 'basketball') {
                 skinStyle = { backgroundColor: '#f97316' };
                 inner = (
                     <>
                        <div className="absolute inset-0 border border-orange-950/40 rounded-full"></div>
                        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-orange-950/60 -translate-x-1/2"></div>
                        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-orange-950/60 -translate-y-1/2"></div>
                        <div className="absolute top-0 bottom-0 left-[15%] right-[15%] border-x border-orange-950/60 rounded-[100%]"></div>
                     </>
                 );
             } else if (item.value === 'beachball') {
                 skinStyle = { 
                     background: 'conic-gradient(#ef4444 0deg 60deg, #ffffff 60deg 120deg, #3b82f6 120deg 180deg, #eab308 180deg 240deg, #22c55e 240deg 300deg, #f97316 300deg 360deg)' 
                 };
                 inner = <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>;
             } else if (item.value === 'tennis') {
                 skinStyle = { backgroundColor: '#bef264' };
                 inner = (
                     <>
                        <div className="absolute inset-2 border-2 border-white rounded-full opacity-80" style={{ clipPath: 'path("M 0,20 Q 20,0 40,20")' }}></div>
                        <div className="absolute inset-0 border-2 border-white/50 rounded-full opacity-50" style={{ transform: 'rotate(45deg) scaleX(0.5)' }}></div>
                     </>
                 );
             } else if (item.value === 'apple') {
                 skinStyle = { background: 'radial-gradient(circle at 30% 30%, #fca5a5, #ef4444)' };
                 inner = (
                     <>
                        <div className="absolute -top-3 left-1/2 w-[2px] h-3 bg-amber-900 -translate-x-1/2"></div>
                        <div className="absolute -top-2 left-1/2 w-3 h-2 bg-green-600 rounded-full rounded-bl-none"></div>
                        <div className="absolute top-2 left-3 w-2 h-2 bg-white/40 blur-[1px] rounded-full"></div>
                     </>
                 );
             } else {
                 // Default
                 skinStyle = { backgroundColor: '#e2e8f0' };
                 inner = (
                    <>
                        <div className="absolute top-3 left-4 w-2 h-2 bg-slate-400/50 rounded-full"></div>
                    </>
                 );
             }

             return (
                <div className="w-full h-32 rounded-t-xl bg-slate-900 flex items-center justify-center relative overflow-hidden border-b border-slate-700/50">
                     <div className="absolute inset-0 opacity-10" 
                          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                     />
                     <div className="w-16 h-16 rounded-full relative shadow-2xl transition-transform hover:scale-110 duration-500 overflow-visible" style={skinStyle}>
                         {inner}
                     </div>
                </div>
            );
        case 'background':
            let bgStyle: React.CSSProperties = {};
            let overlay = null;

            if (item.value === 'deep_space') {
                bgStyle = { backgroundColor: '#020617' };
                overlay = <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '50px 50px', opacity: 0.3 }}></div>;
            }
            else if (item.value === 'star_field') {
                bgStyle = { backgroundColor: '#020617' };
                overlay = <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px)', backgroundSize: '15px 15px', opacity: 0.8 }}></div>;
            } 
            else if (item.value === 'nebula_storm') {
                bgStyle = { background: 'linear-gradient(135deg, #1a0510 0%, #4a0e2e 50%, #1a0510 100%)' };
                overlay = <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent"></div>;
            } 
            else if (item.value === 'void') {
                bgStyle = { backgroundColor: '#000000' };
            }
            else if (item.value === 'cyber_grid') {
                bgStyle = { backgroundColor: '#0a0a0f' };
                overlay = (
                    <div className="absolute inset-0 flex flex-col justify-end">
                        <div className="h-1/2 w-full border-t border-sky-500/30" style={{ background: 'linear-gradient(to bottom, transparent, rgba(14, 165, 233, 0.1))' }}>
                             <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(14, 165, 233, .3) 25%, rgba(14, 165, 233, .3) 26%, transparent 27%, transparent 74%, rgba(14, 165, 233, .3) 75%, rgba(14, 165, 233, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(14, 165, 233, .3) 25%, rgba(14, 165, 233, .3) 26%, transparent 27%, transparent 74%, rgba(14, 165, 233, .3) 75%, rgba(14, 165, 233, .3) 76%, transparent 77%, transparent)', backgroundSize: '30px 30px' }}></div>
                        </div>
                    </div>
                );
            }

            return (
                <div className="w-full h-32 rounded-t-xl flex items-center justify-center relative overflow-hidden border-b border-slate-700/50" style={bgStyle}>
                     {overlay}
                     <div className="w-10 h-10 rounded-full bg-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.2)] relative z-10 border border-slate-900/20"></div>
                </div>
            );
        default:
            return <div className="h-32 bg-slate-800 rounded-t-xl border-b border-slate-700"></div>;
    }
}

export const StoreModal: React.FC<StoreModalProps> = ({ settings, onPurchase, onEquip, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<StoreCategory>('consumable');

  const filteredItems = useMemo(() => 
    STORE_ITEMS.filter(item => item.category === activeCategory), 
  [activeCategory]);

  const isEquipped = (item: StoreItem) => {
      if (item.category === 'consumable') {
          return settings.equippedConsumable === item.id;
      }
      return settings[item.settingKey] === item.value;
  };

  const isUnlocked = (item: StoreItem) => {
      // Consumables are not "unlocked" in the same way, we just check count
      if (item.category === 'consumable') return true; 
      // Default items (price 0) are always unlocked, or if ID is in unlockedItems
      return item.price === 0 || settings.unlockedItems.includes(item.id);
  };

  const getInventoryCount = (itemId: string) => {
      return settings.inventory?.[itemId] || 0;
  }

  return (
    <Modal show={true} onClose={onClose}>
      <div className="w-full max-w-5xl mx-auto h-[85vh] flex flex-col">
        
        {/* Header - Fixed */}
        <div className="shrink-0 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Supply Depot</h1>
            <div className="flex items-center gap-3 bg-slate-900/90 px-6 py-3 rounded-full border border-amber-500/30 shadow-lg shadow-amber-500/10">
                <span className="text-amber-400 text-2xl drop-shadow-md">🪙</span>
                <span className="text-2xl font-black text-white tabular-nums tracking-wide">{settings.credits.toLocaleString()}</span>
            </div>
        </div>

        {/* Category Tabs - Fixed */}
        <div className="shrink-0 mb-6 px-1">
            <div className="flex gap-2 overflow-x-auto p-2 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex-1 min-w-[90px] py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all whitespace-nowrap border-2
                        ${activeCategory === cat.id 
                            ? 'bg-sky-600 border-sky-400 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] transform -translate-y-0.5' 
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-500'}`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Items Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => {
                    const owned = isUnlocked(item);
                    const equipped = isEquipped(item);
                    const canAfford = settings.credits >= item.price;
                    const inventoryCount = getInventoryCount(item.id);
                    const isConsumable = item.category === 'consumable';

                    return (
                        <div 
                            key={item.id}
                            className={`rounded-2xl flex flex-col relative transition-all duration-300 group
                            ${equipped 
                                ? 'bg-slate-800 border-2 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.25)] ring-1 ring-sky-400/50 scale-[1.02] z-10' 
                                : 'bg-slate-800/60 border border-slate-700 hover:border-slate-500 hover:bg-slate-700/80 hover:shadow-xl hover:-translate-y-1'}`}
                        >
                            {/* Preview Image */}
                            <ItemPreview item={item} />

                            {/* Equipped Badge */}
                            {equipped && (
                                <div className="absolute top-3 right-3 z-20">
                                    <span className="bg-sky-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1">
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                        Equipped
                                    </span>
                                </div>
                            )}

                            {/* Inventory Badge for Consumables */}
                            {isConsumable && (
                                <div className="absolute top-3 left-3 z-20">
                                     <span className="bg-slate-900/80 backdrop-blur-sm border border-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                         Owned: {inventoryCount}
                                     </span>
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1 gap-3">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className={`font-bold text-xl leading-tight ${equipped ? 'text-sky-400' : 'text-white'}`}>
                                        {item.name}
                                    </h3>
                                </div>
                                
                                <p className="text-slate-400 text-sm flex-1 leading-relaxed">{item.description}</p>
                                
                                <div className="mt-2 pt-3 flex gap-2">
                                    {/* Action Button 1: Equip/Unequip (if owned) */}
                                    {isConsumable && inventoryCount > 0 ? (
                                        <Button 
                                            onClick={() => onEquip(item)}
                                            className={`flex-1 py-3 text-sm font-black uppercase tracking-widest transition-all
                                            ${equipped 
                                                ? 'bg-sky-900/30 border-2 border-sky-500/30 text-sky-400 shadow-none' 
                                                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/20'}`}
                                            variant={equipped ? 'secondary' : 'primary'}
                                        >
                                            {equipped ? 'Unequip' : 'Equip'}
                                        </Button>
                                    ) : !isConsumable && owned ? (
                                        <Button 
                                            onClick={() => onEquip(item)}
                                            disabled={equipped}
                                            className={`w-full py-3 text-sm font-black uppercase tracking-widest transition-all
                                            ${equipped 
                                                ? 'bg-sky-900/30 border-2 border-sky-500/30 text-sky-400 cursor-default shadow-none' 
                                                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/20'}`}
                                            variant={equipped ? 'secondary' : 'primary'}
                                        >
                                            {equipped ? 'Equipped' : 'Equip'}
                                        </Button>
                                    ) : null}

                                    {/* Action Button 2: Buy (Only for consumables or unowned permanent items) */}
                                    {(!owned || isConsumable) && (
                                        <Button 
                                            onClick={() => onPurchase(item)}
                                            disabled={!canAfford}
                                            className={`py-3 text-sm flex items-center justify-center gap-2 font-black uppercase tracking-wide transition-all ${isConsumable ? 'flex-1' : 'w-full'}
                                            ${!canAfford 
                                                ? 'opacity-60 cursor-not-allowed bg-slate-700 text-slate-400 shadow-none border border-slate-600' 
                                                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-500/30 transform hover:scale-[1.02]'}`}
                                        >
                                            {isConsumable ? (
                                                <div className="flex flex-col items-center leading-none">
                                                    <span className="text-[10px] opacity-80">Buy</span>
                                                    <span>{item.price} 🪙</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <span>Purchase</span>
                                                    <span className="bg-black/30 px-2 py-0.5 rounded text-amber-100 tabular-nums">{item.price.toLocaleString()} 🪙</span>
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Footer - Fixed */}
        <div className="shrink-0 pt-4 mt-2 px-2">
            <Button onClick={onClose} variant="secondary" className="w-full py-4 text-lg font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 shadow-lg">
                Back to Base
            </Button>
        </div>
      </div>
    </Modal>
  );
};
