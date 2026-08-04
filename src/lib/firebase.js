// src/lib/firebase.js
// Configuración de Firebase para Strivo
// Las variables de entorno van en .env.local (no comitear)
//
// Crea tu proyecto en: https://console.firebase.google.com
// Después copia las credenciales en .env.local:
//   VITE_FIREBASE_API_KEY=...
//   VITE_FIREBASE_AUTH_DOMAIN=...
//   VITE_FIREBASE_PROJECT_ID=...
//   VITE_FIREBASE_STORAGE_BUCKET=...
//   VITE_FIREBASE_MESSAGING_SENDER_ID=...
//   VITE_FIREBASE_APP_ID=...

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Inicializar solo si hay configuración (evita errores en dev sin .env.local)
let app, auth, db

if (firebaseConfig.apiKey) {
  app  = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db   = getFirestore(app)
} else {
  console.warn('[Strivo] Firebase no configurado. Agrega las variables en .env.local')
}

export { auth, db }
export const googleProvider = new GoogleAuthProvider()
export const appleProvider  = new OAuthProvider('apple.com')
