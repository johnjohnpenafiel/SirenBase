# Backend Feature Completion Checklist

**MANDATORY**: Check ALL items before marking any feature complete in TASKS.md.

**Purpose**: Enforces root CLAUDE.md's "Generate tests alongside code" requirement.

---

## ✅ Testing (CRITICAL - NO EXCEPTIONS)

- [ ] **Pytest test file created** in `tests/test_<feature>.py`
- [ ] **Unit tests** for models/utilities (e.g., `User.set_pin()`, `generate_unique_code()`)
- [ ] **Integration tests** for API endpoints covering:
  - Success cases (200, 201)
  - Error cases (400, 401, 403, 404, 409, 500)
  - Authorization (JWT required, role-based access)
  - Input validation (invalid data rejected)
- [ ] **All tests pass** (`pytest` runs clean)
- [ ] **Manual verification** done (curl/Postman)

## ✅ Code Standards

- [ ] **Follows backend/CLAUDE.md** (PEP8, type hints, docstrings, error handling)
- [ ] **Under 500 lines** per file
- [ ] **Database sessions** handled (commit/rollback in try/except)

## ✅ Security

- [ ] **Server-side validation** on all endpoints
- [ ] **No secrets hardcoded** (uses environment variables)
- [ ] **No PII in logs** (partner numbers protected)
- [ ] **Auth/authz correct** (`@jwt_required()`, `@admin_required`)

## ✅ Documentation

- [ ] **API documented** (request/response examples in docstring)
- [ ] **TASKS.md updated** with completion date
- [ ] **PLANNING.md updated** if architectural changes made

---

## Example: Completing an Auth Endpoint

✅ **Good Example** (all criteria met):
```
✓ Implemented POST /api/auth/login route
✓ Created tests/test_auth.py with:
  - test_login_success()
  - test_login_invalid_credentials()
  - test_login_missing_fields()
  - test_login_validation_errors()
✓ All tests passing (pytest)
✓ Manual curl verification done
✓ Docstrings with request/response examples
✓ TASKS.md marked complete with date
```

❌ **Bad Example** (missing tests):
```
✓ Implemented POST /api/auth/login route
✓ Manual curl verification done
✗ No pytest tests created  ← INCOMPLETE!
✗ TASKS.md marked complete  ← WRONG!
```

---

## When in Doubt

If you're unsure whether a feature is complete, ask yourself:

1. **Can someone else run `pytest` and verify my code works?**
   - If NO → Feature is NOT complete
2. **Did I document what this endpoint does and how to use it?**
   - If NO → Feature is NOT complete
3. **Will this break if I refactor something later?**
   - If YES and no tests → Feature is NOT complete

---

## Exceptions (Rare)

The ONLY acceptable reasons to skip automated tests:

1. **Proof of Concept (POC)** - Explicitly marked as throwaway code
2. **Spike/Research** - Exploratory work that won't be merged
3. **External Dependency Issues** - Cannot mock third-party service (document why)

**In all cases**: Get explicit user approval before skipping tests.

---

**Last Updated**: October 23, 2025
**Enforces**: Root CLAUDE.md "Generate tests alongside code" requirement
