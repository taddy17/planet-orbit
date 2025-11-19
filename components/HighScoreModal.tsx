import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface HighScoreModalProps {
  score: number;
  onClose: () => void;
}

export const HighScoreModal: React.FC<HighScoreModalProps> = ({ score, onClose }) => {
  return (
    <Modal show={true} onClose={onClose}>
      <div className="w-full max-w-sm mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-white">My High Score</h1>
        
        <div className="bg-slate-800/80 rounded-xl p-8 border border-slate-600 shadow-2xl mb-8 transform transition-transform hover:scale-105">
             <p className="text-slate-400 text-sm uppercase tracking-widest mb-3">Personal Best</p>
             <p className="text-6xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                {score}
             </p>
        </div>

        <Button onClick={onClose} variant="secondary" className="w-full">
          Close
        </Button>
      </div>
    </Modal>
  );
};