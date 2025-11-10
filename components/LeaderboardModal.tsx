
import React from 'react';
import type { LeaderboardEntry } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';

interface LeaderboardModalProps {
  scores: LeaderboardEntry[];
  currentUserId: string | undefined;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ scores, currentUserId, onClose }) => {
  return (
    <Modal show={true} onClose={onClose}>
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl sm:text-5xl font-bold mb-6 text-white">Leaderboard</h1>
        <ul className="list-none p-0 w-full max-w-md text-left">
          {scores.length > 0 ? (
            scores.map((entry, index) => (
              <li 
                key={index} 
                className={`flex justify-between items-center bg-white bg-opacity-10 p-2 px-4 rounded-lg mb-2 text-lg ${entry.userId === currentUserId ? 'ring-2 ring-sky-400' : ''}`}
              >
                <span className="font-bold w-8">{index + 1}.</span>
                <span className="flex-1 text-slate-300 text-sm truncate pr-2">
                  {entry.userId === currentUserId ? 'You' : 'Player'} ({entry.userId.substring(0, 6)}...)
                </span>
                <span className="font-bold text-sky-400">{entry.score}</span>
              </li>
            ))
          ) : (
            <li className="text-center text-slate-400">No scores yet. Be the first!</li>
          )}
        </ul>
        <Button onClick={onClose} variant="secondary" className="mt-8 w-48">
          Close
        </Button>
      </div>
    </Modal>
  );
};
