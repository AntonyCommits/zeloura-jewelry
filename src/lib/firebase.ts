// Firebase initialization for client-side usage only
// Fill the environment variables in .env.local

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Check if we're in a browser environment and have required env vars
const isClient = typeof window !== 'undefined';
const hasRequiredEnvVars = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string | undefined,
};

// Initialize Firebase only on client side with valid config
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

if (isClient && hasRequiredEnvVars) {
  try {
    // Avoid re-initializing in Fast Refresh / multiple imports
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
} else if (!isClient) {
  // Server-side: provide mock objects to prevent build errors
  console.warn('Firebase not initialized on server side');
}

// Export Firebase services (will be null if not initialized)
export { auth, db, storage };
export default app;
