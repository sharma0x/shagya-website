# Phase 3: Detail Fields

**Milestone:** Remaining saree fields — length, blouse type, pallu details, border type, weave pattern, occasion.

---

## Overview

Add the remaining saree-specific detail fields that complete the product schema. These include numeric length (with validation), descriptive text fields for blouse/pallu/border/weave details, and an occasion field.

### What we'll build

```
src/collections/Products.ts (modified)
└── fields (add):
    ├── length: number (min=1, max=9, step=0.1, admin.suffix='meters')
    ├── blouseType: text
    ├── palluDetails: text
    ├── borderType: text
    ├── weavePattern: text
    └── occasion: text (placeholder; will become relationship in CLO-23)
```

### Key decisions

| Decision           | Choice                   | Rationale                                                  |
| ------------------ | ------------------------ | ---------------------------------------------------------- |
| Length type        | number with min/max/step | Sarees are ~5-6.5m standard; range covers all              |
| Length unit suffix | 'meters' in admin        | Clear to content editors                                   |
| Occasion type      | text (not relationship)  | Occasion collection not created yet (CLO-23); will migrate |
| Detail fields      | text (not required)      | Optional descriptive fields                                |

---

## Checklist

> Track your progress in [`_checklist.md`](./_checklist.md#phase-3-detail-fields).

---

## Key Files

| File                          | Purpose           |
| ----------------------------- | ----------------- |
| `src/collections/Products.ts` | Add detail fields |

---

## Reference

- [Payload Number Field](https://payloadcms.com/docs/fields/number)
- [Payload Text Field](https://payloadcms.com/docs/fields/text)

---

## Definition of Done

- [ ] Length field with validation (1-9m, step 0.1)
- [ ] Blouse type text field
- [ ] Pallu details text field
- [ ] Border type text field
- [ ] Weave pattern text field
- [ ] Occasion text field
- [ ] Unit tests for length validation
- [ ] `make typecheck` passes
- [ ] `make lint` passes

---

**Navigation:** [← Phase 2: Saree-Specific Selects](./02-phase-saree-selects.md) — ↑ [Overview](./README.md) — **Next →** [Phase 4: Testing & Verification](./04-phase-testing-verification.md)
