# Master Implementation Checklist

## Phase 1: Role Schema Update

[↑ Phase Overview](./01-phase-role-schema-update.md)

### 1.1 Role options update

- [x] Add `super-admin` to role select options
- [x] Order options: super-admin, admin, editor, content-manager

### 1.2 Field-level access

- [x] Update role field access so only super-admin can change role assignments

---

## Phase 2: Access Control Updates

[↑ Phase Overview](./02-phase-access-control-updates.md)

### 2.1 Create access

- [x] Super-admin: can create any user (all roles)
- [x] Admin: can create non-super-admin users
- [x] Admin: cannot create super-admin users
- [x] Editor/Content-manager: cannot create (rejected)

### 2.2 Read access

- [x] Super-admin: can read all users
- [x] Admin: can read all users
- [x] Editor/Content-manager: can read only own profile
- [x] Unauthenticated: rejected

### 2.3 Update access

- [x] Super-admin: can update any user
- [x] Admin: can update non-super-admin users
- [x] Admin: cannot update super-admin users
- [x] Editor/Content-manager: can update own profile (name only, role blocked by field-level)
- [x] Unauthenticated: rejected

### 2.4 Delete access

- [x] Super-admin: can delete any user
- [x] Admin: can delete non-super-admin users
- [x] Admin: cannot delete super-admin users
- [x] Editor/Content-manager: cannot delete (rejected)

---

## Phase 3: Testing & Verification

[↑ Phase Overview](./03-phase-testing-verification.md)

### 3.1 Role schema tests

- [x] Test: role field has 4 options including super-admin
- [x] Test: default role is 'editor'
- [x] Test: super-admin value is 'super-admin'

### 3.2 Create access tests

- [x] Test: super-admin can create users (returns true)
- [x] Test: admin can create editor/content-manager/admin (returns true)
- [x] Test: admin cannot create super-admin (returns false)
- [x] Test: editor cannot create (returns false)

### 3.3 Read access tests

- [x] Test: super-admin reads all (returns true)
- [x] Test: admin reads all (returns true)
- [x] Test: editor reads own profile (returns constraint)
- [x] Test: unauthenticated user rejected (returns false)

### 3.4 Update access tests

- [x] Test: super-admin updates any user (returns true)
- [x] Test: admin updates non-super-admin (returns true)
- [x] Test: admin cannot update super-admin (returns false)
- [x] Test: editor updates own profile (returns constraint)

### 3.5 Delete access tests

- [x] Test: super-admin deletes any user (returns true)
- [x] Test: admin deletes non-super-admin (returns true)
- [x] Test: admin cannot delete super-admin (returns false)
- [x] Test: editor cannot delete (returns false)

### 3.6 Full suite verification

- [x] `make test` — all tests pass
- [x] `make typecheck` — no type errors
- [x] `make lint` — no lint errors
