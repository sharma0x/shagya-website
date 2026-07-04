# CLO-8 — Pincode Autofill for City, State, Country

## Summary

When a customer enters a 6-digit Indian pincode in the address form, the form
verifies it against the pincode API and auto-fills the city, state, and country
fields. The user can override any auto-filled value. Invalid or unknown
pincodes show an inline error; valid ones show a verified indicator.

## Acceptance Criteria

### Trigger

- `onBlur` of the pincode input — not on every keystroke.
- Only when the pincode is exactly 6 digits.
- Skipped if the pincode is unchanged from the last verified value (no
  redundant re-verification on refocus).
- Skipped in edit mode for prefilled addresses — the form must not
  auto-verify a pincode that was loaded from existing data on mount.

### Behavior

- Numeric-only input. Non-digit characters are stripped.
- Maximum length: 6 characters.
- Pattern enforced: `^[1-9][0-9]{5}$` (rejects leading-zero pincodes).
- On blur with a valid 6-digit pincode, the form posts
  `{ pincode: trimmed }` to `POST /api/pincode/verify`.
- On a successful response (`{ data: { city, state, country } }`):
  - `city` is populated
  - `state` is populated (matched against the Indian states dropdown when
    India is the country)
  - `country` is set to `India`
  - A verified indicator is shown
- On an error response (`{ error: '...' }`) or non-2xx status:
  - The error message is shown inline below the input
  - Auto-filled fields are not modified
- On a network failure:
  - A generic "Could not verify pincode. Try again." error is shown

### State Management

- Editing the pincode after a successful verify clears the verified state
  and the error message.
- The verified status is per-pincode-value: the form remembers which
  pincode string was last successfully verified.
- Verified fields remain fully editable. Auto-fill is a hint, not a lock.

### Concurrency

- Rapid pincode changes (type 110001 → blur → type 110002 → blur) must
  not let a slow response from the first request overwrite the second.
  Only the most recent request's response is applied to the form state.
- The verification indicator / loader reflects the state of the most
  recent in-flight or completed request.

### Accessibility

- The status message (verified or error) is announced to assistive tech
  via `role="status"` and `aria-live="polite"`.
- The pincode input is linked to the status message via
  `aria-describedby` so screen readers know the input has a status.

### Visual

- Verified indicator uses the OKLCH semantic token `text-success` (not
  stock Tailwind emerald).
- Error text uses the OKLCH semantic token `text-error` (not stock
  Tailwind red-600).
- The pincode input border and subtle background tint to brand-600 /
  brand-50 when verified.

## Out of Scope (Deferred)

- City-level search-ahead (CLO-7 already has
  `POST /api/pincode/city-search`; integrating it into this form is
  follow-up work).
- International pincode validation (only Indian 6-digit pincodes are
  verified in this iteration).
- Caching the verified pincode → location mapping in localStorage (the
  server-side cache at `src/lib/pincode-cache.ts` covers repeated
  requests within a session; persistent client cache is follow-up).

## Dependencies

- CLO-6: `AddressForm` component exists with country/state dropdowns.
- CLO-7: `POST /api/pincode/verify` route is live and returns
  `{ data: { city, state, country } }` or `{ error: '...' }`.

## Files Touched

- `src/components/address/AddressForm.tsx` — added pincode state,
  blur handler, autofill logic, and the fixes described in the
  Implementation Notes.
- `src/components/address/__tests__/AddressForm.pincode.test.tsx` —
  new test file covering the acceptance criteria above.

## Implementation Notes (post-hoc)

The original commit `ee1e735` shipped a working feature but had three
follow-up issues that this rebuild addresses:

1. **Race condition on rapid blur.** The original `handlePincodeBlur`
   closed over `pincode` and used a plain `setState` on resolution. If
   request A's response resolved after request B's, the form would show
   B's digits but A's autofill data. The fix uses a `useRef` token
   incremented on each call; only the response whose token matches the
   current ref value mutates state. This is verified by the "race
   condition regression" test.

2. **Stock Tailwind colors.** The original used `text-emerald-500`,
   `text-emerald-600`, and `text-red-600`. These are replaced with the
   brand's OKLCH semantic tokens `text-success` and `text-error`,
   defined in `src/app/(frontend)/globals.css` under `@theme {}`.

3. **No `aria-live` on status.** The status message is now wrapped in
   `<p role="status" aria-live="polite">` and the pincode input has
   `aria-describedby` pointing at it, so screen readers announce the
   verified/error state.

A small additional a11y improvement: the pincode label is now wired to
the input via `htmlFor` / `id`, matching the pattern used by the
isDefault checkbox in the same form.
