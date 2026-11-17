---
name: git-push-reporter
description: Automated audit, documentation, and standalone interactive HTML report generator for every Git push.
---

# Git Push HTML Reporter Skill

This skill documents and audits code changes before and during git push actions.

## Workflow
1. Inspect the git diff and commit log: `git log -n 1 --stat` and `git diff HEAD~1`.
2. Extract:
   - Commit SHA, Branch name, Author, Timestamp.
   - Purpose & Business Rationale (Why).
   - Categorized file additions & modifications (What).
   - Code deep dive into primary files.
   - Security, dependencies, and build verification.
3. Generate the push audit report:
   - Save standalone **HTML Report** in `docs/push-reports/` using the Wealth Command luxury styling (Tailwind CSS, dark slate, gold accents, responsive cards).
4. Present the report and file link to the user.
