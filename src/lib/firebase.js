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
import {
  getAuth,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  OAuthProvider,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { esNativa } from './plataforma.js'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * Con qué opciones se crea Auth, según dónde corre la app (SPEC_21.1 §4.3).
 *
 * **En web, ninguna**: `getAuth` y su persistencia de fábrica, que ya es
 * IndexedDB. Devuelve `null` para decir eso.
 *
 * **En la app de iPhone, `initializeAuth` con IndexedDB y sin
 * `popupRedirectResolver`.** `getAuth` carga el resolvedor de ventanas
 * emergentes, que monta un iframe de `authDomain`; dentro del WebView puede no
 * llegar a cargar nunca, y con él se quedaría colgado `authStateReady()`, que es
 * lo que espera el arranque. Sin resolvedor, `signInWithPopup` no funciona — y
 * por eso en nativo no se ofrece Google (`proveedoresDisponibles`).
 *
 * @param {boolean} nativa
 * @returns {?{persistence: object}}
 */
export function opcionesDeAuth(nativa) {
  return nativa ? { persistence: indexedDBLocalPersistence } : null
}

// Inicializar solo si hay configuración (evita errores en dev sin .env.local)
let app, auth, db

if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig)
  const opciones = opcionesDeAuth(esNativa())
  auth = opciones ? initializeAuth(app, opciones) : getAuth(app)
  db = getFirestore(app)
} else {
  console.warn('[Strivo] Firebase no configurado. Agrega las variables en .env.local')
}

export { auth, db }
export const googleProvider = new GoogleAuthProvider()
export const appleProvider = new OAuthProvider('apple.com')
