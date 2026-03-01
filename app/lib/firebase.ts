import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: ReturnType<typeof initializeApp> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;
let firestore: ReturnType<typeof getFirestore> | null = null;

export function getFirebaseApp() {
  if (!app) {
    const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.storageBucket;
    if (!hasConfig) {
      throw new Error(
        "Firebase não configurado. Adicione as variáveis VITE_FIREBASE_* no .env"
      );
    }
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseStorage() {
  if (!storage) {
    getFirebaseApp();
    storage = getStorage(app!);
  }
  return storage;
}

export function getFirebaseFirestore() {
  if (!firestore) {
    getFirebaseApp();
    firestore = getFirestore(app!);
  }
  return firestore;
}

export function isFirebaseConfigured(): boolean {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
  );
}
