# Phase 1: Foundation Fields

**Milestone:** Core fields + registration — The Products collection exists with name, slug, description, status, and is registered in payload.config.ts.

---

## Overview

Create the Products collection file with essential fields: name (the display title), slug (auto-generated URL-safe identifier), description (Lexical rich text), and status (draft/published/archived workflow). Register the collection in payload.config.ts so it appears in the admin panel.

### What we'll build

```
src/collections/Products.ts (new)
├── slug: 'products'
├── admin: useAsTitle='name', group='Products'
├── timestamps: true
├── hooks: beforeChange [slug generation]
├── fields:
│   ├── name (text, required)
│   ├── slug (text, unique, indexed, admin.readOnly)
│   ├── description (richText)
│   └── status (select: draft/published/archived, default=draft)

src/payload.config.ts (modified)
└── collections: [Users, Products]
```

### Key decisions

| Decision          | Choice            | Rationale                                      |
| ----------------- | ----------------- | ---------------------------------------------- |
| Slug generation   | beforeChange hook | Auto-generate from name, update on name change |
| Slug field access | admin.readOnly    | Prevent manual editing in admin UI             |
| Status default    | 'draft'           | Safe default; explicit publish action required |
| Admin group       | 'Products'        | Separate from 'Admin' group for Users          |

---

## Checklist

> Track your progress in [`_checklist.md`](./_checklist.md#phase-1-foundation-fields).

---

## Key Files

| File                          | Purpose                       |
| ----------------------------- | ----------------------------- |
| `src/collections/Products.ts` | Product collection definition |
| `src/payload.config.ts`       | Register Products collection  |

---

## Reference

- [Payload Collections](https://payloadcms.com/docs/configuration/collections)
- [Payload Hooks — beforeChange](https://payloadcms.com/docs/hooks/collections#beforechange)
- [Payload Rich Text](https://payloadcms.com/docs/fields/rich-text)

---

## Definition of Done

- [ ] Products.ts file created with name, slug, description, status fields
- [ ] Slug auto-generated via beforeChange hook (lowercase, dashes, trimmed)
- [ ] Products registered in payload.config.ts collections
- [ ] `make typecheck` passes
- [ ] `make lint` passes
- [ ] Unit tests for slug generation and status default

---

**Navigation:** ↑ [Overview](./README.md) — **Next →** [Phase 2: Saree-Specific Selects](./02-phase-saree-selects.md)
