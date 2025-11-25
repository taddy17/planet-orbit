
import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  connectAndAuth,
  onAuthChange, 
  loadSettings, 
  saveSettings as saveSettingsToFirebase,
  getTopLeaderboard,
  loadLocalSettings,
  saveLocalSettings
} from './services/firebase';
import { generatePlayerName } from './services/gemini';
import { initAudio, startBackgroundMusic, pauseAudio, resumeAudio } from './services/sound';
import type { GameState, PlayerSettings, LeaderboardEntry, StoreItem, Difficulty, PowerUpType } from './types';
import { DEFAULT_PLAYER_SETTINGS } from './constants';
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
import { PauseMenu } from './components/PauseMenu';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [creditsEarned, setCreditsEarned] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHolidayMode, setIsHolidayMode] = useState(false);
  const [startPowerUp, setStartPowerUp] = useState<PowerUpType | undefined>(undefined);

  const [settings, setSettings] = useState<PlayerSettings>(DEFAULT_PLAYER_SETTINGS);

  const [isCustomizationVisible, setCustomizationVisible] = useState(false);
  const [isStoreVisible, setStoreVisible] = useState(false);
  const [isHighScoreVisible, setHighScoreVisible] = useState(false);
  const [isLeaderboardVisible, setLeaderboardVisible] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  
  const [isPressing, setIsPressing] = useState(false);

  // Helper to merge loaded settings with defaults and apply migrations
  const processSettings = (loaded: Partial<PlayerSettings> | null): PlayerSettings => {
      const merged = { ...DEFAULT_PLAYER_SETTINGS, ...loaded };

      // Migration: Ensure highScores object exists
      if (!merged.highScores) {
          merged.highScores = {
              easy: 0,
              normal: merged.highScore || 0, // Map legacy high score to normal
              hard: 0
          };
      }
      
      // Consistency check: Ensure normal score includes legacy high score
      if ((merged.highScore || 0) > (merged.highScores.normal || 0)) {
          merged.highScores.normal = merged.highScore || 0;
      }
      
      // Data integrity checks
      if (!merged.unlockedItems) merged.unlockedItems = [];
      if (!merged.inventory) merged.inventory = {};
      
      return merged as PlayerSettings;
  };

  // Helper to save settings everywhere (Local + Cloud if available)
  const saveAllSettings = useCallback(async (newSettings: PlayerSettings, firebaseUpdates?: Partial<PlayerSettings>) => {
      setSettings(newSettings);
      saveLocalSettings(newSettings); // Always persist locally
      
      if (user) {
          try {
              // If specific updates provided use those (more efficient), else use full object
              await saveSettingsToFirebase(user.uid, firebaseUpdates || newSettings);
          } catch (error) {
              console.warn("Cloud save failed, but local save successful.", error);
          }
      }
  }, [user]);

  // Handle Visibility Change & Blur to Auto-Pause
  useEffect(() => {
    const handlePause = () => {
        if (gameState === 'playing' && !isTutorialActive) {
            setIsPaused(true);
            setIsPressing(false); // Fix sticky input
            pauseAudio(); // Stop sound from playing in background
        }
    };

    window.addEventListener('blur', handlePause);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) handlePause();
    });

    return () => {
        window.removeEventListener('blur', handlePause);
        document.removeEventListener('visibilitychange', handlePause);
    };
  }, [gameState, isTutorialActive]);

  useEffect(() => {
    let authUnsubscribe: () => void = () => {};

    const initializeApp = async () => {
      const isConnected = await connectAndAuth();
      
      if (!isConnected) {
        console.warn("Firebase connection failed. Running in offline mode.");
        // OFFLINE MODE: Load from local storage
        const localSettings = loadLocalSettings();
        const finalSettings = processSettings(localSettings);
        setSettings(finalSettings);
        setGameState('start'); 
        return;
      }
      
      authUnsubscribe = onAuthChange(async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          console.log("User authenticated", { uid: firebaseUser.uid, isAnonymous: firebaseUser.isAnonymous });
          
          // 1. Try Loading Cloud Settings
          let userSettings = await loadSettings(firebaseUser.uid);
          
          // 2. If no Cloud settings, try Local Settings (first time online after playing offline?)
          if (!userSettings) {
             const local = loadLocalSettings();
             if (local) {
                 console.log("No cloud settings found, migrating local settings to cloud.");
                 userSettings = local;
                 // Sync immediately
                 saveSettingsToFirebase(firebaseUser.uid, local);
             }
          }

          // 3. Process & Merge
          const finalSettings = processSettings(userSettings);

          // 4. Check Name Gen
          if (finalSettings.displayName && finalSettings.displayName.length > 25) {
               finalSettings.displayName = '';
          }
          if (!finalSettings.displayName) {
               const newName = await generatePlayerName();
               finalSettings.displayName = newName;
               saveSettingsToFirebase(firebaseUser.uid, { displayName: newName });
          }
          
          setSettings(finalSettings);
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

  const handleStartGame = useCallback(async () => {
    initAudio(); 
    startBackgroundMusic();
    setScore(0);
    setLevel(1);
    setIsPaused(false);
    setStartPowerUp(undefined);

    // Consume PowerUp Logic
    if (settings.equippedConsumable) {
        const itemId = settings.equippedConsumable;
        const count = settings.inventory[itemId] || 0;
        
        if (count > 0) {
            // Apply effect
            let powerUpType: PowerUpType | undefined;
            if (itemId === 'consumable_shield') powerUpType = 'shield';
            if (itemId === 'consumable_boost') powerUpType = 'speedBoost';
            
            if (powerUpType) {
                setStartPowerUp(powerUpType);
                // Decrement inventory
                const newInventory = { ...settings.inventory, [itemId]: count - 1 };
                // Keep equipped if count > 1, otherwise unequip? UX: Keep it equipped.
                const newSettings = { ...settings, inventory: newInventory };
                
                await saveAllSettings(newSettings, { inventory: newInventory });
            }
        }
    }
    
    if (!settings.hasSeenTutorial) {
        setIsTutorialActive(true);
    } else {
        setIsTutorialActive(false);
    }
    
    setGameState('playing');
  }, [settings, user, saveAllSettings]);

  const handleResumeGame = () => {
      setIsPaused(false);
      resumeAudio();
  };

  const handleTutorialComplete = useCallback(async () => {
      setIsTutorialActive(false);
      const newSettings = { ...settings, hasSeenTutorial: true };
      await saveAllSettings(newSettings, { hasSeenTutorial: true });
  }, [settings, saveAllSettings]);

  const handleGameOver = useCallback(async (finalScoreValue: number) => {
    setFinalScore(finalScoreValue);
    setIsPressing(false); 
    setIsPaused(false);
    setStartPowerUp(undefined); // Reset active powerup for next game check
    
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
    let newLegacyHighScore = settings.highScore;
    if (currentDiff === 'normal') {
        newLegacyHighScore = Math.max(settings.highScore, finalScoreValue);
    }

    const newSettings = { 
        ...settings, 
        highScores: newHighScores,
        highScore: newLegacyHighScore,
        // Ensure credits is treated as a number to prevent string concatenation bugs
        credits: (Number(settings.credits) || 0) + earned
    };
    
    console.log("Saving game stats", { difficulty: currentDiff, newHighScore: newDifficultyHighScore });
    await saveAllSettings(newSettings, {
        highScore: newSettings.highScore, 
        highScores: newHighScores,
        credits: newSettings.credits
    });

    setGameState('gameOver');
  }, [settings, saveAllSettings]);
  
  const handleRestart = useCallback(() => {
    handleStartGame();
  }, [handleStartGame]);

  const handleExit = useCallback(() => {
    setGameState('start');
    setIsPaused(false);
    setStartPowerUp(undefined);
  }, []);

  const handleSaveSettings = useCallback(async (newSettingsData: Partial<PlayerSettings>) => {
    const settingsToSave = { ...settings, ...newSettingsData };
    await saveAllSettings(settingsToSave, newSettingsData);
    setCustomizationVisible(false);
  }, [settings, saveAllSettings]);

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
    // Explicitly default to 'normal' when opening leaderboard to match user request
    fetchLeaderboard('normal');
  }, [fetchLeaderboard]);

  const handlePurchaseItem = useCallback(async (item: StoreItem) => {
      if (settings.credits >= item.price) {
          const newCredits = settings.credits - item.price;
          
          let updates: Partial<PlayerSettings> = { credits: newCredits };

          if (item.category === 'consumable') {
              const currentCount = settings.inventory[item.id] || 0;
              const newInventory = { ...settings.inventory, [item.id]: currentCount + 1 };
              updates.inventory = newInventory;
          } else {
              const newUnlocked = [...settings.unlockedItems, item.id];
              updates.unlockedItems = newUnlocked;
          }
          
          const newSettings = { ...settings, ...updates };
          await saveAllSettings(newSettings, updates);
      }
  }, [settings, saveAllSettings]);

  const handleEquipItem = useCallback(async (item: StoreItem) => {
      let updates: Partial<PlayerSettings> = {};
      
      if (item.category === 'consumable') {
          // Toggle logic for consumables
          if (settings.equippedConsumable === item.id) {
              updates.equippedConsumable = undefined; // Unequip
          } else {
              updates.equippedConsumable = item.id; // Equip
          }
      } else {
          updates = { [item.settingKey]: item.value };
      }

      const newSettings = { ...settings, ...updates };
      await saveAllSettings(newSettings, updates);
  }, [settings, saveAllSettings]);

  const handlePressStart = () => {
    if (!isPaused && gameState === 'playing') {
        setIsPressing(true);
    }
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
        let currentDifficultyScore = settings.highScores?.[settings.difficulty] || 0;
        
        // Ensure visual consistency for Normal mode to match Leaderboard logic (legacy fallback)
        if (settings.difficulty === 'normal') {
            currentDifficultyScore = Math.max(currentDifficultyScore, settings.highScore || 0);
        }

        return (
          <StartScreen
            onStart={handleStartGame}
            onShowCustomize={() => setCustomizationVisible(true)}
            onShowHighScore={() => setHighScoreVisible(true)}
            onShowLeaderboard={handleShowLeaderboard}
            onShowStore={() => setStoreVisible(true)}
            highScore={currentDifficultyScore}
            difficulty={settings.difficulty}
            credits={settings.credits}
            isHolidayMode={isHolidayMode}
            onToggleHolidayMode={() => setIsHolidayMode(prev => !prev)}
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
        if (isPaused) {
            return <PauseMenu onResume={handleResumeGame} onExit={handleExit} />;
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
        isPaused={isPaused}
        isHolidayMode={isHolidayMode}
        startPowerUp={startPowerUp}
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
        {gameState === 'playing' && !isTutorialActive && !isPaused && <ScoreDisplay score={score} />}
        {gameState === 'playing' && !isTutorialActive && !isPaused && <LevelDisplay level={level} />}
        {/* Only show Player ID if we have a real user, otherwise could show Offline/Guest */}
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
          initialDifficulty="normal"
        />
      )}
    </div>
  );
};

export default App;
