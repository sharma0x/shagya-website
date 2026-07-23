# CLO-64: Fix footer — payment icons and polish

## Overview

The footer uses emoji placeholders for payment methods (`['💳', '📱', '🏦', '⚡']`). This looks unprofessional and damages trust at a critical conversion touchpoint. Replace with proper SVG payment method icons.

## Acceptance Criteria

- [ ] Replace emoji payment icons with proper SVG/logos
- [ ] Show actual payment methods: Visa, Mastercard, UPI, Net Banking, Razorpay
- [ ] Add trust badges: SSL Secure, ISO certified (if applicable)
- [ ] Add "Made in India" badge or weaving cluster map
- [ ] Add social media icons (Instagram, Facebook, YouTube, Pinterest)
- [ ] Responsive: icons scale down on mobile

## Technical Notes

- Update: `src/components/layout/Footer.tsx` — replace payment emoji span
- Use simple inline SVGs or icon components
- Add `src/components/ui/PaymentIcons.tsx` for reuse
