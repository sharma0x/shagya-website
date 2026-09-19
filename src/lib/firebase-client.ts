import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'

let firebaseApp: FirebaseApp | undefined
let firebaseAuthInstance: Auth | undefined

export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp
  }

  const existingApps = getApps()
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0]!
    return firebaseApp
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  if (!apiKey || !authDomain || !projectId) {
    throw new Error(
      'Missing Firebase configuration. Please set NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, and NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variables.',
    )
  }

  firebaseApp = initializeApp({
    apiKey,
    authDomain,
    projectId,
  })

  return firebaseApp
}

export function getFirebaseAuth(): Auth {
  if (firebaseAuthInstance) {
    return firebaseAuthInstance
  }

  const app = getFirebaseApp()
  firebaseAuthInstance = getAuth(app)
  return firebaseAuthInstance
}
