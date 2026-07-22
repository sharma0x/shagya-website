# CLO-82: Coupon code system — validate, apply, pre-populated offers

- Added description and influencerCode fields to Coupons collection
- Added activeCoupons relationship to SiteSettings for curated offers
- POST /api/coupons/validate — validates code, checks eligibility, returns discount
- GET /api/coupons/active — returns pre-populated coupons from SiteSettings
- Coupon input + Apply/Remove UI on checkout sidebar
- Pre-populated offer cards with Copy button
- Auto-increment usedCount when order with coupon is placed
