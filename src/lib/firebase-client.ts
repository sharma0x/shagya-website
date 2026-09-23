import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth, initializeRecaptchaConfig } from 'firebase/auth'

let firebaseApp: FirebaseApp | undefined
let firebaseAuthInstance: Auth | undefined
let recaptchaInitialized = false

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

  // Initialize reCAPTCHA Enterprise configuration
  // This ensures Firebase fetches the reCAPTCHA Enterprise config early
  if (!recaptchaInitialized && typeof window !== 'undefined') {
    recaptchaInitialized = true
    console.log('[Firebase] Initializing reCAPTCHA Enterprise config')
    console.log('[Firebase] Current hostname:', window.location.hostname)
    console.log(
      '[Firebase] API Key:',
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
    )
    console.log(
      '[Firebase] Project ID:',
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    )

    initializeRecaptchaConfig(firebaseAuthInstance)
      .then(() => {
        console.log(
          '[Firebase] ✅ reCAPTCHA Enterprise config initialized successfully',
        )
      })
      .catch((error) => {
        console.error(
          '[Firebase] ❌ Failed to initialize reCAPTCHA config:',
          error,
        )
        console.error('[Firebase] Error details:', {
          code: error.code,
          message: error.message,
          name: error.name,
        })
      })
  }

  return firebaseAuthInstance
}
