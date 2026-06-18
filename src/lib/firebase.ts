// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if projectId is provided
const isFirebaseConfigured = !!firebaseConfig.projectId;

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// Initialize Firebase services
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

// Initialize Analytics (only in browser environment and if measurementId exists)
export const analytics =
  (app && typeof window !== "undefined" && firebaseConfig.measurementId) ? getAnalytics(app) : null;

export default app;

