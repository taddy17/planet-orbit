
import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface TutorialOverlayProps {
    isPressing: boolean;
    onComplete: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ isPressing, onComplete }) => {
    const [step, setStep] = useState(0);

    // Step 0: Initial state, waiting for user to press
    // Step 1: User is pressing (moving away), waiting for release
    // Step 2: User released (moving closer), showing final message

    useEffect(() => {
        if (step === 0 && isPressing) {
            setStep(1);
        } else if (step === 1 && !isPressing) {
            setStep(2);
        }
    }, [isPressing, step]);

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center z-50 px-4">
            <div className="bg-black/80 backdrop-blur-md p-8 rounded-xl text-center max-w-sm border border-sky-500/50 animate-fade-in shadow-[0_0_30px_rgba(14,165,233,0.3)] pointer-events-auto">
                {step === 0 && (
                    <div className="animate-slide-up">
                        <h2 className="text-2xl font-bold text-sky-400 mb-4">Flight Control</h2>
                        <p className="text-white text-lg mb-6 leading-relaxed">
                            Tap and <span className="font-bold text-yellow-400">HOLD</span> anywhere on the screen to expand your orbit and move away from the planet.
                        </p>
                        <div className="animate-bounce text-5xl my-2">👆</div>
                        <p className="text-slate-400 text-sm mt-4">(Try it now)</p>
                    </div>
                )}
                {step === 1 && (
                    <div className="animate-slide-up">
                        <h2 className="text-2xl font-bold text-sky-400 mb-4">Good!</h2>
                        <p className="text-white text-lg mb-6 leading-relaxed">
                            Now <span className="font-bold text-yellow-400">RELEASE</span> to let gravity pull you back closer to the planet.
                        </p>
                    </div>
                )}
                {step === 2 && (
                    <div className="animate-slide-up">
                        <h2 className="text-2xl font-bold text-sky-400 mb-4">Ready?</h2>
                        <p className="text-white text-lg mb-6 leading-relaxed">
                            Your mission is to dodge the incoming asteroids. Do not crash into the planet or the rocks!
                        </p>
                        <Button onClick={onComplete} className="w-full">
                            Start Mission
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
