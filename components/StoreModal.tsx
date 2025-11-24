
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
    { id: 'skin', label: 'Skins' },
    { id: 'planet', label: 'Planets' },
    { id: 'trail', label: 'Trails' },
    { id: 'background', label: 'Space' },
];

const ItemPreview: React.FC<{ item: StoreItem }> = ({ item }) => {
    switch (item.category) {
        case 'planet':
            let planetContent = null;
            let containerStyle: React.CSSProperties = {};
            const baseClasses = "w-20 h-20 rounded-full relative overflow-hidden shadow-2xl transition-transform duration-700 hover:rotate-12 hover:scale-110";
            
            if (item.id === 'planet_sun') {
                containerStyle = { background: 'radial-gradient(circle at 30% 30%, #fb923c, #ef4444, #7f1d1d)' };
                planetContent = (
                    <>
                        <div className="absolute inset-0 bg-orange-500/30 animate-pulse rounded-full blur-md"></div>
                        <div className="absolute -inset-1 bg-orange-500/20 blur-xl animate-[pulse_2s_infinite]"></div>
                    </>
                );
            } else if (item.id === 'planet_ice_giant') {
                containerStyle = { background: 'radial-gradient(circle at 30% 30%, #ecfeff, #a5f3fc, #0891b2)' };
                planetContent = (
                    <>
                        <div className="absolute top-1/4 -left-2 w-[120%] h-2 bg-white/30 rotate-12 blur-[1px]"></div>
                        <div className="absolute top-1/2 -left-2 w-[120%] h-4 bg-white/20 rotate-12 blur-[2px]"></div>
                        <div className="absolute top-2 right-4 w-4 h-4 bg-white/80 rounded-full blur-[4px]"></div>
                        <div className="absolute inset-0 border border-white/20 rounded-full"></div>
                    </>
                );
            } else if (item.id === 'planet_mars') {
                 containerStyle = { background: 'radial-gradient(circle at 40% 40%, #fca5a5, #ef4444, #7f1d1d)' };
                 planetContent = (
                     <>
                        <div className="absolute top-4 left-3 w-6 h-4 bg-red-900/20 rounded-full blur-[1px] rotate-12"></div>
                        <div className="absolute bottom-5 right-4 w-8 h-8 bg-red-900/20 rounded-full blur-[2px]"></div>
                        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-950/30 rounded-full blur-[0.5px]"></div>
                     </>
                 );
            } else if (item.id === 'planet_toxic') {
                 containerStyle = { background: 'radial-gradient(circle at 50% 50%, #86efac, #22c55e, #14532d)' };
                 planetContent = (
                     <>
                        <div className="absolute bottom-2 left-1/4 w-3 h-3 bg-lime-300/60 rounded-full animate-[bounce_3s_infinite]"></div>
                        <div className="absolute bottom-4 right-1/3 w-2 h-2 bg-lime-300/40 rounded-full animate-[bounce_2.2s_infinite]"></div>
                        <div className="absolute inset-0 bg-green-500/10 blur-sm animate-pulse"></div>
                     </>
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
                     <div className="w-16 h-16 rounded-full relative shadow-2xl transition-transform hover:scale-110 duration-500" style={skinStyle}>
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
  const [activeCategory, setActiveCategory] = useState<StoreCategory>('skin');

  const filteredItems = useMemo(() => 
    STORE_ITEMS.filter(item => item.category === activeCategory), 
  [activeCategory]);

  const isEquipped = (item: StoreItem) => {
      return settings[item.settingKey] === item.value;
  };

  const isUnlocked = (item: StoreItem) => {
      // Default items (price 0) are always unlocked, or if ID is in unlockedItems
      return item.price === 0 || settings.unlockedItems.includes(item.id);
  };

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
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
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
        <div className="flex-1 overflow-y-auto min-h-0 px-2 pb-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => {
                    const owned = isUnlocked(item);
                    const equipped = isEquipped(item);
                    const canAfford = settings.credits >= item.price;

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
                                        Active
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
                                
                                <div className="mt-2 pt-3">
                                    {owned ? (
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
                                    ) : (
                                        <Button 
                                            onClick={() => onPurchase(item)}
                                            disabled={!canAfford}
                                            className={`w-full py-3 text-sm flex items-center justify-center gap-2 font-black uppercase tracking-wide transition-all
                                            ${!canAfford 
                                                ? 'opacity-60 cursor-not-allowed bg-slate-700 text-slate-400 shadow-none border border-slate-600' 
                                                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-500/30 transform hover:scale-[1.02]'}`}
                                        >
                                            <span>Purchase</span>
                                            <span className="bg-black/30 px-2 py-0.5 rounded text-amber-100 tabular-nums">{item.price.toLocaleString()} 🪙</span>
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
