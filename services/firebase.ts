
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

function getFirebaseServices(): Promise<FirebaseServices> {
  if (firebasePromise) {
    return firebasePromise;
  }

  firebasePromise = new Promise((resolve) => {
    const maxWaitTime = 5000; // 5 seconds
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

// --- Public API ---

export const connectAndAuth = async (): Promise<boolean> => {
  try {
    const { auth, isAvailable } = await getFirebaseServices();
    if (!isAvailable || !auth) {
      return false;
    }
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    return true;
  } catch (error) {
    console.error("Anonymous sign-in failed", error);
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
      console.warn("Cannot load settings: Firebase not available or missing parameters", { isAvailable, hasDb: !!db, appId, userId });
      return null;
    }
    
    const docRef = doc(db, 'artifacts', appId, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data() as PlayerSettings;
        console.log("Settings loaded successfully", { userId, highScore: data.highScore, path: `artifacts/${appId}/users/${userId}` });
        return data;
    }
    
    // Fallback for old data structure for seamless migration
    const oldDocRef = doc(db, 'users', userId);
    const oldDocSnap = await getDoc(oldDocRef);
    if (oldDocSnap.exists()) {
      const data = oldDocSnap.data() as PlayerSettings;
      console.log("Settings loaded from old path", { userId, highScore: data.highScore });
      return data;
    }
    
    console.log("No settings found for user", { userId });
    return null;

  } catch (error) {
    console.error("Error loading settings:", error);
    return null;
  }
};

export const saveSettings = async (userId: string, settings: Partial<PlayerSettings>) => {
  try {
    const { db, appId, isAvailable } = await getFirebaseServices();
    if (!isAvailable || !db || !appId || !userId) {
      console.warn("Cannot save settings: Firebase not available or missing parameters", { isAvailable, hasDb: !!db, appId, userId });
      return;
    }
    const docRef = doc(db, 'artifacts', appId, 'users', userId);
    await setDoc(docRef, settings, { merge: true });
    console.log("Settings saved successfully", { userId, settings, path: `artifacts/${appId}/users/${userId}` });
  } catch (error) {
    console.error("Error saving settings:", error);
    throw error; // Re-throw so callers know it failed
  }
};

export const getTopLeaderboard = async (limitCount: number = 10, difficulty: Difficulty = 'normal'): Promise<LeaderboardEntry[]> => {
  try {
    const { db, appId, isAvailable } = await getFirebaseServices();
    if (!isAvailable || !db || !appId) {
      console.warn("Cannot fetch leaderboard: Firebase not available", { isAvailable, hasDb: !!db, appId });
      return [];
    }
    
    const usersRef = collection(db, 'artifacts', appId, 'users');
    
    // Determine Field to sort by. 
    // IF difficulty is 'normal', use 'highScore' (legacy field) to ensure all existing users are included.
    let scoreField = `highScores.${difficulty}`;
    if (difficulty === 'normal') {
        scoreField = 'highScore';
    }

    // Try to use indexed query first
    try {
      const q = query(
        usersRef,
        orderBy(scoreField, 'desc'),
        limit(limitCount * 2) 
      );
      
      const querySnapshot = await getDocs(q);
      
      const userMap = new Map<string, LeaderboardEntry>();
      
      querySnapshot.forEach((docSnap) => {
        const userId = docSnap.id;
        const data = docSnap.data();
        
        let scoreVal = 0;
        
        if (difficulty === 'normal') {
            // For normal, explicitly take the max of legacy 'highScore' and specific 'highScores.normal'
            // This handles cases where data might be partially migrated
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
      
      const entries = Array.from(userMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limitCount);
      
      return entries;
    } catch (queryError: any) {
      console.warn(`Indexed query for ${scoreField} failed, falling back to in-memory sort.`);
      
      const allUsersQuery = query(usersRef, limit(1000));
      const allSnapshot = await getDocs(allUsersQuery);
      
      const userMap = new Map<string, LeaderboardEntry>();
      
      allSnapshot.forEach((docSnap) => {
        const userId = docSnap.id;
        const data = docSnap.data();
        
        let scoreVal = 0;

        if (difficulty === 'normal') {
            scoreVal = data.highScore || 0;
            const specific = data.highScores?.normal || 0;
            scoreVal = Math.max(scoreVal, specific);
        } else {
            scoreVal = data?.highScores?.[difficulty] || 0;
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
      
      const entries = Array.from(userMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limitCount);
      
      return entries;
    }
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};
