import { APIError, createAuthEndpoint } from 'better-auth/api'
import { createOrUpdateUser } from 'better-auth-firebase-auth/server'
import type { BetterAuthPlugin } from 'better-auth'
import type { Auth } from 'firebase-admin/auth'
import {
  getPhoneIdentityByPhoneNumber,
  getPhoneIdentityByUserId,
  createPhoneIdentity,
  linkFirebaseAccountToUser,
  PHONE_LINKED_TO_ANOTHER_ACCOUNT,
  type FirebaseAccountLinker,
} from './phone-identity'
import { getDbPool } from './db-pool'
import { isValidE164PhoneNumber, normalizePhoneNumber } from './phone-number'

interface PhoneIdentityAuthPluginOptions {
  firebaseAdminAuth: Auth
}

function getIdToken(body: unknown): string {
  if (typeof body !== 'object' || body === null || !('idToken' in body)) {
    throw new APIError('BAD_REQUEST', { message: 'idToken is required' })
  }

  const idToken = body.idToken
  if (typeof idToken !== 'string' || !idToken.trim()) {
    throw new APIError('BAD_REQUEST', { message: 'idToken is required' })
  }

  return idToken
}

function getVerifiedPhoneNumber(token: { phone_number?: unknown }): string {
  if (typeof token.phone_number !== 'string') {
    throw new APIError('BAD_REQUEST', {
      message:
        'Firebase token does not contain a verified phone number. Verify the number with Firebase first.',
    })
  }

  const phoneNumber = normalizePhoneNumber(token.phone_number)
  if (!isValidE164PhoneNumber(phoneNumber)) {
    throw new APIError('BAD_REQUEST', {
      message: 'Enter a valid phone number.',
    })
  }

  return phoneNumber
}

function linkedAccountError(error: unknown): APIError {
  if (
    error instanceof Error &&
    error.message === PHONE_LINKED_TO_ANOTHER_ACCOUNT
  ) {
    return new APIError('CONFLICT', { message: error.message })
  }

  return new APIError('INTERNAL_SERVER_ERROR', {
    message: 'We could not verify this phone number. Please try again.',
  })
}

export function phoneIdentityAuthPlugin({
  firebaseAdminAuth,
}: PhoneIdentityAuthPluginOptions): BetterAuthPlugin {
  return {
    id: 'phone-identity-auth',
    endpoints: {
      signInWithPhoneIdentity: createAuthEndpoint(
        '/phone-auth/sign-in',
        { method: 'POST', requireHeaders: true },
        async (ctx) => {
          const idToken = getIdToken(ctx.body)
          let decodedToken

          try {
            decodedToken = await firebaseAdminAuth.verifyIdToken(idToken)
          } catch {
            throw new APIError('UNAUTHORIZED', {
              message:
                'Firebase token verification failed. Please request a new code.',
            })
          }

          const phoneNumber = getVerifiedPhoneNumber(decodedToken)
          const phoneIdentity = await getPhoneIdentityByPhoneNumber(phoneNumber)

          if (phoneIdentity) {
            try {
              await linkFirebaseAccountToUser(
                ctx.context.internalAdapter as FirebaseAccountLinker,
                {
                  userId: phoneIdentity.userId,
                  firebaseUid: decodedToken.uid,
                  idToken,
                  accessTokenExpiresAt: decodedToken.exp
                    ? new Date(decodedToken.exp * 1000)
                    : undefined,
                },
              )
            } catch (error) {
              throw linkedAccountError(error)
            }
          }

          const resolvedToken = decodedToken.email
            ? decodedToken
            : { ...decodedToken, email: `${decodedToken.uid}@phone.shayga.in` }

          const userResult = await createOrUpdateUser(
            ctx,
            resolvedToken,
            idToken,
            7,
            decodedToken.email ? undefined : { firebaseAdminAuth },
          )

          if (userResult?.user?.id) {
            try {
              const pool = getDbPool()
              const currentIdentity = await getPhoneIdentityByUserId(
                userResult.user.id,
              )
              if (!currentIdentity) {
                await pool.query(
                  `DELETE FROM phone_identities WHERE (phone_number = $1 OR firebase_uid = $2) AND user_id != $3`,
                  [phoneNumber, decodedToken.uid, userResult.user.id],
                )
                await createPhoneIdentity({
                  userId: userResult.user.id,
                  phoneNumber,
                  firebaseUid: decodedToken.uid,
                })
              }
              await pool.query(
                `UPDATE "user" SET "phoneNumber" = $1 WHERE id = $2 AND ("phoneNumber" IS NULL OR "phoneNumber" = '')`,
                [phoneNumber, userResult.user.id],
              )
            } catch (identityErr) {
              console.error(
                '[Phone Auth] Failed to ensure phone identity on sign-in:',
                identityErr,
              )
            }
          }

          return ctx.json(userResult)
        },
      ),
    },
  }
}
