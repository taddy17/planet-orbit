
import React, { useState } from 'react';
import type { PlayerSettings, Difficulty } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';

interface SettingsModalProps {
  settings: PlayerSettings;
  onSave: (newSettings: PlayerSettings) => void;
  onClose: () => void;
}

const DifficultyOption: React.FC<{ value: Difficulty; current: Difficulty; onChange: (value: Difficulty) => void; label: string; }> = ({ value, current, onChange, label }) => {
    const isChecked = value === current;
    return (
        <div>
            <input type="radio" id={`difficulty-${value}`} name="difficulty" value={value} checked={isChecked} onChange={() => onChange(value)} className="hidden" />
            <label 
                htmlFor={`difficulty-${value}`}
                className={`block flex-1 p-4 border-2 rounded-lg cursor-pointer font-bold transition-all duration-200 ease-in-out text-center
                ${isChecked 
                    ? 'bg-sky-500 border-sky-500 text-white scale-105' 
                    : 'border-slate-600 hover:border-sky-500'}`}
            >
                {label}
            </label>
        </div>
    );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.difficulty);

  const handleSave = () => {
    onSave({ ...settings, difficulty });
  };

  return (
    <Modal show={true} onClose={onClose}>
      <div className="w-full max-w-sm mx-auto">
        <h1 className="text-3xl sm:text-5xl font-bold mb-6 text-white">Settings</h1>
        <div className="bg-slate-700 p-6 rounded-lg w-full">
            <h2 className="text-xl font-semibold mb-4 text-center">Difficulty</h2>
            <div className="grid grid-cols-3 gap-4">
                <DifficultyOption value="easy" current={difficulty} onChange={setDifficulty} label="Easy" />
                <DifficultyOption value="normal" current={difficulty} onChange={setDifficulty} label="Normal" />
                <DifficultyOption value="hard" current={difficulty} onChange={setDifficulty} label="Hard" />
            </div>
        </div>
        <div className="flex gap-4 mt-8 justify-center">
          <Button onClick={handleSave} className="w-32">Save</Button>
          <Button onClick={onClose} variant="secondary" className="w-32">Close</Button>
        </div>
      </div>
    </Modal>
  );
};
