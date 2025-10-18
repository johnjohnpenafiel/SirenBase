# Architectural Changes Rule Addition - SirenBase Project

**Date**: October 17, 2025
**Decision**: Add explicit rule to CLAUDE.md for handling architectural changes

---

## Context

During Phase 1 (Database Schema Design), soft delete fields (`is_removed`, `removed_at`, `removed_by`) were added to the Item model without:
1. Updating PLANNING.md to reflect the changes
2. Getting explicit user confirmation before implementation

This created documentation drift where the implemented code didn't match PLANNING.md's documented schema.

---

## The Problem

### What Went Wrong

**Phase 1 Implementation:**
- PLANNING.md documented items table as: `(id, name, code, added_by, added_at)`
- Actually implemented: `(id, name, code, added_by, added_at, is_removed, removed_at, removed_by)`
- Soft delete fields were added during implementation but never documented

**Existing CLAUDE.md Rule:**
- "Keep `PLANNING.md` current with architectural decisions"
- Too vague - didn't specify WHEN to update (before? after? during?)
- Didn't require user confirmation for new features
- Didn't enforce documentation before commits

### Why This Happened

1. **Ambiguous timing** - Rule said "keep current" but didn't specify workflow
2. **No approval checkpoint** - AI could add features without asking
3. **No verification step** - Nothing enforced docs matching code before commit

---

## The Solution

### New Rule Added to CLAUDE.md

Added comprehensive "Architectural Changes" section under Code Structure Principles with clear 4-step workflow:

#### 1. Before Implementation - ASK FOR APPROVAL
```
If feature is NOT in PLANNING.md:
- STOP
- Explain what you want to add and why
- Wait for explicit user confirmation
- Do NOT proceed without approval
```

#### 2. After Approval - IMPLEMENT
```
- Write the code
- Test to ensure it works
```

#### 3. Immediately After - UPDATE DOCS
```
BEFORE moving to next task:
- Update PLANNING.md with architectural decisions
- Update TASKS.md to reflect completed work
- Ensure documentation matches implementation
```

#### 4. Before Commit - VERIFY
```
- PLANNING.md reflects ALL implemented features
- TASKS.md is up to date
- No orphaned features (code without docs)
```

---

## Why This Workflow Works

### Balances Two Competing Needs:

**1. Implementation Flexibility (Why Not Document First)**
- User might change mind during implementation
- Implementation might reveal issues requiring design changes
- Don't want to rewrite docs multiple times
- Real-world testing validates design decisions

**2. Documentation Accuracy (Why Document Immediately After)**
- Prevents orphaned features
- Creates approval checkpoints
- Maintains PLANNING.md as source of truth
- Ensures team alignment

### The Compromise:
- **ASK FIRST** - Get user approval for new features
- **IMPLEMENT** - Build and test with flexibility to adjust
- **DOCUMENT IMMEDIATELY** - Update docs before moving on
- **VERIFY BEFORE COMMIT** - No inconsistencies allowed

---

## What Changed in CLAUDE.md

### Location
Added new subsection under "Code Structure Principles" (after Naming Conventions, before Testing Strategy)

### Content Added
```markdown
### Architectural Changes (Database Schema, New Features)

**CRITICAL RULE**: Never implement architectural changes without proper documentation workflow.

#### Before Implementing Features NOT in PLANNING.md:
1. STOP and Ask User for Confirmation
2. After User Approval: Implement the feature
3. Immediately After Implementation (BEFORE next task): Update docs
4. Before Committing: Verify consistency

#### Examples of Architectural Changes:
- Adding new database tables or columns
- Adding new fields to existing models
- Changing data types or relationships
- Adding new validation rules or business logic
- Changing API contracts or endpoints
```

---

## Examples of When This Rule Applies

### ✅ SHOULD Ask for Approval:
- Adding `category` field to Item model (not in PLANNING.md)
- Adding soft delete fields (`is_removed`, etc.) to Item model
- Creating new database table
- Adding new API endpoint
- Changing data type of existing field
- Adding new validation rule

### ❌ Does NOT Require Approval:
- Refactoring internal function (same behavior)
- Fixing bugs
- Improving code comments
- Formatting code
- Adding tests for existing features
- Performance optimizations that don't change API

---

## Expected Behavior Going Forward

### Scenario: AI Wants to Add New Field

**Before (Old Behavior):**
```
AI: "I'll add the category field to the Item model..."
[implements code]
[maybe updates docs, maybe doesn't]
[commits]
```

**After (New Behavior):**
```
AI: "I want to add a 'category' field to the Item model for organizing
     inventory. This will:
     - Help users filter items by type
     - Be a String field with dropdown validation
     - Not be in PLANNING.md currently

     Should I proceed?"

User: "Yes, but let's use option 1 (string + validation)"

AI: [implements feature]
AI: [IMMEDIATELY updates PLANNING.md]
AI: [IMMEDIATELY updates TASKS.md]
AI: [verifies consistency before commit]
AI: [commits with docs up to date]
```

---

## Success Criteria

### This Rule is Working If:
- ✅ No features exist in code but not in PLANNING.md
- ✅ All architectural changes have user approval
- ✅ PLANNING.md always reflects actual implementation
- ✅ Clear decision trail for why features were added
- ✅ User maintains control over feature additions

### This Rule is Failing If:
- ❌ Code implements features not in PLANNING.md
- ❌ AI adds features without asking
- ❌ Documentation lags behind implementation
- ❌ User discovers surprise features in commits

---

## Related Documents

- **PLANNING.md** - Source of truth for architecture
- **TASKS.md** - Task tracking and completion status
- **CATEGORY_FIELD_DECISION.md** - Example of proper architectural decision documentation
- **DOCKER_DECISION.md** - Previous example of documenting architectural decisions

---

## Action Items

- [x] Add "Architectural Changes" section to CLAUDE.md
- [x] Document this decision in UpdateLogs
- [ ] Apply this rule going forward to category field addition
- [ ] Retroactively update PLANNING.md for Phase 1 soft delete fields
- [ ] Ensure all future changes follow this workflow

---

## Lessons Learned

1. **Explicit is better than implicit** - "Keep docs current" is too vague
2. **Workflows need steps** - Clear 1-2-3-4 process prevents confusion
3. **Checkpoints matter** - Approval and verification steps catch mistakes
4. **Implementation flexibility is valuable** - Don't lock in decisions too early
5. **Documentation debt compounds** - Fix inconsistencies immediately

---

**Conclusion**: This rule creates a clear workflow that balances implementation flexibility with documentation accuracy. By requiring approval before implementation and documentation before commits, we prevent the documentation drift that occurred in Phase 1.
