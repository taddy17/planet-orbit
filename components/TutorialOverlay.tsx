
import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface TutorialOverlayProps {
    isPressing: boolean;
    onComplete: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ isPressing, onComplete }) => {
    const [step, setStep] = useState(0);

    // Step 0: Initial state, waiting for user to press (Hold Control)
    // Step 1: User is pressing (moving away), waiting for release (Release Control)
    // Step 2: Explain Powerups
    // Step 3: Final Goal & Start

    useEffect(() => {
        if (step === 0 && isPressing) {
            setStep(1);
        } else if (step === 1 && !isPressing) {
            setStep(2);
        }
    }, [isPressing, step]);

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center z-50 px-4">
            <div className="bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl text-center max-w-sm border border-sky-500/50 animate-fade-in shadow-[0_0_40px_rgba(14,165,233,0.2)] pointer-events-auto overflow-hidden">
                
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-6">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-sky-400' : 'w-2 bg-slate-600'}`} />
                    ))}
                </div>

                {step === 0 && (
                    <div className="animate-slide-up">
                        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">Flight Control</h2>
                        <div className="w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-500 animate-pulse">
                            <svg className="w-8 h-8 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zM14 13v-5.5c0-.83-.67-1.5-1.5-1.5S11 6.67 11 7.5V13h3zm-4.5-3v6H6v-2h2V9.5h1.5z"/></svg>
                        </div>
                        <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                            Tap and <span className="font-bold text-sky-400">HOLD</span> anywhere to engage thrusters and expand your orbit.
                        </p>
                        <p className="text-slate-500 text-xs uppercase tracking-widest animate-pulse">(Press and hold now)</p>
                    </div>
                )}

                {step === 1 && (
                    <div className="animate-slide-up">
                        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">Gravity Well</h2>
                        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-500">
                             <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                        </div>
                        <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                            Now <span className="font-bold text-sky-400">RELEASE</span> to let gravity pull you back toward the planet.
                        </p>
                        <p className="text-slate-500 text-xs uppercase tracking-widest animate-pulse">(Release screen)</p>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-slide-up text-left">
                        <h2 className="text-2xl font-black text-white mb-4 text-center uppercase tracking-wider">Supply Drops</h2>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                <div className="w-10 h-10 rounded-full border-2 border-blue-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-blue-400 font-bold text-sm">Shield</p>
                                    <p className="text-slate-400 text-xs">Absorbs one impact.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                <div className="w-10 h-10 rounded-full border-2 border-yellow-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                                     <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                                </div>
                                <div>
                                    <p className="text-yellow-400 font-bold text-sm">Energy Boost</p>
                                    <p className="text-slate-400 text-xs">Increases speed & scoring.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                <div className="w-10 h-10 rounded-full border-2 border-red-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                                     <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <div>
                                    <p className="text-red-500 font-bold text-sm">Nuke</p>
                                    <p className="text-slate-400 text-xs">Destroys all asteroids.</p>
                                </div>
                            </div>
                        </div>
                        
                        <Button onClick={() => setStep(3)} className="w-full">
                            Next
                        </Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-slide-up">
                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Mission</h2>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6">
                            <p className="text-white text-lg font-medium leading-relaxed">
                                <span className="text-amber-400 font-bold">SURVIVE</span> the void. 
                            </p>
                            <p className="text-slate-400 text-sm mt-2">
                                Avoid asteroids at all costs. The longer you orbit, the higher your score.
                            </p>
                        </div>
                        <Button onClick={onComplete} className="w-full text-lg py-4 bg-green-600 hover:bg-green-500 shadow-green-500/30">
                            Launch Mission
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
