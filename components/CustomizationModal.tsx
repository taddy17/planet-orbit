
import React, { useState } from 'react';
import type { PlayerSettings, Difficulty } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';

interface CustomizationModalProps {
  settings: PlayerSettings;
  onSave: (newSettings: Partial<PlayerSettings>) => void;
  onClose: () => void;
}

const DifficultyOption: React.FC<{ 
    value: Difficulty; 
    current: Difficulty; 
    onChange: (value: Difficulty) => void; 
    label: string; 
}> = ({ value, current, onChange, label }) => {
    const isChecked = value === current;
    return (
        <button 
            onClick={() => onChange(value)}
            className={`flex-1 py-4 border-2 rounded-xl font-bold transition-all duration-200 ease-in-out text-center text-sm shadow-sm
            ${isChecked 
                ? 'bg-sky-500 border-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)] transform scale-[1.02]' 
                : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-sky-500 hover:bg-slate-700'}`}
        >
            {label}
        </button>
    );
};

export const CustomizationModal: React.FC<CustomizationModalProps> = ({ settings, onSave, onClose }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.difficulty);
  const [displayName, setDisplayName] = useState<string>(settings.displayName || '');

  const handleSave = () => {
    onSave({
        difficulty,
        displayName: displayName.trim()
    });
  };

  return (
    <Modal show={true} onClose={onClose}>
      <div className="w-full max-w-lg mx-auto flex flex-col">
        
        <div className="shrink-0 mb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-white text-center tracking-tight mb-2">Settings</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0 pb-2">
             <div className="grid grid-cols-1 gap-8 text-left">
                <div className="space-y-6">
                    <h3 className="text-left text-sky-400 text-xs sm:text-sm font-black uppercase tracking-widest border-b border-slate-600 pb-2 mb-4">Pilot Profile</h3>
                    <div>
                        <label htmlFor="displayName" className="block text-lg font-bold mb-3 text-slate-200">Callsign</label>
                        <input 
                            id="displayName"
                            type="text" 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            maxLength={15}
                            className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl p-4 text-white font-bold text-lg focus:border-sky-500 focus:outline-none transition-all shadow-inner focus:ring-4 focus:ring-sky-500/20"
                            placeholder="Enter pilot name"
                        />
                        <p className="text-xs text-slate-400 mt-2 px-1">Max 15 characters. Visible on leaderboards.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-left text-sky-400 text-xs sm:text-sm font-black uppercase tracking-widest border-b border-slate-600 pb-2 mb-4">Simulation Parameters</h3>
                    <div>
                        <label className="block text-lg font-bold mb-3 text-slate-200">Difficulty Level</label>
                        <div className="flex gap-3">
                            <DifficultyOption value="easy" current={difficulty} onChange={setDifficulty} label="Easy" />
                            <DifficultyOption value="normal" current={difficulty} onChange={setDifficulty} label="Normal" />
                            <DifficultyOption value="hard" current={difficulty} onChange={setDifficulty} label="Hard" />
                        </div>
                        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-sm text-slate-300 leading-relaxed">
                            {difficulty === 'easy' && "Slower asteroids, more time to react. Good for training."}
                            {difficulty === 'normal' && "Standard speed and spawn rates. The intended experience."}
                            {difficulty === 'hard' && "Fast, aggressive asteroids with erratic movement. High risk, high reward."}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="shrink-0 flex gap-4 mt-6 pt-4 border-t border-slate-700/50">
          <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20 py-3 sm:py-4 text-lg">Save Settings</Button>
          <Button onClick={onClose} variant="secondary" className="w-24 sm:w-32 py-3 sm:py-4 text-lg">Cancel</Button>
        </div>
      </div>
    </Modal>
  );
};
