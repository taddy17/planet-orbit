
import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  connectAndAuth,
  onAuthChange, 
  loadSettings, 
  saveSettings as saveSettingsToFirebase, 
} from './services/firebase';
import { generatePlayerName } from './services/gemini';
import { initAudio } from './services/sound';
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
import { OrbitSlider } from './components/OrbitSlider';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [level, setLevel] = useState(1);

  const [settings, setSettings] = useState<PlayerSettings>({
    planetColor: '#0ea5e9',
    moonColor: '#e5e7eb',
    difficulty: 'normal',
    displayName: 'Guest Pilot',
    highScore: 0
  });

  const [isCustomizeVisible, setCustomizeVisible] = useState(false);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isHighScoreVisible, setHighScoreVisible] = useState(false);
  
  const [orbitRadius, setOrbitRadius] = useState(150);
  const [orbitBounds, setOrbitBounds] = useState({ min: 50, max: 200 });

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
              difficulty: 'normal',
              displayName: '', // Trigger generation
              highScore: 0
            };
          }

          // Ensure highScore exists for migrated users
          if (userSettings.highScore === undefined) {
            userSettings.highScore = 0;
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

  const handleBoundsChange = useCallback((bounds: { min: number, max: number }) => {
    setOrbitBounds(bounds);
    setOrbitRadius(prev => Math.max(bounds.min, Math.min(bounds.max, prev)));
  }, []);

  const handleStartGame = useCallback(() => {
    initAudio(); // Ensure audio context is ready on user interaction
    setScore(0);
    setLevel(1);
    setOrbitRadius((orbitBounds.min + orbitBounds.max) / 3);
    setGameState('playing');
  }, [orbitBounds]);

  const handleGameOver = useCallback(async (finalScoreValue: number) => {
    setFinalScore(finalScoreValue);
    
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

  const handleSaveSettings = useCallback(async (newSettings: Partial<PlayerSettings>) => {
    const settingsToSave = { ...settings, ...newSettings };
    setSettings(settingsToSave);
    if(user) {
      await saveSettingsToFirebase(user.uid, settingsToSave);
    }
    setCustomizeVisible(false);
    setSettingsVisible(false);
  }, [user, settings]);

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
          />
        );
      case 'gameOver':
        return (
          <GameOverScreen
            score={finalScore}
            highScore={settings.highScore}
            onRestart={handleRestart}
            onShowCustomize={() => setCustomizeVisible(true)}
            onShowSettings={() => setSettingsVisible(true)}
            onShowHighScore={() => setHighScoreVisible(true)}
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
        setLevel={setLevel}
        orbitRadius={orbitRadius}
        onBoundsChange={handleBoundsChange}
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
        {gameState === 'playing' && <ScoreDisplay score={score} />}
        {gameState === 'playing' && <LevelDisplay level={level} />}
        {user && <PlayerIdDisplay userId={user.uid} displayName={settings.displayName} />}
      </div>
      
      {renderContent()}

      {gameState === 'playing' && (
        <OrbitSlider
          value={orbitRadius}
          min={orbitBounds.min}
          max={orbitBounds.max}
          onChange={setOrbitRadius}
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
