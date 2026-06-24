# CLO-11: Create Products collection (saree schema)

## Overview

Products collection with saree-specific fields: name, slug, description, fabric, weave, length, pattern, occasion, blouse type, pallu details, border type, weave pattern. Rich text description. Status: draft/published/archived.

## Acceptance Criteria

- [ ] Products collection with slug-based routing (auto-generated from name)
- [ ] Fabric select field with all saree fabric types
- [ ] Weave select field with Indian weave types
- [ ] Pattern select field (solid/printed/embroidered/embellished/painted)
- [ ] Length field (numeric, in meters)
- [ ] Blouse type text field
- [ ] Pallu details text field
- [ ] Border type text field
- [ ] Weave pattern text field
- [ ] Occasion reference field (to Occasion collection — create as text for now)
- [ ] Status field: draft/published/archived with proper admin display
- [ ] Rich text description via Lexical editor
- [ ] Timestamps (createdAt, updatedAt)
- [ ] Admin UI: useAsTitle = name, grouped under "Products"
- [ ] Unit tests covering field validation and slug generation

## Technical Notes

- New file: `src/collections/Products.ts`
- Register in `src/payload.config.ts` collections array
- Slug auto-generated via Payload hooks (beforeChange)
- Fabric/weave/pattern use Payload select fields
- Status uses select with defaultValue: 'draft'
- Rich text uses Payload's Lexical rich text field
- Occasion relation will be a text field initially (CLO-23 creates the Occasion collection)
