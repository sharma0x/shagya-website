# CLO-21: Create Pages collection + page builder blocks

## Overview

Pages collection for static content pages (home, about, contact, FAQ, etc.) with a block-based page builder. Supports templates for common page types plus flexible block layout: hero, text-image, feature-grid, testimonials, FAQ, CTA.

## Acceptance Criteria

- [ ] Pages collection with slug-based routing
- [ ] Title, slug (auto-generated), and status (draft/published)
- [ ] Template select: default, contact, about, faq
- [ ] Block-based content area with 6 block types:
  - Hero: heading, subheading, background image, CTA button
  - Text Image: heading, body (richText), image, imagePosition (left/right)
  - Feature Grid: heading, features (array of icon, title, description)
  - Testimonials: heading, testimonials (array of name, role, quote, avatar)
  - FAQ: heading, questions (array of question, answer)
  - CTA: heading, body, buttonText, buttonLink
- [ ] SEO meta fields (meta title, meta description)
- [ ] Registered in payload.config.ts
- [ ] Unit tests for collection structure and block definitions

## Technical Notes

- File: `src/collections/Pages.ts`
- Uses Payload `blocks` field type for page builder
- Each block is a separate block config with its own fields
- Template field: select with options
- Slug auto-generated via beforeChange hook
- Admin group: "Content"
