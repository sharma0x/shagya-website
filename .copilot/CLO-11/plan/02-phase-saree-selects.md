# Phase 2: Saree-Specific Selects

**Milestone:** Fabric, weave, pattern — Three select fields with all Indian saree-specific textile options.

---

## Overview

Add the three main saree classification select fields: fabric (material type), weave (Indian regional weave style), and pattern (surface design). These are the key filtering dimensions for saree shopping.

### What we'll build

```
src/collections/Products.ts (modified)
└── fields (add):
    ├── fabric: select (required)
    │   └── options: silk, cotton, linen, georgette, chiffon, crepe, velvet, net, blend
    ├── weave: select (required)
    │   └── options: banarasi, kanchipuram, bandhani, patola, kalamkari, ikkat, paithani, maheshwari, chanderi, tant, baluchari
    └── pattern: select (required)
        └── options: solid, printed, embroidered, embellished, painted
```

### Key decisions

| Decision     | Choice          | Rationale                                    |
| ------------ | --------------- | -------------------------------------------- |
| Field type   | select          | Fixed set of known values; enables filtering |
| All required | yes             | Every saree has fabric, weave, pattern       |
| Labels       | Title Case      | "Banarasi" not "banarasi" for admin UI       |
| Values       | lowercase kebab | Consistent with project conventions          |

---

## Checklist

> Track your progress in [`_checklist.md`](./_checklist.md#phase-2-saree-specific-selects).

---

## Key Files

| File                          | Purpose                           |
| ----------------------------- | --------------------------------- |
| `src/collections/Products.ts` | Add fabric, weave, pattern fields |

---

## Reference

- [Payload Select Field](https://payloadcms.com/docs/fields/select)

---

## Definition of Done

- [ ] Fabric select with all 9 options added
- [ ] Weave select with all 11 options added
- [ ] Pattern select with all 5 options added
- [ ] All three fields marked as required
- [ ] Unit tests verify all options are present
- [ ] `make typecheck` passes
- [ ] `make lint` passes

---

**Navigation:** [← Phase 1: Foundation Fields](./01-phase-foundation-fields.md) — ↑ [Overview](./README.md) — **Next →** [Phase 3: Detail Fields](./03-phase-detail-fields.md)
