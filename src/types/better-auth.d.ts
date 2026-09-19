import 'better-auth'

declare module 'better-auth' {
  interface User {
    phoneNumber?: string
    firebaseUid?: string
  }
}
