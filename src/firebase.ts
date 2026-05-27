import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, onSnapshot, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Auth helpers
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const loginAnonymously = () => signInAnonymously(auth);
export const logout = () => signOut(auth);

// Test connection
async function testConnection() {
  // Expose status to window
  (window as any).isFirestoreOffline = false;
  
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('timeout_offline')), 3500)
  );

  try {
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeoutPromise
    ]);
    console.log("Firebase connection successful.");
    (window as any).isFirestoreOffline = false;
    window.dispatchEvent(new CustomEvent('firestore-status', { detail: { offline: false } }));
  } catch (error) {
    console.warn("Firestore operating in offline/cached mode. Local database fallback active.");
    (window as any).isFirestoreOffline = true;
    window.dispatchEvent(new CustomEvent('firestore-status', { detail: { offline: true } }));
  }
}
testConnection();
