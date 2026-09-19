import 'better-auth/react'

declare module 'better-auth/react' {
  interface User {
    phoneNumber?: string
    firebaseUid?: string
  }
}
