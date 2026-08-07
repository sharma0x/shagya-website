# CLO-70: Add customer photos to testimonials

## Overview

Testimonials were text-only with initial-letter avatars. Added optional avatar image support. When customer photo exists, show photo. Otherwise show initial-letter fallback.

## Changes

- TestimonialCard: added `avatarUrl` prop, renders `<img>` if available
- Homepage: passes `review.customer?.image` as avatarUrl
- Hardcoded testimonials keep initial-letter fallback
