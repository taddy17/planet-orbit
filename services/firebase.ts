
import { initializeApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously, 
  Auth,
  User,
  Unsubscribe
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Firestore
} from "firebase/firestore";

import type { PlayerSettings, LeaderboardEntry, Difficulty } from '../types';

declare global {
  interface Window {
    __firebase_config?: string;
    __app_id?: string;
  }
}

interface FirebaseServices {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  appId: string | null;
  isAvailable: boolean;
}

let firebasePromise: Promise<FirebaseServices> | null = null;
const LOCAL_STORAGE_KEY = 'planet_orbit_settings_v1';
const NETWORK_TIMEOUT_MS = 3000; // 3 seconds timeout for network operations

// Helper to race a promise against a timeout
function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error(errorMessage)), ms)
        )
    ]);
}

function getFirebaseServices(): Promise<FirebaseServices> {
  if (firebasePromise) {
    return firebasePromise;
  }

  firebasePromise = new Promise((resolve) => {
    const maxWaitTime = 5000; // 5 seconds total init wait
    const checkInterval = 100; // 100 ms
    let elapsedTime = 0;

    const intervalId = setInterval(() => {
      if (window.__firebase_config && window.__app_id) {
        clearInterval(intervalId);
        try {
          const firebaseConfig = JSON.parse(window.__firebase_config);
          const appId = window.__app_id;

          if (!firebaseConfig.apiKey) {
            throw new Error("Firebase config is missing 'apiKey'.");
          }
          if (!appId) {
            throw new Error("App ID ('__app_id') not found.");
          }

          const app = initializeApp(firebaseConfig);
          const auth = getAuth(app);
          const db = getFirestore(app);
          
          console.log("Firebase services initialized successfully", { 
            projectId: firebaseConfig.projectId, 
            appId,
            authDomain: firebaseConfig.authDomain
          });
          
          resolve({ app, auth, db, appId, isAvailable: true });
        } catch (error) {
          console.error("Firebase initialization failed:", error);
          resolve({ app: null, auth: null, db: null, appId: null, isAvailable: false });
        }
      } else {
        elapsedTime += checkInterval;
        if (elapsedTime >= maxWaitTime) {
          clearInterval(intervalId);
          const errorMessage = "Firebase configuration not found within 5 seconds. Running in offline mode.";
          console.warn(errorMessage);
          resolve({ app: null, auth: null, db: null, appId: null, isAvailable: false });
        }
      }
    }, checkInterval);
  });

  return firebasePromise;
}

// --- Local Storage Helpers ---

export const loadLocalSettings = (): PlayerSettings | null => {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch(e) {
        console.error("Local load failed", e);
        return null;
    }
}

export const saveLocalSettings = (settings: PlayerSettings) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch(e) {
        console.error("Local save failed", e);
    }
}

// --- Public API ---

export const connectAndAuth = async (): Promise<boolean> => {
  try {
    const { auth, isAvailable } = await getFirebaseServices();
    if (!isAvailable || !auth) {
      return false;
    }
    
    // Check if user is already signed in (Firebase restores session)
    if (auth.currentUser) {
        return true;
    }

    // Race login against timeout to prevent freezing in airplane mode
    await withTimeout(
        signInAnonymously(auth),
        NETWORK_TIMEOUT_MS,
        "Auth timed out"
    );
    
    return true;
  } catch (error) {
    console.error("Anonymous sign-in failed or timed out", error);
    return false;
  }
};

export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  let unsubscribe: Unsubscribe = () => {};
  
  (async () => {
    try {
      const { auth, isAvailable } = await getFirebaseServices();
      if (!isAvailable || !auth) {
        callback(null);
        return;
      }
      unsubscribe = onAuthStateChanged(auth, callback);
    } catch (error) {
      console.error("Auth service not available for onAuthChange listener.", error);
      callback(null);
    }
  })();

  return () => {
    unsubscribe();
  };
};

export const loadSettings = async (userId: string): Promise<PlayerSettings | null> => {
  try {
    const { db, appId, isAvailable } = await getFirebaseServices();
    if (!isAvailable || !db || !appId || !userId) {
      console.warn("Cannot load settings: Firebase not available or missing parameters");
      return null;
    }
    
    const docRef = doc(db, 'artifacts', appId, 'users', userId);
    
    // Wrap fetching in timeout
    const docSnap = await withTimeout(
        getDoc(docRef),
        NETWORK_TIMEOUT_MS,
        "Load settings timed out"
    );
    
    if (docSnap.exists()) {
        const data = docSnap.data() as PlayerSettings;
        console.log("Settings loaded successfully", { userId });
        return data;
    }
    
    // Fallback check for old path
    const oldDocRef = doc(db, 'users', userId);
    const oldDocSnap = await withTimeout(
        getDoc(oldDocRef),
        NETWORK_TIMEOUT_MS, 
        "Load legacy settings timed out"
    );

    if (oldDocSnap.exists()) {
      const data = oldDocSnap.data() as PlayerSettings;
      console.log("Settings loaded from old path", { userId });
      return data;
    }
    
    console.log("No settings found for user", { userId });
    return null;

  } catch (error) {
    console.error("Error loading settings (using fallback):", error);
    return null;
  }
};

export const saveSettings = async (userId: string, settings: Partial<PlayerSettings>) => {
  try {
    const { db, appId, isAvailable } = await getFirebaseServices();
    if (!isAvailable || !db || !appId || !userId) {
      return;
    }
    const docRef = doc(db, 'artifacts', appId, 'users', userId);
    
    // Fire and forget or timeout? 
    // We use timeout to ensure we don't block callers forever if they await this
    await withTimeout(
        setDoc(docRef, settings, { merge: true }),
        2000, // Short timeout for saves
        "Save settings timed out"
    );
    
    console.log("Settings saved successfully", { userId });
  } catch (error) {
    console.error("Error saving settings:", error);
    // Don't re-throw, app continues with local storage
  }
};

export const getTopLeaderboard = async (limitCount: number = 10, difficulty: Difficulty = 'normal'): Promise<LeaderboardEntry[]> => {
  try {
    const { db, appId, isAvailable } = await getFirebaseServices();
    if (!isAvailable || !db || !appId) {
      return [];
    }
    
    const usersRef = collection(db, 'artifacts', appId, 'users');
    let scoreField = `highScores.${difficulty}`;
    if (difficulty === 'normal') {
        scoreField = 'highScore';
    }

    // Query with timeout
    try {
      const q = query(usersRef, orderBy(scoreField, 'desc'), limit(limitCount * 2));
      
      const querySnapshot = await withTimeout(
          getDocs(q),
          NETWORK_TIMEOUT_MS,
          "Leaderboard fetch timed out"
      );
      
      const userMap = new Map<string, LeaderboardEntry>();
      
      querySnapshot.forEach((docSnap) => {
        const userId = docSnap.id;
        const data = docSnap.data();
        let scoreVal = 0;
        
        if (difficulty === 'normal') {
            scoreVal = data.highScore || 0;
            const specific = data.highScores?.normal || 0;
            scoreVal = Math.max(scoreVal, specific);
        } else {
            scoreVal = data?.highScores?.[difficulty];
        }

        if (typeof scoreVal === 'number' && scoreVal > 0) {
          const existingEntry = userMap.get(userId);
          if (!existingEntry || scoreVal > existingEntry.score) {
            userMap.set(userId, {
              userId: userId,
              displayName: data.displayName || 'Unknown Pilot',
              score: scoreVal,
              createdAt: null
            });
          }
        }
      });
      
      return Array.from(userMap.values()).sort((a, b) => b.score - a.score).slice(0, limitCount);

    } catch (queryError: any) {
      console.warn(`Indexed query for ${scoreField} failed or timed out, skipping fallback to prevent further freeze.`);
      return [];
    }
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};
