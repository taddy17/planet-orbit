
import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  connectAndAuth,
  onAuthChange, 
  loadSettings, 
  saveSettings as saveSettingsToFirebase,
  getTopLeaderboard,
} from './services/firebase';
import { generatePlayerName } from './services/gemini';
import { initAudio, startBackgroundMusic } from './services/sound';
import type { GameState, PlayerSettings, LeaderboardEntry, StoreItem, Difficulty } from './types';
import { GameCanvas } from './components/GameCanvas';
import { LoginScreen } from './components/LoginScreen';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { ScoreDisplay } from './components/ScoreDisplay';
import { PlayerIdDisplay } from './components/PlayerIdDisplay';
import { CustomizationModal } from './components/CustomizationModal';
import { StoreModal } from './components/StoreModal';
import { HighScoreModal } from './components/HighScoreModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LevelDisplay } from './components/LevelDisplay';
import { TutorialOverlay } from './components/TutorialOverlay';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [creditsEarned, setCreditsEarned] = useState(0);
  const [level, setLevel] = useState(1);

  const [settings, setSettings] = useState<PlayerSettings>({
    planetColor: '#0ea5e9',
    moonColor: '#e5e7eb',
    trailColor: '#38bdf8',
    moonSkin: 'default',
    background: 'deep_space',
    difficulty: 'normal',
    displayName: 'Guest Pilot',
    highScore: 0,
    highScores: { easy: 0, normal: 0, hard: 0 },
    hasSeenTutorial: false,
    credits: 0,
    unlockedItems: []
  });

  const [isCustomizationVisible, setCustomizationVisible] = useState(false);
  const [isStoreVisible, setStoreVisible] = useState(false);
  const [isHighScoreVisible, setHighScoreVisible] = useState(false);
  const [isLeaderboardVisible, setLeaderboardVisible] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
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
          console.log("User authenticated", { uid: firebaseUser.uid, isAnonymous: firebaseUser.isAnonymous });
          let userSettings = await loadSettings(firebaseUser.uid);
          
          const defaultSettings: PlayerSettings = {
            planetColor: '#0ea5e9',
            moonColor: '#e5e7eb',
            trailColor: '#38bdf8',
            moonSkin: 'default',
            background: 'deep_space',
            difficulty: 'normal',
            displayName: '', 
            highScore: 0,
            highScores: { easy: 0, normal: 0, hard: 0 },
            hasSeenTutorial: false,
            credits: 0,
            unlockedItems: []
          };

          // Initialize or Merge Settings
          if (!userSettings) {
             console.log("No existing settings found, initializing new user");
             userSettings = { ...defaultSettings };
          } else {
            console.log("Loaded user settings, merging with defaults", { highScore: userSettings.highScore });
            // Merge loaded settings onto default settings to ensure all keys exist
            userSettings = { ...defaultSettings, ...userSettings };
            
            // Migration: Ensure highScores object exists
            if (!userSettings.highScores) {
                userSettings.highScores = {
                    easy: 0,
                    normal: userSettings.highScore || 0, // Map legacy high score to normal
                    hard: 0
                };
            }

            if (!userSettings.unlockedItems) userSettings.unlockedItems = [];
            if (!userSettings.background) userSettings.background = 'deep_space';
          }

          if (userSettings.displayName && userSettings.displayName.length > 25) {
              console.log("Detecting malformed name, resetting...");
              userSettings.displayName = '';
          }

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
    initAudio(); 
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
    setIsPressing(false); 
    
    const earned = Math.floor(finalScoreValue / 10);
    setCreditsEarned(earned);

    // Update Difficulty-Specific High Score
    const currentDiff = settings.difficulty;
    const currentHighScores = settings.highScores || { easy: 0, normal: 0, hard: 0 };
    
    // Ensure object structure integrity
    if (typeof currentHighScores.easy !== 'number') currentHighScores.easy = 0;
    if (typeof currentHighScores.normal !== 'number') currentHighScores.normal = 0;
    if (typeof currentHighScores.hard !== 'number') currentHighScores.hard = 0;

    const newDifficultyHighScore = Math.max(currentHighScores[currentDiff], finalScoreValue);
    
    const newHighScores = {
        ...currentHighScores,
        [currentDiff]: newDifficultyHighScore
    };

    // Only update the legacy global 'highScore' if we are playing on Normal mode.
    // This ensures that the legacy field (used for the Normal leaderboard) isn't polluted by Easy mode scores.
    // Existing scores are effectively Normal scores, so this maintains consistency.
    let newLegacyHighScore = settings.highScore;
    if (currentDiff === 'normal') {
        newLegacyHighScore = Math.max(settings.highScore, finalScoreValue);
    }

    const newSettings = { 
        ...settings, 
        highScores: newHighScores,
        highScore: newLegacyHighScore,
        credits: (settings.credits || 0) + earned
    };
    
    setSettings(newSettings);

    if (user) {
        try {
          console.log("Saving game stats", { userId: user.uid, difficulty: currentDiff, newHighScore: newDifficultyHighScore });
          await saveSettingsToFirebase(user.uid, { 
              highScore: newSettings.highScore, 
              highScores: newHighScores,
              credits: newSettings.credits
          });
        } catch (error) {
          console.error("Failed to save stats:", error);
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
    setCustomizationVisible(false);
  }, [user, settings]);

  const fetchLeaderboard = useCallback(async (difficulty: Difficulty) => {
    setIsLoadingLeaderboard(true);
    setLeaderboardData([]); 
    try {
      const topScores = await getTopLeaderboard(10, difficulty);
      setLeaderboardData(topScores);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, []);

  const handleShowLeaderboard = useCallback(() => {
    setLeaderboardVisible(true);
    fetchLeaderboard(settings.difficulty);
  }, [fetchLeaderboard, settings.difficulty]);

  const handlePurchaseItem = useCallback(async (item: StoreItem) => {
      if (settings.credits >= item.price) {
          const newCredits = settings.credits - item.price;
          const newUnlocked = [...settings.unlockedItems, item.id];
          
          const updates = {
              credits: newCredits,
              unlockedItems: newUnlocked
          };

          const newSettings = { ...settings, ...updates };
          setSettings(newSettings);
          
          if (user) {
              await saveSettingsToFirebase(user.uid, updates);
          }
      }
  }, [settings, user]);

  const handleEquipItem = useCallback(async (item: StoreItem) => {
      const updates = { [item.settingKey]: item.value };
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      
      if (user) {
          await saveSettingsToFirebase(user.uid, updates);
      }
  }, [settings, user]);

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
        // Display high score for the CURRENTLY selected difficulty
        const currentDifficultyScore = settings.highScores?.[settings.difficulty] || 0;
        return (
          <StartScreen
            onStart={handleStartGame}
            onShowCustomize={() => setCustomizationVisible(true)}
            onShowHighScore={() => setHighScoreVisible(true)}
            onShowLeaderboard={handleShowLeaderboard}
            onShowStore={() => setStoreVisible(true)}
            highScore={currentDifficultyScore}
            credits={settings.credits}
          />
        );
      case 'gameOver':
        return (
          <GameOverScreen
            score={finalScore}
            highScore={settings.highScores?.[settings.difficulty] || 0}
            creditsEarned={creditsEarned}
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

      {isCustomizationVisible && (
        <CustomizationModal 
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setCustomizationVisible(false)}
        />
      )}
      {isStoreVisible && (
          <StoreModal 
            settings={settings}
            onPurchase={handlePurchaseItem}
            onEquip={handleEquipItem}
            onClose={() => setStoreVisible(false)}
          />
      )}
      {isHighScoreVisible && (
        <HighScoreModal 
          score={settings.highScores?.[settings.difficulty] || 0}
          onClose={() => setHighScoreVisible(false)}
        />
      )}
      {isLeaderboardVisible && (
        <LeaderboardModal 
          globalScores={leaderboardData}
          isLoading={isLoadingLeaderboard}
          currentUserId={user?.uid}
          onClose={() => setLeaderboardVisible(false)}
          onFetchDifficulty={fetchLeaderboard}
          initialDifficulty={settings.difficulty}
        />
      )}
    </div>
  );
};

export default App;
