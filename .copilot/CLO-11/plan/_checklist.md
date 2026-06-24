# Master Implementation Checklist

## Phase 1: Foundation Fields

[↑ Phase Overview](./01-phase-foundation-fields.md)

### 1.1 Collection creation

- [ ] Create `src/collections/Products.ts` with slug, admin, timestamps
- [ ] Add name field (text, required)
- [ ] Add slug field (text, unique, indexed, admin.readOnly)
- [ ] Add description field (richText, Lexical)
- [ ] Add status field (select: draft/published/archived, default=draft)

### 1.2 Slug generation

- [ ] Add beforeChange hook to auto-generate slug from name
- [ ] Slug logic: lowercase, spaces→dashes, special chars removed, trimmed

### 1.3 Registration

- [ ] Register Products in `src/payload.config.ts` collections array

---

## Phase 2: Saree-Specific Selects

[↑ Phase Overview](./02-phase-saree-selects.md)

### 2.1 Fabric field

- [ ] Add fabric select field (required)
- [ ] Options: silk, cotton, linen, georgette, chiffon, crepe, velvet, net, blend

### 2.2 Weave field

- [ ] Add weave select field (required)
- [ ] Options: banarasi, kanchipuram, bandhani, patola, kalamkari, ikkat, paithani, maheshwari, chanderi, tant, baluchari

### 2.3 Pattern field

- [ ] Add pattern select field (required)
- [ ] Options: solid, printed, embroidered, embellished, painted

---

## Phase 3: Detail Fields

[↑ Phase Overview](./03-phase-detail-fields.md)

### 3.1 Numeric field

- [ ] Add length field (number, min=1, max=9, step=0.1, admin.suffix='meters')

### 3.2 Text detail fields

- [ ] Add blouseType text field
- [ ] Add palluDetails text field
- [ ] Add borderType text field
- [ ] Add weavePattern text field

### 3.3 Occasion field

- [ ] Add occasion text field (placeholder for CLO-23 relationship)

---

## Phase 4: Testing & Verification

[↑ Phase Overview](./04-phase-testing-verification.md)

### 4.1 Collection structure

- [ ] Test: collection slug is 'products'
- [ ] Test: useAsTitle is 'name'
- [ ] Test: admin group is 'Products'

### 4.2 Field existence

- [ ] Test: all 12 fields present with correct types

### 4.3 Select fields

- [ ] Test: fabric has 9 options
- [ ] Test: weave has 11 options
- [ ] Test: pattern has 5 options
- [ ] Test: status has 3 options (draft, published, archived)

### 4.4 Slug generation

- [ ] Test: generates lowercase slug from name
- [ ] Test: replaces spaces with dashes
- [ ] Test: removes special characters

### 4.5 Length validation

- [ ] Test: min value is 1
- [ ] Test: max value is 9
- [ ] Test: step is 0.1

### 4.6 Full suite

- [ ] `make test` — all tests pass
- [ ] `make typecheck` — no type errors
- [ ] `make lint` — no lint errors
