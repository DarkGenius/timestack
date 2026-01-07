import { initializeApp, FirebaseError } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Firebase Configuration loaded dynamically from Main process via Preload
const firebaseConfig = window.api.config.firebase;

if (!firebaseConfig.apiKey) {
  console.warn('Firebase API Key is missing. Cloud features will not work.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    if (error instanceof FirebaseError) {
      // Handle specific Firebase auth errors
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      }
    }
    // Re-throw other errors
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export { onAuthStateChanged };
export type { User };
