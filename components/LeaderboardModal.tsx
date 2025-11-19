import React, { useState } from 'react';
import type { LeaderboardEntry } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';

interface LeaderboardModalProps {
  personalScores: LeaderboardEntry[];
  globalScores: LeaderboardEntry[];
  onClose: () => void;
}

const formatDate = (timestamp: any): string => {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
        return '...';
    }
    return new Date(timestamp.toDate()).toLocaleDateString();
};

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ personalScores, globalScores, onClose }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'global'>('global');

  const renderList = (scores: LeaderboardEntry[], showName: boolean) => {
      if (scores.length === 0) {
          return <li className="text-center text-slate-400 py-4">No scores yet.</li>;
      }
      return scores.map((entry, index) => (
        <li 
            key={index} 
            className="flex justify-between items-center bg-white bg-opacity-10 p-2 px-4 rounded-lg mb-2 text-lg"
        >
            <span className="font-bold w-8">{index + 1}.</span>
            {showName && (
                <span className="flex-1 text-sky-300 text-sm truncate px-2">
                    {entry.displayName || 'Unknown Pilot'}
                </span>
            )}
            <span className={`text-slate-300 text-sm truncate pr-2 text-right ${showName ? 'w-24' : 'flex-1'}`}>
                {formatDate(entry.createdAt)}
            </span>
            <span className="font-bold text-amber-400 w-20 text-right">{entry.score}</span>
        </li>
    ));
  };

  return (
    <Modal show={true} onClose={onClose}>
      <div className="w-full max-w-md mx-auto h-[60vh] flex flex-col">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-white">Leaderboard</h1>
        
        <div className="flex w-full mb-4 border-b border-slate-600">
            <button 
                className={`flex-1 py-2 font-bold ${activeTab === 'global' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400'}`}
                onClick={() => setActiveTab('global')}
            >
                Global Top 20
            </button>
            <button 
                className={`flex-1 py-2 font-bold ${activeTab === 'personal' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400'}`}
                onClick={() => setActiveTab('personal')}
            >
                My Scores
            </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
            <ul className="list-none p-0 w-full text-left">
                {activeTab === 'global' ? renderList(globalScores, true) : renderList(personalScores, false)}
            </ul>
        </div>

        <Button onClick={onClose} variant="secondary" className="mt-4 w-48 self-center">
          Close
        </Button>
      </div>
    </Modal>
  );
};