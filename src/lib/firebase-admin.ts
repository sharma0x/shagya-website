import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

function initializeFirebaseAdmin() {
  const apps = getApps()
  if (apps.length > 0) {
    return apps[0]
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    '\n',
  )
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error(
      'Missing Firebase Admin credentials. Please set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_PRIVATE_KEY, and FIREBASE_ADMIN_CLIENT_EMAIL environment variables.',
    )
  }

  return initializeApp({
    credential: cert({
      projectId,
      privateKey,
      clientEmail,
    }),
  })
}

initializeFirebaseAdmin()

export const firebaseAdminAuth = getAuth()
