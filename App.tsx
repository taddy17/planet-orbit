
import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  connectAndAuth,
  onAuthChange, 
  loadSettings, 
  saveSettings as saveSettingsToFirebase, 
} from './services/firebase';
import { generatePlayerName } from './services/gemini';
import { initAudio, startBackgroundMusic } from './services/sound';
import type { GameState, PlayerSettings, Difficulty } from './types';
import { GameCanvas } from './components/GameCanvas';
import { LoginScreen } from './components/LoginScreen';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { ScoreDisplay } from './components/ScoreDisplay';
import { PlayerIdDisplay } from './components/PlayerIdDisplay';
import { CustomizeModal } from './components/CustomizeModal';
import { SettingsModal } from './components/SettingsModal';
import { HighScoreModal } from './components/HighScoreModal';
import { LevelDisplay } from './components/LevelDisplay';
import { TutorialOverlay } from './components/TutorialOverlay';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [level, setLevel] = useState(1);

  const [settings, setSettings] = useState<PlayerSettings>({
    planetColor: '#0ea5e9',
    moonColor: '#e5e7eb',
    trailColor: '#38bdf8',
    moonSkin: 'default',
    difficulty: 'normal',
    displayName: 'Guest Pilot',
    highScore: 0,
    hasSeenTutorial: false
  });

  const [isCustomizeVisible, setCustomizeVisible] = useState(false);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isHighScoreVisible, setHighScoreVisible] = useState(false);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  
  const [isPressing, setIsPressing] = useState(false);

  useEffect(() => {
    let authUnsubscribe: () => void = () => {};

    const initializeApp = async () => {
      const isConnected = await connectAndAuth();
      
      if (!isConnected) {
        console.warn("Firebase connection failed. Running in offline mode.");
        setGameState('start'); 
        return;
      }
      
      authUnsubscribe = onAuthChange(async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          let userSettings = await loadSettings(firebaseUser.uid);
          
          // Initialize or Migrate Settings
          if (!userSettings) {
             userSettings = {
              planetColor: '#0ea5e9',
              moonColor: '#e5e7eb',
              trailColor: '#38bdf8',
              moonSkin: 'default',
              difficulty: 'normal',
              displayName: '', // Trigger generation
              highScore: 0,
              hasSeenTutorial: false
            };
          }

          // Ensure properties exist for migrated users
          if (userSettings.highScore === undefined) {
            userSettings.highScore = 0;
          }
          if (userSettings.hasSeenTutorial === undefined) {
            userSettings.hasSeenTutorial = false;
          }
          if (!userSettings.trailColor) {
            userSettings.trailColor = '#38bdf8';
          }
          if (!userSettings.moonSkin) {
            userSettings.moonSkin = 'default';
          }

          // Generate Name if missing
          if (!userSettings.displayName) {
              const newName = await generatePlayerName();
              userSettings.displayName = newName;
              await saveSettingsToFirebase(firebaseUser.uid, { displayName: newName });
          }
          
          setSettings(userSettings);
          setGameState('start');

        } else {
          setGameState('login');
        }
      });
    };

    initializeApp();

    return () => {
      authUnsubscribe();
    };
  }, []);

  const handleStartGame = useCallback(() => {
    initAudio(); // Ensure audio context is ready on user interaction
    startBackgroundMusic();
    setScore(0);
    setLevel(1);
    
    if (!settings.hasSeenTutorial) {
        setIsTutorialActive(true);
    } else {
        setIsTutorialActive(false);
    }
    
    setGameState('playing');
  }, [settings.hasSeenTutorial]);

  const handleTutorialComplete = useCallback(async () => {
      setIsTutorialActive(false);
      const newSettings = { ...settings, hasSeenTutorial: true };
      setSettings(newSettings);
      if (user) {
          await saveSettingsToFirebase(user.uid, { hasSeenTutorial: true });
      }
  }, [settings, user]);

  const handleGameOver = useCallback(async (finalScoreValue: number) => {
    setFinalScore(finalScoreValue);
    setIsPressing(false); // Reset input state on game over
    
    // Check for high score
    if (finalScoreValue > settings.highScore) {
        const newSettings = { ...settings, highScore: finalScoreValue };
        setSettings(newSettings);
        if (user) {
            await saveSettingsToFirebase(user.uid, { highScore: finalScoreValue });
        }
    }

    setGameState('gameOver');
  }, [settings, user]);
  
  const handleRestart = useCallback(() => {
    handleStartGame();
  }, [handleStartGame]);

  const handleExit = useCallback(() => {
    setGameState('start');
  }, []);

  const handleSaveSettings = useCallback(async (newSettings: Partial<PlayerSettings>) => {
    const settingsToSave = { ...settings, ...newSettings };
    setSettings(settingsToSave);
    if(user) {
      await saveSettingsToFirebase(user.uid, settingsToSave);
    }
    setCustomizeVisible(false);
    setSettingsVisible(false);
  }, [user, settings]);

  const handlePressStart = () => {
    setIsPressing(true);
  };

  const handlePressEnd = () => {
    setIsPressing(false);
  };

  const renderContent = () => {
    switch (gameState) {
      case 'login':
        return <LoginScreen />;
      case 'start':
        return (
          <StartScreen
            onStart={handleStartGame}
            onShowCustomize={() => setCustomizeVisible(true)}
            onShowSettings={() => setSettingsVisible(true)}
            onShowHighScore={() => setHighScoreVisible(true)}
            highScore={settings.highScore}
          />
        );
      case 'gameOver':
        return (
          <GameOverScreen
            score={finalScore}
            highScore={settings.highScore}
            onRestart={handleRestart}
            onExit={handleExit}
          />
        );
      case 'playing':
        if (isTutorialActive) {
            return <TutorialOverlay isPressing={isPressing} onComplete={handleTutorialComplete} />;
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-slate-900 select-none"
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
    >
      <GameCanvas 
        gameState={gameState} 
        settings={settings} 
        onGameOver={handleGameOver}
        setScore={setScore}
        setLevel={setLevel}
        isPressing={isPressing}
        isTutorialActive={isTutorialActive}
      />
      <div 
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {gameState === 'playing' && !isTutorialActive && <ScoreDisplay score={score} />}
        {gameState === 'playing' && !isTutorialActive && <LevelDisplay level={level} />}
        {user && !isTutorialActive && <PlayerIdDisplay userId={user.uid} displayName={settings.displayName} />}
      </div>
      
      {renderContent()}

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
      {isHighScoreVisible && (
        <HighScoreModal 
          score={settings.highScore}
          onClose={() => setHighScoreVisible(false)}
        />
      )}
    </div>
  );
};

export default App;
