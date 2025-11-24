
import React, { useState, useEffect } from 'react';
import type { LeaderboardEntry, Difficulty } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';

interface LeaderboardModalProps {
  globalScores: LeaderboardEntry[];
  isLoading?: boolean;
  currentUserId?: string;
  onClose: () => void;
  onFetchDifficulty: (difficulty: Difficulty) => void;
  initialDifficulty: Difficulty;
}

const formatDate = (timestamp: any): string => {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
        return '...';
    }
    return new Date(timestamp.toDate()).toLocaleDateString();
};

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ 
    globalScores, 
    isLoading = false, 
    currentUserId, 
    onClose,
    onFetchDifficulty,
    initialDifficulty
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(initialDifficulty);

  // Fetch when tab changes (handled by parent, we just invoke callback)
  const handleDifficultyChange = (diff: Difficulty) => {
      setSelectedDifficulty(diff);
      onFetchDifficulty(diff);
  };

  const renderList = (scores: LeaderboardEntry[]) => {
      if (isLoading) {
          return <li className="text-center text-slate-400 py-4 animate-pulse">Scanning Data...</li>;
      }
      if (!scores || scores.length === 0) {
          return <li className="text-center text-slate-400 py-4">No scores on this frequency.</li>;
      }
      return scores.map((entry, index) => {
        const isCurrentUser = currentUserId && entry.userId === currentUserId;
        return (
        <li 
            key={entry.userId || index} 
            className={`flex justify-between items-center p-2 px-4 rounded-lg mb-2 text-lg ${
              isCurrentUser 
                ? 'bg-sky-500 bg-opacity-30 border-2 border-sky-400' 
                : 'bg-white bg-opacity-10'
            }`}
        >
            <span className="font-bold w-8 text-slate-400">{index + 1}.</span>
            <span className={`flex-1 text-sm truncate px-2 ${isCurrentUser ? 'text-white font-bold' : 'text-sky-300'}`}>
                {entry.displayName || 'Unknown Pilot'}
            </span>
            <span className="text-slate-500 text-xs truncate pr-2 text-right w-20 hidden sm:block">
                {formatDate(entry.createdAt)}
            </span>
            <span className="font-bold text-amber-400 w-20 text-right tabular-nums">{entry.score.toLocaleString()}</span>
        </li>
        );
      });
  };

  return (
    <Modal show={true} onClose={onClose}>
      <div className="w-full max-w-md mx-auto h-[60vh] flex flex-col">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Leaderboard</h1>
        
        {/* Difficulty Tabs - Using Grid for exact equal widths */}
        <div className="grid grid-cols-3 gap-2 mb-4 shrink-0 w-full">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
                <button
                    key={diff}
                    onClick={() => handleDifficultyChange(diff)}
                    className={`w-full py-2 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wide transition-all flex items-center justify-center
                    ${selectedDifficulty === diff 
                        ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    {diff}
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            <ul className="list-none p-0 w-full text-left">
                {renderList(globalScores)}
            </ul>
        </div>

        <Button onClick={onClose} variant="secondary" className="mt-4 w-48 self-center">
          Close
        </Button>
      </div>
    </Modal>
  );
};
