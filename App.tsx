import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  connectAndAuth,
  onAuthChange, 
  loadSettings, 
  saveSettings as saveSettingsToFirebase, 
  saveScoreToLeaderboard,
  listenToLeaderboard
} from './services/firebase';
import type { GameState, PlayerSettings, Difficulty, LeaderboardEntry } from './types';
import { GameCanvas } from './components/GameCanvas';
import { LoginScreen } from './components/LoginScreen';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { ScoreDisplay } from './components/ScoreDisplay';
import { PlayerIdDisplay } from './components/PlayerIdDisplay';
import { LeaderboardModal } from './components/LeaderboardModal';
import { CustomizeModal } from './components/CustomizeModal';
import { SettingsModal } from './components/SettingsModal';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  const [settings, setSettings] = useState<PlayerSettings>({
    planetColor: '#0ea5e9',
    moonColor: '#e5e7eb',
    difficulty: 'normal',
  });

  const [isLeaderboardVisible, setLeaderboardVisible] = useState(false);
  const [isCustomizeVisible, setCustomizeVisible] = useState(false);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    let authUnsubscribe: () => void = () => {};
    let leaderboardUnsubscribe: () => void = () => {};

    const initializeApp = async () => {
      const isConnected = await connectAndAuth();
      
      if (!isConnected) {
        console.warn("Firebase connection failed. Running in offline mode.");
        setGameState('start'); // Go to start screen for offline play
        return;
      }
      
      // If connected, set up listeners
      authUnsubscribe = onAuthChange(async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          const userSettings = await loadSettings(firebaseUser.uid);
          if (userSettings) {
            setSettings(userSettings);
          }
          setGameState('start');
        } else {
          setGameState('login');
        }
      });
      
      leaderboardUnsubscribe = listenToLeaderboard((scores) => {
        setLeaderboard(scores);
      });
    };

    initializeApp();

    return () => {
      authUnsubscribe();
      leaderboardUnsubscribe();
    };
  }, []);

  const handleStartGame = useCallback(() => {
    setScore(0);
    setGameState('playing');
  }, []);

  const handleGameOver = useCallback((finalScoreValue: number) => {
    setFinalScore(finalScoreValue);
    setGameState('gameOver');
    if (user) {
      saveScoreToLeaderboard(user.uid, finalScoreValue);
    }
  }, [user]);
  
  const handleRestart = useCallback(() => {
    handleStartGame();
  }, [handleStartGame]);

  const handleSaveSettings = useCallback(async (newSettings: PlayerSettings) => {
    setSettings(newSettings);
    if(user) {
      await saveSettingsToFirebase(user.uid, newSettings);
    }
    setCustomizeVisible(false);
    setSettingsVisible(false);
  }, [user]);

  const renderContent = () => {
    switch (gameState) {
      case 'login':
        return <LoginScreen />;
      case 'start':
        return (
          <StartScreen
            onStart={handleStartGame}
            onShowLeaderboard={() => setLeaderboardVisible(true)}
            onShowCustomize={() => setCustomizeVisible(true)}
            onShowSettings={() => setSettingsVisible(true)}
          />
        );
      case 'gameOver':
        return (
          <GameOverScreen
            score={finalScore}
            onRestart={handleRestart}
            onShowLeaderboard={() => setLeaderboardVisible(true)}
            onShowCustomize={() => setCustomizeVisible(true)}
            onShowSettings={() => setSettingsVisible(true)}
          />
        );
      case 'playing':
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-900">
      <GameCanvas 
        gameState={gameState} 
        settings={settings} 
        onGameOver={handleGameOver}
        setScore={setScore}
      />
      {gameState === 'playing' && <ScoreDisplay score={score} />}
      {user && <PlayerIdDisplay userId={user.uid} />}
      
      {renderContent()}

      {isLeaderboardVisible && (
        <LeaderboardModal 
          scores={leaderboard} 
          currentUserId={user?.uid} 
          onClose={() => setLeaderboardVisible(false)} 
        />
      )}
      {isCustomizeVisible && (
        <CustomizeModal 
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setCustomizeVisible(false)}
        />
      )}
      {isSettingsVisible && (
        <SettingsModal 
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setSettingsVisible(false)}
        />
      )}
    </div>
  );
};

export default App;
