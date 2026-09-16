/**
 * Mutable suppression flags shared between the cart store and the analytics
 * subscription layer. Lives in its own module so neither `cart.ts` (store)
 * nor `subscriptions.ts` (analytics) imports the other — avoiding a circular
 * module dependency.
 */

let cartAnalyticsSuppressed = false

/**
 * Programmatic cart transitions (clearCart, loadFromServer, setItems) should
 * NOT emit add/remove events. User actions (addItem/removeItem/updateQuantity)
 * always emit.
 */
export function suppressCartAnalytics(): void {
  cartAnalyticsSuppressed = true
}

export function resumeCartAnalytics(): void {
  cartAnalyticsSuppressed = false
}

export function isCartAnalyticsSuppressed(): boolean {
  return cartAnalyticsSuppressed
}
