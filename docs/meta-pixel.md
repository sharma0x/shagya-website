# Meta Pixel

Shayga loads the Meta Pixel on public frontend routes and sends storefront funnel events through the shared analytics layer.

## Configuration

The public Meta Pixel ID is configured as `NEXT_PUBLIC_FB_PIXEL_ID`.

The GitHub Actions variable is:

```bash
gh variable set NEXT_PUBLIC_FB_PIXEL_ID --body '<pixel-id>' --repo sharma0x/shagya-website
```

The value is inlined into the client bundle at build time. Docker builds receive it through the workflow's `--build-arg NEXT_PUBLIC_FB_PIXEL_ID` flag.

Do not add a Meta access token or Conversions API credential to the client, repository environment examples, or browser code.

## Events

The integration sends Meta Pixel events for:

- `PageView`
- `ViewContent`
- `AddToCart`
- `ViewCart`
- `InitiateCheckout`
- `AddPaymentInfo`
- `Purchase`
- `Search`
- `AddToWishlist`
- `CompleteRegistration`
- `Lead`
- `Share`

The pixel loads immediately. Consent gating is not included in this integration.

## Verification

1. Open the deployed storefront in a browser.
2. Confirm the request to `connect.facebook.net/en_US/fbevents.js` is present once.
3. Confirm one `PageView` is sent for the initial route and for each client-side route change.
4. Exercise product, cart, checkout, purchase, search, wishlist, signup, and lead flows.
5. Use Meta Events Manager's diagnostics to confirm events arrive in the Website Data dataset.
6. Check that hydration, cart synchronization, and client navigation do not create duplicate events.

## Local configuration

Copy `.env.staging.example` to the local environment file used by the development server and set:

```bash
NEXT_PUBLIC_FB_PIXEL_ID=936721776173959
```

The integration no-ops when the variable is absent.
