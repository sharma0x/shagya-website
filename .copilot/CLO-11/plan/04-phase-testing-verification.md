# Phase 4: Testing & Verification

**Milestone:** All tests pass — Comprehensive tests for the Products collection covering all fields, validation, and slug generation.

---

## Overview

Write comprehensive unit tests verifying the Products collection configuration: all fields exist with correct types, select options are complete, slug generation works correctly, length validation is enforced, and the collection is properly registered.

### What we'll build

```
src/collections/__tests__/Products.test.ts (new)
├── Collection structure tests
│   ├── has correct slug
│   ├── uses name as title
│   └── is in Products admin group
├── Field existence tests
│   ├── all 12 fields present
│   └── correct types assigned
├── Select fields tests
│   ├── fabric: 9 options
│   ├── weave: 11 options
│   ├── pattern: 5 options
│   └── status: 3 options
├── Slug generation tests
│   ├── generates lowercase slug
│   ├── replaces spaces with dashes
│   └── removes special characters
├── Length validation tests
│   ├── min value is 1
│   ├── max value is 9
│   └── step is 0.1
└── Registration test
    └── Products registered in payload.config.ts
```

### Key decisions

| Decision           | Choice                                       | Rationale               |
| ------------------ | -------------------------------------------- | ----------------------- |
| Test framework     | Vitest                                       | Already configured      |
| Test file location | `src/collections/__tests__/Products.test.ts` | Co-located              |
| Slug test approach | Test hook function directly                  | Unit test, no DB needed |

---

## Checklist

> Track your progress in [`_checklist.md`](./_checklist.md#phase-4-testing--verification).

---

## Key Files

| File                                         | Purpose               |
| -------------------------------------------- | --------------------- |
| `src/collections/__tests__/Products.test.ts` | Unit tests            |
| `src/collections/Products.ts`                | Collection under test |

---

## Definition of Done

- [ ] All collection structure tests pass
- [ ] All field existence tests pass
- [ ] All select options tests pass (fabric, weave, pattern, status)
- [ ] Slug generation tests pass
- [ ] Length validation tests pass
- [ ] Registration test passes
- [ ] `make test` — all tests pass
- [ ] `make typecheck` — no type errors
- [ ] `make lint` — no lint errors

---

**Navigation:** [← Phase 3: Detail Fields](./03-phase-detail-fields.md) — ↑ [Overview](./README.md)
